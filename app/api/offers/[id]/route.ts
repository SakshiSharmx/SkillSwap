import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import type { OfferDoc } from "@/models/types"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const db  = await getDb()
    const col = db.collection<OfferDoc>("offers")
    let filter: object
    try { filter = { _id: new ObjectId(params.id) } } catch { filter = { _id: params.id as any } }

    const offer = await col.findOne(filter)
    if (!offer) return NextResponse.json({ error: "Offer not found" }, { status: 404 })

    const session  = await getServerSession(authOptions)
    const viewerId = session?.user?.id
    if (!viewerId || viewerId !== offer.ownerId) {
      col.updateOne(filter, { $inc: { views: 1 } }).catch(() => {})
    }
    return NextResponse.json(offer)
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch offer" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const db  = await getDb()
    const col = db.collection<OfferDoc>("offers")
    let filter: object
    try { filter = { _id: new ObjectId(params.id), ownerId: session.user.id } }
    catch { return NextResponse.json({ error: "Invalid id" }, { status: 400 }) }

    const body = await req.json()
    const allowed = ["title","category","offers","wants","mode","location","level","tags","description","terms","availability","status"]
    const update: Record<string, any> = { updatedAt: new Date() }
    for (const key of allowed) { if (body[key] !== undefined) update[key] = body[key] }

    const result = await col.updateOne(filter, { $set: update })
    if (result.matchedCount === 0) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to update offer" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const db  = await getDb()
    const col = db.collection<OfferDoc>("offers")
    let filter: object
    try { filter = { _id: new ObjectId(params.id), ownerId: session.user.id } }
    catch { return NextResponse.json({ error: "Invalid id" }, { status: 400 }) }

    const result = await col.deleteOne(filter)
    if (result.deletedCount === 0) return NextResponse.json({ error: "Not found or not owner" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete offer" }, { status: 500 })
  }
}