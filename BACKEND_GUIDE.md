# SkillSwap — Backend Guide

A plain-English explanation of everything that was built, how it works,
and how to set it up. Read this top-to-bottom before touching any code.

---

## What was built

Your frontend already had beautiful UI with **fake/mock data** hardcoded
in `lib/data.ts`. The backend replaces that fake data with a real
MongoDB database and adds user authentication via Google.

---

## The Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Database | **MongoDB Atlas** | Flexible documents, free tier, works great with Next.js |
| Auth | **NextAuth v4 + Google OAuth** | Sign in with Google in ~20 lines of config |
| API | **Next.js API Routes** | Already in your project, deploys to Vercel for free |
| Hosting | **Vercel** | Zero-config deployment for Next.js apps |

---

## File Map — What Each File Does

```
lib/mongodb.ts                      → Connects to MongoDB (reused across requests)
models/types.ts                     → TypeScript types for all database documents
types/next-auth.d.ts                → Adds user.id to the session type

app/api/auth/[...nextauth]/route.ts → Google login, creates user on first sign-in
app/api/offers/route.ts             → GET (browse/search) + POST (create offer)
app/api/offers/[id]/route.ts        → GET (single offer) + PATCH (edit) + DELETE
app/api/requests/route.ts           → GET (my requests) + POST (send request)
app/api/requests/[id]/route.ts      → PATCH (accept/reject) + DELETE (withdraw)
app/api/messages/route.ts           → GET (poll for new messages) + POST (send)
app/api/notifications/route.ts      → GET (fetch) + PATCH (mark as read)
app/api/reviews/route.ts            → GET (user's reviews) + POST (submit review)
app/api/users/me/route.ts           → GET (my profile) + PATCH (update profile)
app/api/users/me/stats/route.ts     → GET (dashboard stat cards)
app/api/users/[id]/route.ts         → GET (any user's public profile)
app/api/saved/route.ts              → GET/POST/DELETE (save/unsave offers)

scripts/seed.ts                     → Populates the database with all mock data
.env.example                        → Template for all environment variables
```

---

## Database Collections (Tables)

MongoDB stores data in **collections** (like tables in SQL). Here are all 7:

### `users`
Every person who signs up. Created automatically when they first log in with Google.
Key fields: `name`, `email`, `image` (from Google), `handle`, `area`, `skillsOffered`, `skillsWanted`, `rating`, `completedSwaps`

### `offers`
The skill-swap listings (e.g. "I'll teach React, looking for a logo").
Key fields: `title`, `ownerId`, `offers`, `wants`, `category`, `status`, `views`, `saves`, `requests`

### `swapRequests`
When someone clicks "Send swap request" on an offer.
Key fields: `offerId`, `fromId` (sender), `toId` (offer owner), `message`, `status`

Status lifecycle: `sent` → `negotiating` → `accepted` or `rejected`

### `messages`
Individual chat messages between two users about a specific offer.
Key fields: `conversationId`, `fromId`, `toId`, `text`, `read`

A `conversationId` looks like: `"dev_maya_react-for-logo"` (sorted user IDs + offer ID)

### `notifications`
In-app alerts (bell icon in the nav).
Key fields: `userId` (who receives it), `type`, `title`, `body`, `read`, `link`
Types: `request` | `message` | `review` | `swap` | `system`

### `reviews`
Star ratings left after a completed swap.
Key fields: `toId` (who is reviewed), `fromId` (reviewer), `rating` (1-5), `text`, `skill`

After each review, the user's average rating is automatically recalculated.

### `savedOffers`
Tracks which offers each user has bookmarked (the "Save" button).
Key fields: `userId`, `offerId`

---

## API Reference — Every Endpoint

### Authentication
| Method | Path | What it does |
|---|---|---|
| GET | `/api/auth/signin` | Redirects to Google login |
| GET | `/api/auth/callback/google` | Google redirects here after login |
| GET | `/api/auth/session` | Returns the current session (used by NextAuth) |

### Offers
| Method | Path | What it does |
|---|---|---|
| GET | `/api/offers` | Browse offers (with filters: `?category=Design&mode=online&q=react`) |
| POST | `/api/offers` | Create a new offer (must be logged in) |
| GET | `/api/offers/:id` | Get single offer + increment view count |
| PATCH | `/api/offers/:id` | Edit offer (owner only) |
| DELETE | `/api/offers/:id` | Delete offer (owner only) |

### Swap Requests
| Method | Path | What it does |
|---|---|---|
| GET | `/api/requests` | Get all your requests (incoming + sent) |
| POST | `/api/requests` | Send a swap request |
| PATCH | `/api/requests/:id` | Accept / reject / negotiate |
| DELETE | `/api/requests/:id` | Withdraw a pending request |

