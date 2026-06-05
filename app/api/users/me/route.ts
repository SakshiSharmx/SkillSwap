import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }
  try {
    const db   = await getDb()
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    const { googleId, ...safeUser } = user as any
    return NextResponse.json(safeUser)
  } catch (err) {
    console.error("[GET /api/users/me]", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  }
  try {
    const body    = await req.json()
    const allowed = ["handle", "area", "community", "bio", "skillsOffered", "skillsWanted"]
    const update: Record<string, any> = { updatedAt: new Date() }
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key]
    }
    const db = await getDb()
    await db.collection("users").updateOne(
      { email: session.user.email },
      { $set: update }
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[PATCH /api/users/me]", err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}