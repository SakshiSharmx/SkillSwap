import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { error, ok } from "@/lib/api"
export async function GET(){const u=await getCurrentUser();if(!u)return error("Unauthorised",401);const r=await query(`select (select count(*) from offers where owner_id=$1 and status='active')::int as "activeOffers",(select count(*) from swap_requests where to_id=$1 and status in ('sent','incoming','negotiating'))::int as "pendingRequests",completed_swaps as "completedSwaps",rating,review_count as "reviewCount" from users where id=$1`,[u.id]);return r.rowCount?ok(r.rows[0]):error("User not found",404)}