### Messages (Chat)
| Method | Path | What it does |
|---|---|---|
| GET | `/api/messages?conversationId=xxx` | Fetch messages (poll every 3s) |
| POST | `/api/messages` | Send a message |

### Notifications
| Method | Path | What it does |
|---|---|---|
| GET | `/api/notifications` | Get notifications + unread count |
| PATCH | `/api/notifications` | Mark all as read |
| PATCH | `/api/notifications?id=xxx` | Mark one as read |

### Reviews
| Method | Path | What it does |
|---|---|---|
| GET | `/api/reviews?userId=xxx` | Get all reviews for a user |
| POST | `/api/reviews` | Submit a review |

### Users / Profile
| Method | Path | What it does |
|---|---|---|
| GET | `/api/users/me` | Your full profile |
| PATCH | `/api/users/me` | Update your profile |
| GET | `/api/users/me/stats` | Dashboard stats (offer count, pending requests, etc.) |
| GET | `/api/users/:id` | Any user's public profile (by MongoDB ID or handle) |

### Saved Offers
| Method | Path | What it does |
|---|---|---|
| GET | `/api/saved` | Your saved offers |
| POST | `/api/saved` | Save an offer |
| DELETE | `/api/saved?id=xxx` | Unsave an offer |

---

## How Messaging Works (Polling)

Your UI has a chat panel in the SwapWorkspace. Since Vercel doesn't support
long-lived websocket connections, we use **polling** instead:

1. The SwapWorkspace component calls `GET /api/messages?conversationId=xxx` every 3 seconds
2. It passes `?after=<timestamp>` so it only fetches NEW messages since last check
3. When you send a message, POST `/api/messages` — it saves to DB and creates a notification
4. The recipient's poll picks up the new message within 3 seconds

This is simple, works on Vercel, and is plenty fast for a chat that doesn't
need millisecond latency.

---

## How Authentication Works

1. User clicks "Sign in with Google" (your `AuthForm` component)
2. NextAuth redirects to Google's login page
3. User approves → Google sends back a profile (name, email, photo)
4. NextAuth calls our `signIn` callback:
   - First time? → Creates a new `UserDoc` in MongoDB
   - Returning? → Updates their name/photo in case Google changed them
5. NextAuth creates a **JWT cookie** (no database session needed)
6. Every API route calls `getServerSession()` to read `session.user.id`

---

## Setup Instructions

### Step 1 — Install new packages
```bash
pnpm add mongodb next-auth dotenv
pnpm add -D tsx
```

### Step 2 — Copy the backend files
Copy all files from this folder into your existing SkillSwap project,
maintaining the same folder structure.

### Step 3 — Set up MongoDB Atlas
1. Go to https://cloud.mongodb.com and create a free account
2. Create a new **free tier (M0)** cluster
3. Create a database user with a password
4. Whitelist your IP (or use 0.0.0.0/0 for all IPs)
5. Click "Connect" → "Drivers" → copy the connection string

### Step 4 — Set up Google OAuth
1. Go to https://console.cloud.google.com
2. Create a project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web Application)
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

### Step 5 — Create .env.local
```bash
cp .env.example .env.local
# Then edit .env.local and fill in all the values
```

### Step 6 — Seed the database
```bash
pnpm seed
# This inserts all mock users, offers, requests, messages etc.
# You'll see: "🎉 Database seeded successfully!"
```

### Step 7 — Run the app
```bash
pnpm dev
# Open http://localhost:3000
# Click "Sign in with Google" — it will work!
```

---

## Questions You Might Have

**Q: What happens when I sign in with Google — do I become "Maya"?**
No. You get your own new user account. The seeded users (Maya, Devon etc.)
are separate demo accounts in the database. To test as them you'd need to
sign in with their actual Google accounts, or modify the seed script to
add your email as one of the users.

**Q: How does the frontend know which API to call?**
Right now your UI reads from `lib/data.ts`. You need to update each component
to call the API routes instead. For example, `browse-client.tsx` should call
`fetch("/api/offers?category=Design")` instead of filtering `OFFERS` array.

**Q: What is a `conversationId` exactly?**
It's a string that uniquely identifies the chat between two users about one offer.
Format: `[smaller_userId]_[larger_userId]_[offerId]`
The user IDs are sorted alphabetically so both users generate the same string.
Example: `"dev_maya_react-for-logo"`

**Q: Can I add more offer categories?**
Yes — update the `Category` type in `models/types.ts` and re-run `pnpm seed`.

**Q: How do I deploy to Vercel?**
```bash
npx vercel
# Then in Vercel dashboard → Settings → Environment Variables
# Add all variables from .env.example with production values
# Change NEXTAUTH_URL to your vercel URL
# Add production redirect URI in Google Cloud Console
```
