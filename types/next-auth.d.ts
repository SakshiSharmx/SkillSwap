// types/next-auth.d.ts
// ─────────────────────────────────────────────────────────────────────────────
// NextAuth's default Session type doesn't include `id` or `handle` on the user
// object. This file extends the types so TypeScript knows about our custom fields.
//
// Place this file at the root of your project (next to tsconfig.json).
// ─────────────────────────────────────────────────────────────────────────────

import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string      // MongoDB UserDoc._id as string
      handle: string  // @username
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string
    handle?: string
  }
}
