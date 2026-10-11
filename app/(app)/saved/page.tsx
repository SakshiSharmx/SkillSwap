import Link from "next/link"
import { Bookmark } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { query } from "@/lib/db"
import { PageContainer,PageHeader } from "@/components/page-header"
import { OfferCard } from "@/components/offer-card"
export default async function SavedPage(){const u=await getCurrentUser();if(!u)return null;const r=await query(`select o.*,o.id::text as "_id" from saved_offers s join offers o on o.id=s.offer_id where s.user_id=$1 order by s.saved_at desc`,[u.id]);return <PageContainer><PageHeader title="Saved offers" description="Offers you've bookmarked."/>{r.rows.length===0?<div className="mt-16 flex flex-col items-center gap-3 text-center"><Bookmark className="size-10 text-muted-foreground/40"/><p className="text-sm text-muted-foreground">No saved offers yet.</p><Link href="/browse" className="text-sm text-primary hover:underline">Browse offers</Link></div>:<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{r.rows.map(o=><OfferCard key={o._id} offer={{...o,id:o._id}}/>)}</div>}</PageContainer>}
