import Link from "next/link"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { CalendarClock, ChevronRight, GraduationCap, MapPin, Tag } from "lucide-react"
import { ObjectId } from "mongodb"
import { getDb } from "@/lib/mongodb"
import { authOptions } from "@/lib/auth"
import { OfferActions } from "@/components/offer/offer-actions"
import { ModeTag } from "@/components/badges"
import { SwapPair } from "@/components/offer-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default async function OfferDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const session = await getServerSession(authOptions)

  let offer: any = null
  let owner: any = null
  let similar: any[] = []

  try {
    const db  = await getDb()
    const col = db.collection("offers")

    // Try ObjectId first, then fall back to string id (for seeded data)
    try {
      offer = await col.findOne({ _id: new ObjectId(id) })
    } catch {
      offer = await col.findOne({ _id: id as any })
    }

    if (!offer) notFound()

    // Increment view count
    col.updateOne({ _id: offer._id }, { $inc: { views: 1 } }).catch(() => {})

    // Find owner — try ObjectId first then string
    try {
      owner = await db.collection("users").findOne({ _id: new ObjectId(offer.ownerId) })
    } catch {
      owner = await db.collection("users").findOne({ _id: offer.ownerId as any })
    }

    // Find similar offers
    similar = await col
      .find({ category: offer.category, _id: { $ne: offer._id } })
      .limit(3).toArray()

  } catch (err) {
    console.error("Offer detail error:", err)
    notFound()
  }

  const offerId = String(offer._id)
  const isOwner = session?.user?.id === offer.ownerId || session?.user?.id === String(offer._id)

  const meta = [
    { icon: MapPin,        label: "Location",     value: offer.location },
    { icon: GraduationCap, label: "Level",        value: offer.level },
    { icon: CalendarClock, label: "Availability", value: offer.availability },
    { icon: Tag,           label: "Category",     value: offer.category },
  ]

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <nav className="mb-5 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/browse" className="hover:text-foreground">Browse</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{offer.category}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <ModeTag mode={offer.mode} />
            <span>·</span>
            <span>{offer.views ?? 0} views</span>
            <span>·</span>
            <span>{offer.saves ?? 0} saves</span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{offer.title}</h1>
          <SwapPair offers={offer.offers} wants={offer.wants} className="mt-3" />

          {offer.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {offer.tags.map((t: string) => <Badge key={t} variant="secondary">{t}</Badge>)}
            </div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {meta.filter(m => m.value).map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>

          {offer.description && (
            <div className="mt-6">
              <h2 className="mb-2 text-sm font-medium text-foreground">About this offer</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
            </div>
          )}

          {offer.terms && (
            <div className="mt-4">
              <h2 className="mb-2 text-sm font-medium text-foreground">Terms</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">{offer.terms}</p>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          {owner && (
            <div className="rounded-lg border border-border bg-card p-4">
              <Link href={`/profile/${owner.handle ?? String(owner._id)}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <Avatar className="size-12">
                  <AvatarFallback>{owner.name?.[0]}</AvatarFallback>
                  <AvatarImage src={owner.image} alt={owner.name} />
                </Avatar>
                <div>
                  <p className="font-medium text-foreground">{owner.name}</p>
                  <p className="text-xs text-muted-foreground">@{owner.handle}</p>
                </div>
              </Link>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center text-xs">
                <div><p className="font-semibold text-foreground">{owner.rating?.toFixed(1) ?? "0.0"}</p><p className="text-muted-foreground">Rating</p></div>
                <div><p className="font-semibold text-foreground">{owner.completedSwaps ?? 0}</p><p className="text-muted-foreground">Swaps</p></div>
                <div><p className="font-semibold text-foreground">{owner.responseRate ?? 0}%</p><p className="text-muted-foreground">Response</p></div>
              </div>
            </div>
          )}

          {!isOwner && session && (
            <OfferActions offer={{ ...offer, id: offerId, ownerId: offer.ownerId, ownerName: owner?.name }} />
          )}

          {!session && (
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-sm text-muted-foreground">Sign in to send a swap request</p>
              <Link href="/login" className="mt-2 inline-block text-sm text-primary hover:underline">Sign in</Link>
            </div>
          )}

          {similar.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-foreground">Similar offers</h3>
              <div className="space-y-2">
                {similar.map((s: any) => (
                  <Link key={String(s._id)} href={`/offers/${String(s._id)}`}
                    className="block rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-primary/40 transition-colors">
                    <p className="font-medium text-foreground truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.offers} ↔ {s.wants}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}