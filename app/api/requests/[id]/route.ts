import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { SwapRequestDoc, NotificationDoc } from "@/models/types"

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { status } = await req.json()
    if (!["accepted","rejected","negotiating"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    const db  = await getDb()
    const col = db.collection<SwapRequestDoc>("swapRequests")
    const requestId = new ObjectId(params.id)
    const request   = await col.findOne({ _id: requestId })
    if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 })
    if (status !== "negotiating" && request.toId !== session.user.id) {
      return NextResponse.json({ error: "Only offer owner can accept/reject" }, { status: 403 })
    }
    const now = new Date()
    await col.updateOne({ _id: requestId }, { $set: { status, updatedAt: now } })
    if (status === "accepted") {
      await db.collection("offers").updateOne({ _id: request.offerId as any }, { $set: { status: "paused", updatedAt: now } })
      await db.collection<NotificationDoc>("notifications").insertOne({
        userId: request.fromId, type: "request", title: "Swap request accepted! 🎉",
        body: "Your request was accepted. Check your messages to get started.",
        read: false, link: "/requests", createdAt: now,
      })
    }
    if (status === "rejected") {
      await db.collection<NotificationDoc>("notifications").insertOne({
        userId: request.fromId, type: "request", title: "Swap request declined",
        body: "Your request was declined. Browse other offers to find a match.",
        read: false, link: "/browse", createdAt: now,
      })
    }
    return NextResponse.json({ success: true, status })
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const result = await (await getDb()).collection<SwapRequestDoc>("swapRequests").deleteOne({
      _id: new ObjectId(params.id), fromId: session.user.id, status: { $in: ["sent","negotiating"] },
    })
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found or already processed" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}