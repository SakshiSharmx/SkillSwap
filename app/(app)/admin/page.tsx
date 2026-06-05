import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { authOptions } from "@/lib/auth"
import { getDb } from "@/lib/mongodb"
import { PageContainer, PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { BarChart3, CheckCircle, FileText, MessageSquare, ShieldAlert, Star, TrendingUp, Users } from "lucide-react"

function StatBlock({ icon: Icon, label, value, sub, color = "text-primary" }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-card p-5">
      <div className={`mt-0.5 rounded-lg bg-muted p-2.5 ${color}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  )
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  let data = {
    totalUsers: 0, totalOffers: 0, activeOffers: 0, totalRequests: 0,
    acceptedSwaps: 0, totalMessages: 0, totalReviews: 0, avgRating: 0,
    recentUsers: [] as any[], recentOffers: [] as any[],
    statusBreakdown: {} as Record<string, number>,
    categoryBreakdown: [] as { _id: string; count: number }[],
  }

  try {
    const db = await getDb()

    // Find user by email (works for both ObjectId and string _id)
    const adminUser = await db.collection("users").findOne({
      email: session.user.email
    })

    if (!adminUser || adminUser.role !== "admin") {
      redirect("/dashboard")
    }

    const [
      totalUsers, totalOffers, activeOffers, totalRequests, acceptedSwaps,
      totalMessages, totalReviews, ratingAgg, recentUsers, recentOffers,
      statusAgg, categoryAgg,
    ] = await Promise.all([
      db.collection("users").countDocuments(),
      db.collection("offers").countDocuments(),
      db.collection("offers").countDocuments({ status: "active" }),
      db.collection("swapRequests").countDocuments(),
      db.collection("swapRequests").countDocuments({ status: "accepted" }),
      db.collection("messages").countDocuments(),
      db.collection("reviews").countDocuments(),
      db.collection("reviews").aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]).toArray(),
      db.collection("users").find().sort({ memberSince: -1 }).limit(8).toArray(),
      db.collection("offers").find().sort({ createdAt: -1 }).limit(8).toArray(),
      db.collection("offers").aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]).toArray(),
      db.collection("offers").aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } }, { $limit: 8 },
      ]).toArray(),
    ])

    const statusBreakdown: Record<string, number> = {}
    for (const s of statusAgg) statusBreakdown[s._id as string] = s.count as number

    data = {
      totalUsers, totalOffers, activeOffers, totalRequests, acceptedSwaps,
      totalMessages, totalReviews,
      avgRating: (ratingAgg[0] as any)?.avg ? Math.round((ratingAgg[0] as any).avg * 10) / 10 : 0,
      recentUsers, recentOffers, statusBreakdown,
      categoryBreakdown: categoryAgg.map((c) => ({ _id: c._id as string, count: c.count as number })),
    }
  } catch (err) {
    console.error("[AdminPage] Error:", err)
  }

  const statusColors: Record<string, string> = {
    active:    "bg-green-500/15 text-green-600 border-green-500/30",
    draft:     "bg-muted text-muted-foreground border-border",
    paused:    "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
    completed: "bg-blue-500/15 text-blue-600 border-blue-500/30",
    expired:   "bg-red-500/15 text-red-600 border-red-500/30",
  }

  return (
    <PageContainer>
      <PageHeader title="Admin Dashboard" description="Only admins can see this page." />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock icon={Users}         label="Total users"   value={data.totalUsers}    sub="All registered accounts"          color="text-blue-500" />
        <StatBlock icon={FileText}      label="Total offers"  value={data.totalOffers}   sub={`${data.activeOffers} active`}    color="text-green-500" />
        <StatBlock icon={TrendingUp}    label="Swap requests" value={data.totalRequests} sub={`${data.acceptedSwaps} accepted`} color="text-purple-500" />
        <StatBlock icon={MessageSquare} label="Messages"      value={data.totalMessages} sub="Across all conversations"        color="text-orange-500" />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock icon={CheckCircle} label="Completed swaps" value={data.acceptedSwaps}                                                                              color="text-teal-500" />
        <StatBlock icon={Star}        label="Reviews"         value={data.totalReviews}  sub={`Avg: ${data.avgRating} / 5`}                                           color="text-yellow-500" />
        <StatBlock icon={BarChart3}   label="Active offers"   value={data.activeOffers}  sub={`${Math.round((data.activeOffers / (data.totalOffers || 1)) * 100)}% of all`} color="text-indigo-500" />
        <StatBlock icon={ShieldAlert} label="Draft offers"    value={data.statusBreakdown.draft ?? 0} sub="Unpublished"                                               color="text-muted-foreground" />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">Recent offers</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Title</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground md:table-cell">Category</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium text-muted-foreground lg:table-cell">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOffers.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No offers yet.</td></tr>
                  ) : data.recentOffers.map((o: any) => (
                    <tr key={String(o._id)} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/offers/${String(o._id)}`} className="font-medium text-foreground hover:text-primary hover:underline line-clamp-1">{o.title}</Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">{o.offers} → {o.wants}</p>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{o.category}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${statusColors[o.status] ?? statusColors.draft}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">{o.views ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">Recent users</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">User</th>
                    <th className="hidden px-4 py-2.5 text-left font-medium text-muted-foreground md:table-cell">Handle</th>
                    <th className="hidden px-4 py-2.5 text-right font-medium text-muted-foreground lg:table-cell">Rating</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Swaps</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentUsers.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No users yet.</td></tr>
                  ) : data.recentUsers.map((u: any) => (
                    <tr key={String(u._id)} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-7 shrink-0">
                            <AvatarImage src={u.image} alt={u.name} />
                            <AvatarFallback>{u.name?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{u.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">{u.handle ? `@${u.handle}` : "—"}</td>
                      <td className="hidden px-4 py-3 text-right text-muted-foreground lg:table-cell">{u.rating ? `${u.rating} ★` : "—"}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground">{u.completedSwaps ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">Offers by status</h2>
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              {Object.entries(data.statusBreakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : Object.entries(data.statusBreakdown).sort(([, a], [, b]) => b - a).map(([status, count]) => {
                const pct = Math.round((count / (data.totalOffers || 1)) * 100)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-foreground">{status}</span>
                      <span className="tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">Top categories</h2>
            <div className="space-y-2.5 rounded-xl border border-border bg-card p-4">
              {data.categoryBreakdown.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data yet.</p>
              ) : data.categoryBreakdown.map(({ _id, count }) => {
                const pct = Math.round((count / (data.activeOffers || 1)) * 100)
                return (
                  <div key={_id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{_id}</span>
                      <span className="tabular-nums text-muted-foreground">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                      <div className="h-1.5 rounded-full bg-blue-500/70 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-foreground">Quick links</h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card divide-y divide-border/60">
              {[
                { label: "Browse all offers", href: "/browse" },
                { label: "View all requests", href: "/requests" },
                { label: "Notifications",     href: "/notifications" },
                { label: "My profile",        href: "/profile/me" },
              ].map(({ label, href }) => (
                <Link key={href} href={href} className="block px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </PageContainer>
  )
}