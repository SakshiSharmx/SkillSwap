import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import type { SavedOfferDoc } from "@/models/types"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const db    = await getDb()
    const saved = await db.collection<SavedOfferDoc>("savedOffers").find({ userId: session.user.id }).sort({ savedAt: -1 }).toArray()
    const offerIds = saved.map((s) => s.offerId)
    const offers   = offerIds.length ? await db.collection("offers").find({ _id: { $in: offerIds as any[] } }).toArray() : []
    return NextResponse.json({ saved, offers })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const { offerId } = await req.json()
    if (!offerId) return NextResponse.json({ error: "offerId required" }, { status: 400 })
    const db     = await getDb()
    const result = await db.collection<SavedOfferDoc>("savedOffers").updateOne(
      { userId: session.user.id, offerId },
      { $setOnInsert: { userId: session.user.id, offerId, savedAt: new Date() } },
      { upsert: true }
    )
    if (result.upsertedCount > 0) await db.collection("offers").updateOne({ _id: offerId as any }, { $inc: { saves: 1 } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const offerId = req.nextUrl.searchParams.get("id")
    if (!offerId) return NextResponse.json({ error: "id required" }, { status: 400 })
    const db     = await getDb()
    const result = await db.collection<SavedOfferDoc>("savedOffers").deleteOne({ userId: session.user.id, offerId })
    if (result.deletedCount > 0) await db.collection("offers").updateOne({ _id: offerId as any, saves: { $gt: 0 } }, { $inc: { saves: -1 } })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}