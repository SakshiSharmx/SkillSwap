import { NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { error, ok, parseBody } from "@/lib/api"

const updateSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(), category: z.string().trim().min(2).max(40).optional(),
  offers: z.string().trim().min(2).max(120).optional(), wants: z.string().trim().min(2).max(120).optional(),
  mode: z.enum(["online","in-person","both"]).optional(), location: z.string().trim().max(120).optional(),
  level: z.enum(["Beginner","Intermediate","Advanced"]).optional(), tags: z.array(z.string()).max(10).optional(),
  description: z.string().trim().min(10).max(3000).optional(), terms: z.string().trim().max(1000).optional(),
  availability: z.string().trim().max(300).optional(), status: z.enum(["active","draft","completed","expired","paused"]).optional(),
})
const selectOffer = `select o.*, o.id::text as "_id", u.name as "ownerName", u.image as "ownerImage", u.handle as "ownerHandle" from offers o join users u on u.id=o.owner_id`

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await query(`${selectOffer} where o.id=$1`, [id])
  if (!result.rowCount) return error("Offer not found", 404)
  const user = await getCurrentUser()
  if (!user || user.id !== result.rows[0].owner_id) await query("update offers set views=views+1 where id=$1", [id])
  return ok(result.rows[0])
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised", 401)
  const { id } = await params
  const parsed = parseBody(updateSchema, await req.json()); if (!parsed.ok) return parsed.response
  const entries = Object.entries(parsed.data); if (!entries.length) return error("No fields to update", 400)
  const allowed: Record<string,string> = { title:"title",category:"category",offers:"offers",wants:"wants",mode:"mode",location:"location",level:"level",tags:"tags",description:"description",terms:"terms",availability:"availability",status:"status" }
  const sets: string[] = []; const values: unknown[] = []
  for (const [key,value] of entries) { sets.push(`${allowed[key]}=$${values.length+1}`); values.push(value) }
  values.push(id, user.id)
  const result = await query(`update offers set ${sets.join(",")}, updated_at=now() where id=$${values.length-1} and owner_id=$${values.length} returning id`, values)
  if (!result.rowCount) return error("Offer not found or you are not the owner", 404)
  return ok({ success:true })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised", 401)
  const { id } = await params
  const result = await query("delete from offers where id=$1 and owner_id=$2 returning id", [id,user.id])
  if (!result.rowCount) return error("Offer not found or you are not the owner", 404)
  return ok({ success:true })
}
