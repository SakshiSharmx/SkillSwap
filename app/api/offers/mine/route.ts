import { NextResponse } from "next/server"
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
    if (!user) return NextResponse.json({ offers: [] })

    const userId = String(user._id)
    const offers = await db.collection("offers")
      .find({ ownerId: userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ offers })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}