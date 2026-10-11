import { NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { error, ok, parseBody } from "@/lib/api"

const schema = z.object({ conversationId:z.string().min(1).max(200), offerId:z.string().uuid().optional().nullable(), toId:z.string().uuid(), text:z.string().trim().min(1).max(2000) })

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(); if (!user) return error("Unauthorised",401)
  const sp=req.nextUrl.searchParams, conversationId=sp.get("conversationId")
  if (!conversationId) return error("conversationId is required",400)
  const after=sp.get("after")
  const values:unknown[]=[conversationId,user.id]; let where="conversation_id=$1 and (from_id=$2 or to_id=$2)"
  if(after){values.push(after);where+=` and created_at>$${values.length}`}
  const result=await query(`select m.*,m.id::text as "_id",fu.name as "fromName",fu.image as "fromImage" from messages m join users fu on fu.id=m.from_id where ${where} order by m.created_at asc limit 200`,values)
  await query("update messages set read=true where conversation_id=$1 and to_id=$2",[conversationId,user.id])
  return ok({messages:result.rows})
}

export async function POST(req:NextRequest){
  const user=await getCurrentUser();if(!user)return error("Unauthorised",401)
  const parsed=parseBody(schema,await req.json());if(!parsed.ok)return parsed.response
  const d=parsed.data
  if(d.toId===user.id)return error("You cannot message yourself",400)
  const target=await query("select id from users where id=$1",[d.toId]);if(!target.rowCount)return error("Recipient not found",404)
  const result=await query(`insert into messages(conversation_id,offer_id,from_id,to_id,text) values($1,$2,$3,$4,$5) returning *,id::text as "_id"`,[d.conversationId,d.offerId??null,user.id,d.toId,d.text])
  await query(`insert into notifications(user_id,type,title,body,link) values($1,'message',$2,$3,'/messages')`,[d.toId,`New message from ${user.name}`,d.text.slice(0,100)])
  return ok(result.rows[0],201)
}
