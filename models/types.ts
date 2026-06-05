// models/types.ts
// ─────────────────────────────────────────────────────────────────────────────
// TypeScript types for every MongoDB document used in SkillSwap.
// These mirror the shapes in lib/data.ts but are extended with MongoDB's _id
// and the extra fields needed when data is real (createdAt, updatedAt, etc.).
//
// COLLECTION MAP
//  "users"         → UserDoc
//  "offers"        → OfferDoc
//  "swapRequests"  → SwapRequestDoc
//  "messages"      → MessageDoc
//  "notifications" → NotificationDoc
//  "reviews"       → ReviewDoc
//  "savedOffers"   → SavedOfferDoc
// ─────────────────────────────────────────────────────────────────────────────

import type { ObjectId } from "mongodb"

// ─── Users ───────────────────────────────────────────────────────────────────
export interface UserDoc {
  _id?: ObjectId
  // From Google OAuth — NextAuth populates these automatically
  name: string
  email: string
  image: string          // Google profile photo URL
  googleId: string       // Google sub (unique identifier)

  // Profile fields the user fills in after signing up
  handle: string         // @username shown on profile (auto-generated from name, editable)
  area: string           // e.g. "Greenpoint, Brooklyn"
  community: string      // e.g. "Pratt Institute" or "Neighborhood"
  bio: string
  skillsOffered: string[]
  skillsWanted: string[]
  verified: boolean      // true once email/student ID is confirmed

  // Stats — updated by the backend when swaps/reviews happen
  rating: number         // average of all review ratings (0–5)
  reviewCount: number
  completedSwaps: number
  responseRate: number   // 0–100 percentage

  memberSince: Date
  updatedAt: Date
}

// ─── Offers ──────────────────────────────────────────────────────────────────
export type OfferMode = "online" | "in-person" | "both"
export type OfferLevel = "Beginner" | "Intermediate" | "Advanced"
export type OfferStatus = "active" | "draft" | "completed" | "expired" | "paused"

export type Category =
  | "Development" | "Design" | "Languages" | "Music"
  | "Cooking" | "Fitness" | "Tutoring" | "Writing"
  | "Photography" | "Crafts"

export interface OfferDoc {
  _id?: ObjectId
  title: string
  category: Category
  ownerId: string        // UserDoc._id as string (from session)

  offers: string         // what the poster is offering
  wants: string          // what the poster wants in return

  mode: OfferMode
  location: string       // "Online" or a city/neighbourhood
  level: OfferLevel
  tags: string[]
  description: string
  terms: string          // e.g. "3 sessions for one logo"
  availability: string   // e.g. "Weekday evenings, EST"

  status: OfferStatus

  // Counters — incremented by API routes, never set by the client directly
  views: number
  saves: number
  requests: number

  createdAt: Date
  updatedAt: Date
}

// ─── Swap Requests ───────────────────────────────────────────────────────────
export type RequestStatus =
  | "incoming"
  | "sent"
  | "accepted"
  | "rejected"
  | "negotiating"

export interface SwapRequestDoc {
  _id?: ObjectId
  offerId: string        // OfferDoc._id as string
  fromId: string         // UserDoc._id of the person making the request
  toId: string           // UserDoc._id of the offer owner
  message: string        // introductory message
  proposed: string       // e.g. "Logo design ↔ React & TypeScript"
  status: RequestStatus
  createdAt: Date
  updatedAt: Date
}

// ─── Messages ────────────────────────────────────────────────────────────────
// Each document is one chat message inside a "conversation".
// A conversation is uniquely identified by a sorted pair of userIds + offerId.
export interface MessageDoc {
  _id?: ObjectId
  conversationId: string // composite key: sorted([userAId, userBId]).join("_") + "_" + offerId
  offerId: string
  fromId: string         // sender's UserDoc._id
  toId: string           // recipient's UserDoc._id
  text: string
  read: boolean          // true once the recipient has fetched/seen the message
  createdAt: Date
}

// ─── Notifications ───────────────────────────────────────────────────────────
export type NotificationType = "request" | "message" | "review" | "swap" | "system"

export interface NotificationDoc {
  _id?: ObjectId
  userId: string         // who receives this notification
  type: NotificationType
  title: string
  body: string
  read: boolean
  // Optional deep-link so the UI can navigate on click
  link?: string          // e.g. "/offers/react-for-logo"
  createdAt: Date
}

// ─── Reviews ─────────────────────────────────────────────────────────────────
export interface ReviewDoc {
  _id?: ObjectId
  toId: string           // the user being reviewed
  fromId: string         // the reviewer
  offerId: string        // which swap this review is for
  rating: number         // 1–5
  text: string
  skill: string          // which skill was exchanged
  createdAt: Date
}

// ─── Saved Offers ────────────────────────────────────────────────────────────
export interface SavedOfferDoc {
  _id?: ObjectId
  userId: string
  offerId: string
  savedAt: Date
}
