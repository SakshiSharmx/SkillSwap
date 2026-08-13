// scripts/seed.ts
// ─────────────────────────────────────────────────────────────────────────────
// Seeds your MongoDB Atlas database with all the mock data from lib/data.ts
// so the app works immediately after setup.
//
// RUN WITH:
//   npx ts-node --project tsconfig.json scripts/seed.ts
//   (or: npx tsx scripts/seed.ts  if you have tsx installed)
//
// WHAT IT DOES
// 1. Connects to MongoDB using MONGODB_URI from .env.local
// 2. Drops and recreates each collection (safe to re-run)
// 3. Inserts all users, offers, requests, messages, notifications, reviews
// 4. Creates all necessary indexes for fast queries and full-text search
// ─────────────────────────────────────────────────────────────────────────────

import * as dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGODB_URI!
const DB  = process.env.MONGODB_DB ?? "skillswap"

// ─── Seed data (translated from lib/data.ts) ─────────────────────────────────

const now = new Date()

const USERS = [
  {
    _id:            "maya",
    name:           "Maya Okonkwo",
    handle:         "mayao",
    email:          "maya@example.com",
    image:          "/avatars/maya.png",
    googleId:       "seed_maya",
    area:           "Greenpoint, Brooklyn",
    community:      "Pratt Institute",
    rating:         4.9,
    reviewCount:    38,
    completedSwaps: 41,
    responseRate:   98,
    verified:       true,
    bio:            "Product designer who loves teaching the fundamentals of brand and type.",
    skillsOffered:  ["Logo design", "Brand identity", "Figma basics"],
    skillsWanted:   ["React", "Webflow", "Spanish"],
    memberSince:    new Date("2023-03-01"),
    updatedAt:      now,
  },
  {
    _id:            "dev",
    name:           "Devon Reyes",
    handle:         "devr",
    email:          "devon@example.com",
    image:          "/avatars/devon.png",
    googleId:       "seed_dev",
    area:           "Mission District, SF",
    community:      "Neighborhood",
    rating:         4.8,
    reviewCount:    52,
    completedSwaps: 60,
    responseRate:   95,
    verified:       true,
    bio:            "Front-end engineer. Happy to pair on React or TypeScript.",
    skillsOffered:  ["React", "TypeScript", "Interview prep"],
    skillsWanted:   ["Cooking", "Guitar", "Photography"],
    memberSince:    new Date("2022-01-01"),
    updatedAt:      now,
  },
  {
    _id:            "amira",
    name:           "Amira Haddad",
    handle:         "amirah",
    email:          "amira@example.com",
    image:          "/avatars/amira.png",
    googleId:       "seed_amira",
    area:           "Camden, London",
    community:      "UCL",
    rating:         5.0,
    reviewCount:    21,
    completedSwaps: 19,
    responseRate:   100,
    verified:       true,
    bio:            "Native Arabic speaker and amateur chef.",
    skillsOffered:  ["Arabic", "Home cooking", "Meal prep"],
    skillsWanted:   ["UI design", "Branding", "Photography"],
    memberSince:    new Date("2023-09-01"),
    updatedAt:      now,
  },
  {
    _id:            "tomas",
    name:           "Tomás Lindqvist",
    handle:         "tomasl",
    email:          "tomas@example.com",
    image:          "/avatars/tomas.png",
    googleId:       "seed_tomas",
    area:           "Södermalm, Stockholm",
    community:      "Neighborhood",
    rating:         4.7,
    reviewCount:    30,
    completedSwaps: 33,
    responseRate:   91,
    verified:       false,
    bio:            "Studio guitarist and producer.",
    skillsOffered:  ["Guitar", "Music production", "Mixing"],
    skillsWanted:   ["Personal training", "Running coaching"],
    memberSince:    new Date("2022-06-01"),
    updatedAt:      now,
  },
  {
    _id:            "priya",
    name:           "Priya Nair",
    handle:         "priyan",
    email:          "priya@example.com",
    image:          "/avatars/priya.png",
    googleId:       "seed_priya",
    area:           "Koramangala, Bangalore",
    community:      "Christ University",
    rating:         4.9,
    reviewCount:    44,
    completedSwaps: 47,
    responseRate:   97,
    verified:       true,
    bio:            "Maths tutor and certified yoga instructor.",
    skillsOffered:  ["Calculus tutoring", "Yoga", "Meditation"],
    skillsWanted:   ["French", "Video editing"],
    memberSince:    new Date("2023-02-01"),
    updatedAt:      now,
  },
  {
    _id:            "leo",
    name:           "Leo Martins",
    handle:         "leom",
    email:          "leo@example.com",
    image:          "/avatars/leo.png",
    googleId:       "seed_leo",
    area:           "Lapa, Lisbon",
    community:      "Neighborhood",
    rating:         4.6,
    reviewCount:    18,
    completedSwaps: 15,
    responseRate:   88,
    verified:       false,
    bio:            "Photographer and editor.",
    skillsOffered:  ["Portrait photography", "Lightroom", "Photo editing"],
    skillsWanted:   ["HTML & CSS", "Webflow"],
    memberSince:    new Date("2023-11-01"),
    updatedAt:      now,
  },
]

