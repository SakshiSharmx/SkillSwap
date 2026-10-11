# SkillSwap Backend Guide

The backend uses a deliberately simple stack so it is easy to understand and maintain:

- Next.js App Router API routes
- Supabase PostgreSQL
- `pg` for parameterized SQL
- JWT in an HTTP-only cookie
- bcrypt for password hashing
- Zod for request validation

## Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase_schema.sql` from this project.
4. Copy `.env.example` to `.env.local`.
5. Add your `DATABASE_URL` and a strong `JWT_SECRET`.
6. Run `npm install`.
7. Run `npm run dev`.

## Authentication flow

Register → validate with Zod → hash password with bcrypt → store user → create JWT → HTTP-only cookie.

Login → find user → compare password with bcrypt → create JWT → HTTP-only cookie.

Protected API → read JWT cookie → verify JWT → load user → perform authorization check.

## API structure

`app/api/auth/*` handles authentication.

`app/api/offers/*` handles offers, search, filtering, pagination, ownership checks.

`app/api/requests/*` handles swap requests and status changes.

`app/api/messages` handles simple polling-based conversations.

`app/api/notifications` handles in-app notifications.

`app/api/reviews` handles reviews and recalculates ratings.

`app/api/saved` handles saved offers.

`app/api/users/*` handles profiles and dashboard statistics.

## Why there is no Redis/RabbitMQ yet

Those tools are useful when the application actually needs caching, background jobs, or high-volume asynchronous work. Adding them only to make the technology list longer would make this project harder to learn and maintain. They can be introduced later when there is a real feature that benefits from them.
