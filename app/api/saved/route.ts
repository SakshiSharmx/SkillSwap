import { NextRequest } from "next/server"
import { z } from "zod"
import { getCurrentUser } from "@/lib/auth"
import { query, withTransaction } from "@/lib/db"
import { error, ok, parseBody } from "@/lib/api"
const schema=z.object({offerId:z.string().uuid()})
export async function GET(){const u=await getCurrentUser();if(!u)return error("Unauthorised",401);const r=await query(`select s.*,s.id::text as "_id",o.* from saved_offers s join offers o on o.id=s.offer_id where s.user_id=$1 order by s.saved_at desc`,[u.id]);return ok({saved:r.rows.map(x=>({id:x._id,userId:x.user_id,offerId:x.offer_id,savedAt:x.saved_at})),offers:r.rows})}
export async function POST(req:NextRequest){const u=await getCurrentUser();if(!u)return error("Unauthorised",401);const p=parseBody(schema,await req.json());if(!p.ok)return p.response;const exists=await query("select id from offers where id=$1",[p.data.offerId]);if(!exists.rowCount)return error("Offer not found",404);const r=await query("insert into saved_offers(user_id,offer_id) values($1,$2) on conflict(user_id,offer_id) do nothing returning id",[u.id,p.data.offerId]);if(r.rowCount)await query("update offers set saves=saves+1 where id=$1",[p.data.offerId]);return ok({success:true})}
export async function DELETE(req:NextRequest){const u=await getCurrentUser();if(!u)return error("Unauthorised",401);const id=req.nextUrl.searchParams.get("id");if(!id)return error("id (offerId) is required",400);const r=await query("delete from saved_offers where user_id=$1 and offer_id=$2 returning offer_id",[u.id,id]);if(r.rowCount)await query("update offers set saves=greatest(saves-1,0) where id=$1",[id]);return ok({success:true})}
