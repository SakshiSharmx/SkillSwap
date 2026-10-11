import { NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { query, withTransaction } from "@/lib/db"
import { error, ok, parseBody } from "@/lib/api"

const schema = z.object({ offerId: z.string().uuid(), toId: z.string().uuid(), message: z.string().trim().min(5).max(2000), proposed: z.string().trim().max(500).default("") })

const requestSelect = `select r.*, r.id::text as "_id", fu.name as "fromName", fu.image as "fromImage", tu.name as "toName", tu.image as "toImage", o.title as "offerTitle" from swap_requests r join users fu on fu.id=r.from_id join users tu on tu.id=r.to_id join offers o on o.id=r.offer_id`

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised", 401)
  const status = req.nextUrl.searchParams.get("status")
  const values: unknown[] = [user.id]
  let where = "(r.from_id=$1 or r.to_id=$1)"
  if (status) { values.push(status); where += ` and r.status=$${values.length}` }
  const result = await query(`${requestSelect} where ${where} order by r.created_at desc`, values)
  return ok({ requests: result.rows.map(r => ({ ...r, direction: r.to_id === user.id ? "incoming" : "sent" })) })
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised", 401)
  const parsed = parseBody(schema, await req.json()); if (!parsed.ok) return parsed.response
  const { offerId,toId,message,proposed } = parsed.data
  if (toId === user.id) return error("You cannot send a swap request to yourself", 400)
  const offer = await query<{ owner_id:string; status:string }>("select owner_id,status from offers where id=$1", [offerId])
  if (!offer.rowCount) return error("Offer not found", 404)
  if (offer.rows[0].owner_id !== toId) return error("Offer owner does not match toId", 400)
  if (offer.rows[0].status !== "active") return error("This offer is not accepting requests", 409)
  const duplicate = await query("select id from swap_requests where offer_id=$1 and from_id=$2 and status in ('sent','incoming','negotiating')", [offerId,user.id])
  if (duplicate.rowCount) return error("You already have a pending request for this offer", 409)
  const created = await withTransaction(async client => {
    const request = await client.query(`insert into swap_requests (offer_id,from_id,to_id,message,proposed,status) values ($1,$2,$3,$4,$5,'sent') returning id`, [offerId,user.id,toId,message,proposed])
    await client.query("update offers set requests=requests+1, updated_at=now() where id=$1", [offerId])
    await client.query(`insert into notifications (user_id,type,title,body,link) values ($1,'request','New swap request',$2,'/requests')`, [toId, `${user.name} wants to swap: ${proposed || message.slice(0,80)}`])
    return request.rows[0]
  })
  return ok({ _id: created.id, id: created.id, offerId, fromId:user.id, toId, message, proposed, status:"sent" }, 201)
}
