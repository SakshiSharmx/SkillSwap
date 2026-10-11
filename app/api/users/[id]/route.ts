import { NextRequest } from "next/server"
import { query } from "@/lib/db"
import { error, ok } from "@/lib/api"
export async function GET(_req:NextRequest,{params}:{params:Promise<{id:string}>}){const {id}=await params;const r=await query(`select id::text as "_id",id,name,image,handle,area,community,bio,skills_offered as "skillsOffered",skills_wanted as "skillsWanted",verified,rating,review_count as "reviewCount",completed_swaps as "completedSwaps",response_rate as "responseRate",member_since as "memberSince" from users where id=$1 or handle=$1`,[id]);return r.rowCount?ok(r.rows[0]):error("User not found",404)}