const OFFERS = [
  {
    _id:          "react-for-logo",
    title:        "I'll teach you React, looking for a logo",
    category:     "Development",
    ownerId:      "dev",
    offers:       "React & TypeScript",
    wants:        "Logo design",
    mode:         "online",
    location:     "Online",
    level:        "Intermediate",
    tags:         ["React", "Frontend", "TypeScript"],
    description:  "I've shipped React apps professionally for six years. Over a few sessions I'll get you comfortable with components, hooks, and state.",
    terms:        "Roughly 3 sessions of 1 hour each, swapped for one finished logo with two revisions.",
    availability: "Weekday evenings, EST",
    status:       "active",
    views:        184,
    saves:        23,
    requests:     6,
    createdAt:    new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "arabic-for-design",
    title:        "Conversational Arabic in exchange for UI help",
    category:     "Languages",
    ownerId:      "amira",
    offers:       "Arabic conversation",
    wants:        "UI design feedback",
    mode:         "both",
    location:     "Camden, London",
    level:        "Beginner",
    tags:         ["Arabic", "Languages", "Conversation"],
    description:  "Native speaker offering relaxed conversational Arabic, tailored to whatever you need.",
    terms:        "Weekly 45-min conversation sessions traded for a design review each week.",
    availability: "Weekends, GMT",
    status:       "active",
    views:        92,
    saves:        14,
    requests:     3,
    createdAt:    new Date(Date.now() - 5 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "guitar-for-training",
    title:        "Guitar lessons, want a running coach",
    category:     "Music",
    ownerId:      "tomas",
    offers:       "Guitar & theory",
    wants:        "Running coaching",
    mode:         "in-person",
    location:     "Södermalm, Stockholm",
    level:        "Beginner",
    tags:         ["Guitar", "Music", "Beginner-friendly"],
    description:  "From your first chords to playing full songs. I keep lessons practical and fun.",
    terms:        "One guitar lesson per week for one coached run per week.",
    availability: "Tuesday & Thursday mornings",
    status:       "active",
    views:        67,
    saves:        9,
    requests:     2,
    createdAt:    new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "maths-for-french",
    title:        "Calculus tutoring for French practice",
    category:     "Tutoring",
    ownerId:      "priya",
    offers:       "Calculus & maths",
    wants:        "French conversation",
    mode:         "online",
    location:     "Online",
    level:        "Advanced",
    tags:         ["Maths", "Calculus", "Exam prep"],
    description:  "Stuck on limits, derivatives, or integrals? I break things down patiently until they click.",
    terms:        "Two tutoring sessions traded for two French chats each week.",
    availability: "Flexible, IST",
    status:       "active",
    views:        143,
    saves:        31,
    requests:     8,
    createdAt:    new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "photo-for-code",
    title:        "Portrait shoot for help building my website",
    category:     "Photography",
    ownerId:      "leo",
    offers:       "Portrait photography",
    wants:        "HTML & CSS",
    mode:         "in-person",
    location:     "Lapa, Lisbon",
    level:        "Intermediate",
    tags:         ["Photography", "Portraits", "Editing"],
    description:  "A relaxed portrait session — great for profiles, portfolios, or just nice photos of yourself.",
    terms:        "One edited portrait session for ~4 hours of paired coding.",
    availability: "Weekend afternoons",
    status:       "active",
    views:        51,
    saves:        7,
    requests:     1,
    createdAt:    new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "branding-for-react",
    title:        "Brand identity in exchange for React mentoring",
    category:     "Design",
    ownerId:      "maya",
    offers:       "Brand identity",
    wants:        "React mentoring",
    mode:         "online",
    location:     "Online",
    level:        "Advanced",
    tags:         ["Branding", "Design", "Figma"],
    description:  "I'll help you shape a cohesive brand — logo, colors, type, and a simple system you can actually use.",
    terms:        "A small brand package for a series of React mentoring calls.",
    availability: "Weekday afternoons, EST",
    status:       "active",
    views:        209,
    saves:        41,
    requests:     11,
    createdAt:    new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "cooking-for-photography",
    title:        "Home cooking sessions for photo editing tips",
    category:     "Cooking",
    ownerId:      "amira",
    offers:       "Home cooking",
    wants:        "Photo editing",
    mode:         "in-person",
    location:     "Camden, London",
    level:        "Beginner",
    tags:         ["Cooking", "Baking", "Meal prep"],
    description:  "Learn a handful of weeknight dishes you'll actually make again.",
    terms:        "Two cooking sessions for an editing walkthrough.",
    availability: "Sunday afternoons",
    status:       "active",
    views:        88,
    saves:        19,
    requests:     4,
    createdAt:    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
  {
    _id:          "yoga-for-video",
    title:        "Yoga & meditation for video editing",
    category:     "Fitness",
    ownerId:      "priya",
    offers:       "Yoga & meditation",
    wants:        "Video editing",
    mode:         "both",
    location:     "Koramangala, Bangalore",
    level:        "Beginner",
    tags:         ["Yoga", "Wellness", "Beginner-friendly"],
    description:  "Gentle, beginner-friendly yoga and breathing practices to help you reset.",
    terms:        "Weekly yoga session for a weekly editing lesson.",
    availability: "Early mornings, IST",
    status:       "active",
    views:        60,
    saves:        12,
    requests:     2,
    createdAt:    new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    updatedAt:    now,
  },
]

const SWAP_REQUESTS = [
  {
    _id:       "r1",
    offerId:   "react-for-logo",
    fromId:    "maya",
    toId:      "dev",
    message:   "Hi Devon! I'd love to learn React. I can design a clean wordmark and give you two rounds of revisions.",
    proposed:  "Logo design ↔ React & TypeScript",
    status:    "incoming",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: now,
  },
  {
    _id:       "r2",
    offerId:   "react-for-logo",
    fromId:    "leo",
    toId:      "dev",
    message:   "Could we swap a portrait session for some React help instead of a logo?",
    proposed:  "Portrait photography ↔ React & TypeScript",
    status:    "negotiating",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },
  {
    _id:       "r3",
    offerId:   "branding-for-react",
    fromId:    "dev",
    toId:      "maya",
    message:   "Happy to mentor you through React fundamentals in exchange for the brand work.",
    proposed:  "React mentoring ↔ Brand identity",
    status:    "sent",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    updatedAt: now,
  },
  {
    _id:       "r4",
    offerId:   "maths-for-french",
    fromId:    "priya",
    toId:      "amira",
    message:   "Your French sounds great — shall we start next week?",
    proposed:  "Calculus tutoring ↔ French conversation",
    status:    "accepted",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },
  {
    _id:       "r5",
    offerId:   "guitar-for-training",
    fromId:    "dev",
    toId:      "tomas",
    message:   "I can't commit to the morning slots unfortunately.",
    proposed:  "Running coaching ↔ Guitar lessons",
    status:    "rejected",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    updatedAt: now,
  },
]

const MESSAGES = [
  {
    _id:            "m1",
    conversationId: "dev_maya_react-for-logo",
    offerId:        "react-for-logo",
    fromId:         "maya",
    toId:           "dev",
    text:           "Hi Devon! I saw your React offer — I'd love to swap a logo for some lessons.",
    read:           true,
    createdAt:      new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    _id:            "m2",
    conversationId: "dev_maya_react-for-logo",
    offerId:        "react-for-logo",
    fromId:         "dev",
    toId:           "maya",
    text:           "Hey Maya! That works perfectly, I've been meaning to get a proper wordmark.",
    read:           true,
    createdAt:      new Date(Date.now() - 4.9 * 60 * 60 * 1000),
  },
  {
    _id:            "m3",
    conversationId: "dev_maya_react-for-logo",
    offerId:        "react-for-logo",
    fromId:         "maya",
    toId:           "dev",
    text:           "Great. Could you do three 1-hour sessions? I'll do the logo with two revision rounds.",
    read:           true,
    createdAt:      new Date(Date.now() - 4.8 * 60 * 60 * 1000),
  },
  {
    _id:            "m4",
    conversationId: "dev_maya_react-for-logo",
    offerId:        "react-for-logo",
    fromId:         "dev",
    toId:           "maya",
    text:           "Deal. How about Tuesday and Thursday evenings to start?",
    read:           false,
    createdAt:      new Date(Date.now() - 4.7 * 60 * 60 * 1000),
  },
  {
    _id:            "m5",
    conversationId: "dev_maya_react-for-logo",
    offerId:        "react-for-logo",
    fromId:         "maya",
    toId:           "dev",
    text:           "Perfect, talk soon!",
    read:           false,
    createdAt:      new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
]

const NOTIFICATIONS = [
  {
    _id:       "n1",
    userId:    "dev",
    type:      "request",
    title:     "New swap request",
    body:      "Maya Okonkwo wants to swap logo design for your React lessons.",
    read:      false,
    link:      "/requests",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    _id:       "n2",
    userId:    "dev",
    type:      "message",
    title:     "New message from Amira",
    body:      "Sounds good — let's start Sunday afternoon?",
    read:      false,
    link:      "/requests",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
  },
  {
    _id:       "n3",
    userId:    "dev",
    type:      "review",
    title:     "Priya left you a review",
    body:      '"Patient, clear and genuinely kind. Five stars."',
    read:      true,
    link:      "/profile",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id:       "n4",
    userId:    "dev",
    type:      "swap",
    title:     "Swap completed",
    body:      "Your swap with Tomás Lindqvist is marked complete. Leave a review?",
    read:      true,
    link:      "/requests",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    _id:       "n5",
    userId:    "dev",
    type:      "system",
    title:     "Verification approved",
    body:      "Your student email has been verified. Your profile now shows a verified badge.",
    read:      true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
]

const REVIEWS = [
  {
    _id:       "rv1",
    toId:      "maya",
    fromId:    "priya",
    offerId:   "branding-for-react",
    rating:    5,
    text:      "Maya completely reshaped how I think about my brand. Calm, clear, and so generous with feedback.",
    skill:     "Brand identity",
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    _id:       "rv2",
    toId:      "maya",
    fromId:    "tomas",
    offerId:   "branding-for-react",
    rating:    5,
    text:      "Delivered a logo I genuinely love. Communicative the whole way through.",
    skill:     "Logo design",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    _id:       "rv3",
    toId:      "maya",
    fromId:    "leo",
    offerId:   "branding-for-react",
    rating:    4,
    text:      "Really helpful Figma session. Would happily swap again.",
    skill:     "Figma basics",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
]

// ─── Main seed function ───────────────────────────────────────────────────────

async function seed() {
  const client = new MongoClient(uri, {
    tls: true, tlsAllowInvalidCertificates: true, tlsAllowInvalidHostnames: true, serverSelectionTimeoutMS: 10000,
  })

  try {
    await client.connect()
    console.log("✅ Connected to MongoDB Atlas")

    const db = client.db(DB)

    // ── Drop and recreate each collection ─────────────────────────────────────
    const collections = ["users", "offers", "swapRequests", "messages", "notifications", "reviews", "savedOffers"]
    for (const name of collections) {
      try {
        await db.collection(name).drop()
        console.log(`   Dropped: ${name}`)
      } catch {
        // Collection didn't exist yet — that's fine
      }
    }

    // ── Insert data ───────────────────────────────────────────────────────────
    await db.collection("users").insertMany(USERS as never[])
    console.log(`✅ Inserted ${USERS.length} users`)

    await db.collection("offers").insertMany(OFFERS as never[])
    console.log(`✅ Inserted ${OFFERS.length} offers`)

    await db.collection("swapRequests").insertMany(SWAP_REQUESTS as never[])
    console.log(`✅ Inserted ${SWAP_REQUESTS.length} swap requests`)

    await db.collection("messages").insertMany(MESSAGES as never[])
    console.log(`✅ Inserted ${MESSAGES.length} messages`)

    await db.collection("notifications").insertMany(NOTIFICATIONS as never[])
    console.log(`✅ Inserted ${NOTIFICATIONS.length} notifications`)

    await db.collection("reviews").insertMany(REVIEWS as never[])
    console.log(`✅ Inserted ${REVIEWS.length} reviews`)

    // ── Create indexes ────────────────────────────────────────────────────────
    console.log("\nCreating indexes...")

    // offers: text index for search, plus common filter fields
    await db.collection("offers").createIndex(
      { title: "text", description: "text", offers: "text", wants: "text" },
      { name: "offers_text_search" }
    )
    await db.collection("offers").createIndex({ ownerId: 1, status: 1 })
    await db.collection("offers").createIndex({ category: 1, status: 1 })
    await db.collection("offers").createIndex({ createdAt: -1 })
    console.log("   ✓ offers indexes")

    // swapRequests
    await db.collection("swapRequests").createIndex({ fromId: 1, status: 1 })
    await db.collection("swapRequests").createIndex({ toId:   1, status: 1 })
    await db.collection("swapRequests").createIndex({ offerId: 1 })
    console.log("   ✓ swapRequests indexes")

    // messages: fetch all messages in a conversation, sorted by time
    await db.collection("messages").createIndex({ conversationId: 1, createdAt: 1 })
    await db.collection("messages").createIndex({ toId: 1, read: 1 })
    console.log("   ✓ messages indexes")

    // notifications: sorted by time for the current user
    await db.collection("notifications").createIndex({ userId: 1, createdAt: -1 })
    await db.collection("notifications").createIndex({ userId: 1, read: 1 })
    console.log("   ✓ notifications indexes")

    // reviews: by recipient
    await db.collection("reviews").createIndex({ toId: 1, createdAt: -1 })
    console.log("   ✓ reviews indexes")

    // savedOffers: unique per user+offer pair
    await db.collection("savedOffers").createIndex(
      { userId: 1, offerId: 1 },
      { unique: true }
    )
    console.log("   ✓ savedOffers indexes")

    // users: lookup by googleId and handle
    await db.collection("users").createIndex({ googleId: 1 }, { unique: true })
    await db.collection("users").createIndex({ handle:   1 }, { unique: true })
    console.log("   ✓ users indexes")

    console.log("\n🎉 Database seeded successfully!")
    console.log(`   Database: ${DB}`)
    console.log(`   Collections: ${collections.join(", ")}`)
  } catch (err) {
    console.error("❌ Seed failed:", err)
    process.exit(1)
  } finally {
    await client.close()
  }
}

seed()
