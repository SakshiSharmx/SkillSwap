import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"

export default async function MyProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect("/login")

  try {
    const db   = await getDb()
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (user?.handle) redirect(`/profile/${user.handle}`)
  } catch {}

  redirect("/settings")
}