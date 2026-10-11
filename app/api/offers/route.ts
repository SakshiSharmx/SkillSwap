import { NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { error, ok, pageParams, parseBody } from "@/lib/api"

const schema = z.object({
  title: z.string().trim().min(3).max(120), category: z.string().trim().min(2).max(40),
  offers: z.string().trim().min(2).max(120), wants: z.string().trim().min(2).max(120),
  description: z.string().trim().min(10).max(3000),
  mode: z.enum(["online","in-person","both"]).default("online"),
  location: z.string().trim().max(120).default("Online"),
  level: z.enum(["Beginner","Intermediate","Advanced"]).default("Beginner"),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  terms: z.string().trim().max(1000).default(""), availability: z.string().trim().max(300).default(""),
  status: z.enum(["active","draft"]).default("active"),
})

const selectOffer = `select o.*, o.id::text as "_id", u.name as "ownerName", u.image as "ownerImage", u.handle as "ownerHandle" from offers o join users u on u.id=o.owner_id`

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const { page, limit, offset } = pageParams(sp)
  const q = sp.get("q")?.trim() ?? "", category = sp.get("category") ?? "", mode = sp.get("mode") ?? "", level = sp.get("level") ?? ""
  const status = sp.get("status") ?? "active", ownerId = sp.get("ownerId") ?? "", sort = sp.get("sort") ?? "newest"
  const values: unknown[] = [status]; const conditions = ["o.status = $1"]
  if (q) { values.push(`%${q}%`); conditions.push(`(o.title ilike $${values.length} or o.description ilike $${values.length} or o.offers ilike $${values.length} or o.wants ilike $${values.length})`) }
  if (category) { values.push(category); conditions.push(`o.category = $${values.length}`) }
  if (mode) { values.push(mode); conditions.push(`o.mode = $${values.length}`) }
  if (level) { values.push(level); conditions.push(`o.level = $${values.length}`) }
  if (ownerId) { values.push(ownerId); conditions.push(`o.owner_id = $${values.length}`) }
  const where = conditions.join(" and ")
  const order = sort === "popular" ? "o.views desc" : sort === "saves" ? "o.saves desc" : "o.created_at desc"
  const count = await query<{ count: string }>(`select count(*)::text as count from offers o where ${where}`, values)
  const rows = await query(`${selectOffer} where ${where} order by ${order} limit $${values.length + 1} offset $${values.length + 2}`, [...values, limit, offset])
  const total = Number(count.rows[0]?.count ?? 0)
  return ok({ offers: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised", 401)
  const parsed = parseBody(schema, await req.json()); if (!parsed.ok) return parsed.response
  const d = parsed.data
  const inserted = await query<{ id: string }>(
    `insert into offers (title,category,owner_id,offers,wants,mode,location,level,tags,description,terms,availability,status)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) returning id`,
    [d.title,d.category,user.id,d.offers,d.wants,d.mode,d.location,d.level,d.tags,d.description,d.terms,d.availability,d.status]
  )
  const created = await query(`${selectOffer} where o.id=$1`, [inserted.rows[0].id])
  return ok(created.rows[0], 201)
}
