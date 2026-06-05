import { getServerSession } from "next-auth"
import { notFound } from "next/navigation"
import Link from "next/link"
import { CheckCircle, MapPin, Star, Users } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { PageContainer } from "@/components/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDb } from "@/lib/mongodb"

export default async function ProfilePage({
  params,
}: {
  params: { handle: string }
}) {
  const session = await getServerSession(authOptions)

  let user: any    = null
  let reviews: any[] = []
  let offers: any[]  = []

  try {
    const db = await getDb()
    user = await db.collection("users").findOne({ handle: params.handle })
    if (!user) notFound()

    const uid = String(user._id)
    ;[reviews, offers] = await Promise.all([
      db.collection("reviews")
        .find({ toId: uid })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray(),
      db.collection("offers")
        .find({ ownerId: uid, status: "active" })
        .sort({ createdAt: -1 })
        .toArray(),
    ])
  } catch {
    if (!user) notFound()
  }

  const isOwnProfile = session?.user?.id === String(user._id)

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <Avatar className="size-20 shrink-0">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-foreground">{user.name}</h1>
              {user.verified && (
                <CheckCircle className="size-5 text-primary" aria-label="Verified" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">@{user.handle}</p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              {user.area && (
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {user.area}
                </span>
              )}
              {user.community && (
                <span className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  {user.community}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                {user.rating?.toFixed(1) ?? "0.0"} ({user.reviewCount ?? 0} reviews)
              </span>
            </div>
            {user.bio && (
              <p className="mt-3 text-sm leading-relaxed text-foreground">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 gap-2">
          {isOwnProfile ? (
            <Button variant="outline" asChild>
              <Link href="/settings">Edit profile</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/browse">Browse their offers</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Stats strip */}
      <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-border bg-card p-4 text-center sm:grid-cols-3">
        <div>
          <p className="text-xl font-semibold text-foreground">{user.completedSwaps ?? 0}</p>
          <p className="text-xs text-muted-foreground">Completed swaps</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">{user.responseRate ?? 0}%</p>
          <p className="text-xs text-muted-foreground">Response rate</p>
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">{offers.length}</p>
          <p className="text-xs text-muted-foreground">Active offers</p>
        </div>
      </div>

      {/* Skills */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {user.skillsOffered?.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Offers
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skillsOffered.map((s: string) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
          </section>
        )}
        {user.skillsWanted?.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Looking for
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.skillsWanted.map((s: string) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Active offers */}
      {offers.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-medium text-foreground">Active offers</h2>
          <div className="space-y-2">
            {offers.map((o: any) => (
              <Link
                key={String(o._id)}
                href={`/offers/${String(o._id)}`}
                className="block rounded-lg border border-border bg-card px-4 py-3 text-sm hover:border-primary/40 transition-colors"
              >
                <p className="font-medium text-foreground">{o.title}</p>
                <p className="mt-0.5 text-muted-foreground">{o.offers} ↔ {o.wants}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-medium text-foreground">
            Reviews ({reviews.length})
          </h2>
          <div className="space-y-4">
            {reviews.map((r: any) => (
              <div
                key={String(r._id)}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < r.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                  {r.skill && (
                    <span className="ml-2 text-xs text-muted-foreground">· {r.skill}</span>
                  )}
                </div>
                <p className="text-sm text-foreground">{r.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {reviews.length === 0 && offers.length === 0 && !user.bio && (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            This user hasn&apos;t set up their profile yet.
          </p>
        </div>
      )}
    </PageContainer>
  )
}