import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import type { SwapRequestDoc, NotificationDoc } from "@/models/types"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { searchParams } = req.nextUrl
    const status = searchParams.get("status")
    const userId = session.user.id
    const filter: Record<string, any> = { $or: [{ fromId: userId }, { toId: userId }] }
    if (status) filter.status = status
    const requests = await (await getDb()).collection<SwapRequestDoc>("swapRequests")
      .find(filter).sort({ createdAt: -1 }).toArray()
    return NextResponse.json({ requests: requests.map((r) => ({ ...r, direction: r.toId === userId ? "incoming" : "sent" })) })
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const body = await req.json()
    const { offerId, toId, message, proposed } = body
    if (!offerId || !toId || !message?.trim()) return NextResponse.json({ error: "offerId, toId, message required" }, { status: 400 })
    if (toId === session.user.id) return NextResponse.json({ error: "Cannot request yourself" }, { status: 400 })

    const db  = await getDb()
    const now = new Date()
    const existing = await db.collection<SwapRequestDoc>("swapRequests").findOne({
      offerId, fromId: session.user.id, status: { $in: ["sent","negotiating"] },
    })
    if (existing) return NextResponse.json({ error: "Already have a pending request for this offer" }, { status: 409 })

    const request: SwapRequestDoc = {
      offerId, fromId: session.user.id, toId,
      message: message.trim(), proposed: proposed?.trim() ?? "",
      status: "sent", createdAt: now, updatedAt: now,
    }
    const result = await db.collection<SwapRequestDoc>("swapRequests").insertOne(request)
    await db.collection("offers").updateOne({ _id: offerId as any }, { $inc: { requests: 1 }, $set: { updatedAt: now } })
    await db.collection<NotificationDoc>("notifications").insertOne({
      userId: toId, type: "request", title: "New swap request",
      body: `${session.user.name ?? "Someone"} wants to swap: ${proposed ?? message.slice(0, 80)}`,
      read: false, link: "/requests", createdAt: now,
    })
    return NextResponse.json({ _id: result.insertedId.toString(), ...request }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}