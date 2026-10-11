import { NextRequest } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { error, ok } from "@/lib/api"
export async function GET(){const u=await getCurrentUser();if(!u)return error("Unauthorised",401);const r=await query(`select *,id::text as "_id" from notifications where user_id=$1 order by created_at desc limit 100`,[u.id]);return ok({notifications:r.rows})}
export async function PATCH(req:NextRequest){const u=await getCurrentUser();if(!u)return error("Unauthorised",401);const id=req.nextUrl.searchParams.get("id");if(id){const r=await query("update notifications set read=true where id=$1 and user_id=$2 returning id",[id,u.id]);if(!r.rowCount)return error("Notification not found",404)}else await query("update notifications set read=true where user_id=$1",[u.id]);return ok({success:true})}
