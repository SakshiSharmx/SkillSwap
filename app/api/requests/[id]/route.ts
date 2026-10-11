import { NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { query, withTransaction } from "@/lib/db"
import { error, ok, parseBody } from "@/lib/api"

const schema = z.object({ status: z.enum(["accepted","rejected","negotiating"]) })

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised",401)
  const { id } = await params
  const parsed = parseBody(schema, await req.json()); if (!parsed.ok) return parsed.response
  const request = await query("select * from swap_requests where id=$1", [id])
  if (!request.rowCount) return error("Request not found",404)
  const r = request.rows[0], status = parsed.data.status
  if (status !== "negotiating" && r.to_id !== user.id) return error("Only the offer owner can accept or reject requests",403)
  if (status === "negotiating" && r.from_id !== user.id && r.to_id !== user.id) return error("You cannot update this request",403)
  await withTransaction(async client => {
    await client.query("update swap_requests set status=$1, updated_at=now() where id=$2", [status,id])
    if (status === "accepted") {
      await client.query("update offers set status='paused', updated_at=now() where id=$1", [r.offer_id])
      await client.query(`insert into notifications (user_id,type,title,body,link) values ($1,'request','Swap request accepted! 🎉','Your request was accepted. Check your messages to get started.','/requests')`, [r.from_id])
    }
    if (status === "rejected") await client.query(`insert into notifications (user_id,type,title,body,link) values ($1,'request','Swap request declined','Your swap request was declined. Browse other offers to find a match.','/browse')`, [r.from_id])
  })
  return ok({ success:true,status })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id:string }> }) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised",401)
  const { id } = await params
  const result = await query("delete from swap_requests where id=$1 and from_id=$2 and status in ('sent','negotiating') returning offer_id", [id,user.id])
  if (!result.rowCount) return error("Request not found or cannot be withdrawn",404)
  await query("update offers set requests=greatest(requests-1,0), updated_at=now() where id=$1", [result.rows[0].offer_id])
  return ok({ success:true })
}
