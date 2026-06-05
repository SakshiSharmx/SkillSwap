import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })
  try {
    const userId = session.user.id
    const db     = await getDb()
    const [activeOffers, pendingRequests, ongoingSwaps, user] = await Promise.all([
      db.collection("offers").countDocuments({ ownerId: userId, status: "active" }),
      db.collection("swapRequests").countDocuments({ toId: userId, status: { $in: ["sent","negotiating"] } }),
      db.collection("swapRequests").countDocuments({ $or: [{ fromId: userId },{ toId: userId }], status: "accepted" }),
      db.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { completedSwaps: 1, rating: 1, reviewCount: 1 } }),
    ])
    return NextResponse.json({
      activeOffers, pendingRequests, ongoingSwaps,
      completedSwaps: user?.completedSwaps ?? 0,
      rating:         user?.rating         ?? 0,
      reviewCount:    user?.reviewCount    ?? 0,
    })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}