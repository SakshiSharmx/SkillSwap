import Link from "next/link"
import { getServerSession } from "next-auth"
import { ObjectId } from "mongodb"
import {
  Bell, CheckCircle2, Clock,
  Plus, Repeat, Search, Star, TrendingUp,
} from "lucide-react"
import { authOptions } from "@/lib/auth"
import { PageContainer } from "@/components/page-header"
import { StatCard } from "@/components/stat-card"
import { OfferCard } from "@/components/offer-card"
import { RequestCard } from "@/components/request-card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDb } from "@/lib/mongodb"

async function getDashboardData(userId: string) {
  const db = await getDb()

  let userObjectId: ObjectId | null = null
  try { userObjectId = new ObjectId(userId) } catch {}

  const [offers, requests, notifications, user] = await Promise.all([
    db.collection("offers").find({ status: "active" }).sort({ createdAt: -1 }).limit(20).toArray(),
    db.collection("swapRequests")
      .find({ $or: [{ fromId: userId }, { toId: userId }] })
      .sort({ createdAt: -1 }).limit(20).toArray(),
    db.collection("notifications")
      .find({ userId }).sort({ createdAt: -1 }).limit(3).toArray(),
    userObjectId
      ? db.collection("users").findOne({ _id: userObjectId })
      : null,
  ])

  return { offers, requests, notifications, user }
}

export default async function DashboardPage() {
  const session  = await getServerSession(authOptions)
  const userId   = session?.user?.id ?? ""
  const userName = session?.user?.name ?? "there"

  const { offers, requests, notifications, user } = await getDashboardData(userId)

  const incoming     = requests.filter((r) => r.toId === userId && (r.status === "sent" || r.status === "negotiating"))
  const myOffers     = offers.filter((o) => o.ownerId === userId).slice(0, 3)
  const browseOffers = offers.filter((o) => o.ownerId !== userId).slice(0, 4)

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-12">
            <AvatarImage src={session?.user?.image ?? "/placeholder-user.jpg"} alt={userName} />
            <AvatarFallback>{userName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Welcome back, {userName.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">
              {incoming.length > 0
                ? `You have ${incoming.length} new request${incoming.length > 1 ? "s" : ""} waiting.`
                : "No new requests right now."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/browse"><Search className="size-4" />Browse</Link>
          </Button>
          <Button asChild>
            <Link href="/offers/new"><Plus className="size-4" />New offer</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="Active offers"    value={myOffers.length}                                      icon={TrendingUp}  hint="Your live offers" />
        <StatCard label="Pending requests" value={incoming.length}                                      icon={Clock}       hint="Awaiting your reply" />
        <StatCard label="Ongoing swaps"    value={requests.filter(r => r.status === "accepted").length} icon={Repeat}      hint="In progress" />
        <StatCard label="Completed"        value={(user as any)?.completedSwaps ?? 0}                   icon={CheckCircle2} hint="All time" />
        <StatCard label="Rating"           value={((user as any)?.rating ?? 0).toFixed(1)}              icon={Star}        hint={`${(user as any)?.reviewCount ?? 0} reviews`} />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-foreground">Browse offers</h2>
              <Link href="/browse" className="text-sm text-primary hover:underline">See all</Link>
            </div>
            {browseOffers.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {browseOffers.map((o) => (
                  <OfferCard key={String(o._id)} offer={o as any} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No offers yet. Be the first to post one!</p>
            )}
          </section>

          {incoming.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-foreground">Recent requests</h2>
                <Link href="/requests" className="text-sm text-primary hover:underline">View all</Link>
              </div>
              <div className="space-y-3">
                {incoming.slice(0, 3).map((r) => (
                  <RequestCard key={String(r._id)} request={r as any} />
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-8">
          {myOffers.length > 0 ? (
            <section>
              <h2 className="mb-3 text-sm font-medium text-foreground">Your active offers</h2>
              <div className="space-y-2">
                {myOffers.map((o) => (
                  <Link
                    key={String(o._id)}
                    href={`/offers/${String(o._id)}`}
                    className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2.5 text-sm transition-colors hover:border-primary/40"
                  >
                    <span className="truncate pr-3 text-foreground">{o.title}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{o.requests ?? 0} reqs</span>
                  </Link>
                ))}
              </div>
              <Link href="/my-offers" className="mt-3 inline-block text-sm text-primary hover:underline">
                Manage offers
              </Link>
            </section>
          ) : (
            <section>
              <h2 className="mb-3 text-sm font-medium text-foreground">Your offers</h2>
              <div className="rounded-md border border-dashed border-border p-4 text-center">
                <p className="text-sm text-muted-foreground">No active offers yet.</p>
                <Link href="/offers/new" className="mt-2 inline-block text-sm text-primary hover:underline">
                  Create your first offer
                </Link>
              </div>
            </section>
          )}

          {notifications.length > 0 && (
            <section>
              <div className="mb-3 flex items-center gap-2">
                <Bell className="size-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-foreground">Notifications</h2>
              </div>
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={String(n._id)} className="rounded-md border border-border bg-card px-3 py-2.5">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                ))}
              </div>
              <Link href="/notifications" className="mt-3 inline-block text-sm text-primary hover:underline">
                All notifications
              </Link>
            </section>
          )}
        </aside>
      </div>
    </PageContainer>
  )
}