import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
export default async function MyProfilePage(){const u=await getCurrentUser();if(!u)redirect("/login");const r=await query("select handle from users where id=$1",[u.id]);if(r.rows[0]?.handle)redirect(`/profile/${r.rows[0].handle}`);redirect("/settings")}
