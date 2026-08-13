// app/api/users/[id]/route.ts
// ─────────────────────────────────────────────────────────────────────────────
// GET /api/users/:id   → Fetch any user's public profile
//
// `:id` can be either:
//   - A MongoDB ObjectId string  (e.g. "664abc123...")
//   - A @handle string           (e.g. "mayao")
//
// Used on the offer detail page to show the poster's mini-card.
// Sensitive fields (googleId, email) are stripped from the response.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { UserDoc } from "@/models/types"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const db  = await getDb()
    const col = db.collection<UserDoc>("users")

    // Try ObjectId first, fall back to handle lookup
    let user: UserDoc | null = null

    try {
      user = await col.findOne({ _id: new ObjectId(params.id) })
    } catch {
      // params.id is not a valid ObjectId — try it as a handle
      user = await col.findOne({ handle: params.id })
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Strip private fields before sending to the client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { googleId, email, ...publicProfile } = user

    return NextResponse.json(publicProfile)
  } catch (err) {
    console.error("[GET /api/users/:id]", err)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}
