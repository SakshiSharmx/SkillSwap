import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { error, ok } from "@/lib/api"
export async function GET() {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised", 401)
  const result = await query(`select o.*, o.id::text as "_id" from offers o where owner_id=$1 order by created_at desc`, [user.id])
  return ok({ offers: result.rows })
}
