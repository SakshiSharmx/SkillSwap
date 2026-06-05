import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import type { MessageDoc, NotificationDoc } from "@/models/types"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { searchParams } = req.nextUrl
    const conversationId = searchParams.get("conversationId")
    const after          = searchParams.get("after")
    if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 })
    if (!conversationId.split("_").slice(0, 2).includes(session.user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const db  = await getDb()
    const col = db.collection<MessageDoc>("messages")
    const filter: Record<string, any> = { conversationId }
    if (after) filter.createdAt = { $gt: new Date(after) }
    const messages = await col.find(filter).sort({ createdAt: 1 }).toArray()
    col.updateMany({ conversationId, toId: session.user.id, read: false }, { $set: { read: true } }).catch(() => {})
    return NextResponse.json({ messages })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { conversationId, offerId, toId, text } = await req.json()
    if (!conversationId || !offerId || !toId || !text?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    if (!conversationId.split("_").slice(0, 2).includes(session.user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    const now = new Date()
    const db  = await getDb()
    const message: MessageDoc = { conversationId, offerId, fromId: session.user.id, toId, text: text.trim(), read: false, createdAt: now }
    const result = await db.collection<MessageDoc>("messages").insertOne(message)
    const recentUnread = await db.collection<MessageDoc>("messages").findOne({ conversationId, toId, read: false, createdAt: { $gt: new Date(Date.now() - 60_000) } })
    if (!recentUnread) {
      await db.collection<NotificationDoc>("notifications").insertOne({
        userId: toId, type: "message", title: `New message from ${session.user.name ?? "someone"}`,
        body: text.trim().slice(0, 100), read: false, link: "/requests", createdAt: now,
      })
    }
    return NextResponse.json({ _id: result.insertedId.toString(), ...message }, { status: 201 })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}