import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { ReviewDoc, NotificationDoc } from "@/models/types"

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId")
    if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 })
    const reviews = await (await getDb()).collection<ReviewDoc>("reviews").find({ toId: userId }).sort({ createdAt: -1 }).limit(20).toArray()
    return NextResponse.json({ reviews })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { toId, offerId, rating, text, skill } = await req.json()
    if (!toId || !offerId || !rating || !text?.trim()) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    if (rating < 1 || rating > 5) return NextResponse.json({ error: "Rating 1-5" }, { status: 400 })
    if (toId === session.user.id) return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 })
    const db = await getDb()
    const existing = await db.collection<ReviewDoc>("reviews").findOne({ fromId: session.user.id, toId, offerId })
    if (existing) return NextResponse.json({ error: "Already reviewed" }, { status: 409 })
    const now    = new Date()
    const review: ReviewDoc = { toId, fromId: session.user.id, offerId, rating: Math.round(rating), text: text.trim(), skill: skill?.trim() ?? "", createdAt: now }
    await db.collection<ReviewDoc>("reviews").insertOne(review)
    const agg = await db.collection<ReviewDoc>("reviews").aggregate([
      { $match: { toId } }, { $group: { _id: "$toId", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } }
    ]).toArray()
    if (agg.length > 0) {
      let userFilter: object
      try { userFilter = { _id: new ObjectId(toId) } } catch { userFilter = { _id: toId as any } }
      await db.collection("users").updateOne(userFilter, { $set: { rating: Math.round(agg[0].avgRating * 10) / 10, reviewCount: agg[0].reviewCount, updatedAt: now } })
    }
    await db.collection<NotificationDoc>("notifications").insertOne({
      userId: toId, type: "review", title: `${session.user.name ?? "Someone"} left you a review`,
      body: `"${text.trim().slice(0, 80)}"`, read: false, link: "/profile", createdAt: now,
    })
    return NextResponse.json({ success: true, review }, { status: 201 })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}