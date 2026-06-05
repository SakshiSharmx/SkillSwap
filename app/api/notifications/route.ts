import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { NotificationDoc } from "@/models/types"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { searchParams } = req.nextUrl
    const onlyUnread = searchParams.get("unread") === "true"
    const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20", 10))
    const db  = await getDb()
    const col = db.collection<NotificationDoc>("notifications")
    const filter: Record<string, any> = { userId: session.user.id }
    if (onlyUnread) filter.read = false
    const [notifications, unreadCount] = await Promise.all([
      col.find(filter).sort({ createdAt: -1 }).limit(limit).toArray(),
      col.countDocuments({ userId: session.user.id, read: false }),
    ])
    return NextResponse.json({ notifications, unreadCount })
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { searchParams } = req.nextUrl
    const id  = searchParams.get("id")
    const db  = await getDb()
    const col = db.collection<NotificationDoc>("notifications")
    if (id) {
      await col.updateOne({ _id: new ObjectId(id), userId: session.user.id }, { $set: { read: true } })
    } else {
      await col.updateMany({ userId: session.user.id, read: false }, { $set: { read: true } })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}