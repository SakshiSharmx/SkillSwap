import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import type { OfferDoc } from "@/models/types"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const q        = searchParams.get("q")        ?? ""
    const category = searchParams.get("category") ?? ""
    const mode     = searchParams.get("mode")     ?? ""
    const level    = searchParams.get("level")    ?? ""
    const status   = searchParams.get("status")   ?? "active"
    const sort     = searchParams.get("sort")     ?? "newest"
    const ownerId  = searchParams.get("ownerId")  ?? ""
    const page     = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10))
    const limit    = Math.min(50, parseInt(searchParams.get("limit") ?? "12", 10))
    const skip     = (page - 1) * limit

    const filter: Record<string, any> = {}
    if (status)   filter.status   = status
    if (ownerId)  filter.ownerId  = ownerId
    if (category) filter.category = category
    if (mode)     filter.mode     = mode
    if (level)    filter.level    = level
    if (q)        filter.$text    = { $search: q }

    let sortObj: Record<string, any> = { createdAt: -1 }
    if (sort === "popular") sortObj = { views: -1 }
    if (sort === "saves")   sortObj = { saves: -1 }

    const db  = await getDb()
    const col = db.collection<OfferDoc>("offers")
    const [offers, total] = await Promise.all([
      col.find(filter).sort(sortObj).skip(skip).limit(limit).toArray(),
      col.countDocuments(filter),
    ])

    return NextResponse.json({
      offers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error("[GET /api/offers]", err)
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

  try {
    const body = await req.json()
    const required = ["title", "category", "offers", "wants", "description"]
    for (const field of required) {
      if (!body[field]?.trim()) return NextResponse.json({ error: `Missing: ${field}` }, { status: 400 })
    }

    const now = new Date()
    const offer: OfferDoc = {
      title:        body.title.trim(),
      category:     body.category,
      ownerId:      session.user.id,
      offers:       body.offers.trim(),
      wants:        body.wants.trim(),
      mode:         body.mode ?? "online",
      location:     body.location?.trim() ?? "Online",
      level:        body.level ?? "Beginner",
      tags:         Array.isArray(body.tags) ? body.tags.slice(0, 10) : [],
      description:  body.description.trim(),
      terms:        body.terms?.trim() ?? "",
      availability: body.availability?.trim() ?? "",
      status:       body.status === "draft" ? "draft" : "active",
      views: 0, saves: 0, requests: 0,
      createdAt: now, updatedAt: now,
    }

    const db     = await getDb()
    const result = await db.collection<OfferDoc>("offers").insertOne(offer)
    return NextResponse.json({ _id: result.insertedId.toString(), ...offer }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/offers]", err)
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 })
  }
}