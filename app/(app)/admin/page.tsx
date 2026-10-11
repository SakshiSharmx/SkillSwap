import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/auth"
import { query } from "@/lib/db"
import { PageContainer, PageHeader } from "@/components/page-header"

export default async function AdminPage() {
  try {
    await requireAdmin()
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHENTICATED") redirect("/login")
    redirect("/dashboard")
  }

  const [users, offers, requests, messages] = await Promise.all([
    query("select count(*)::int as count from users"),
    query("select count(*)::int as count from offers"),
    query("select count(*)::int as count from swap_requests"),
    query("select count(*)::int as count from messages"),
  ])

  const stats = {
    users: users.rows[0].count,
    offers: offers.rows[0].count,
    requests: requests.rows[0].count,
    messages: messages.rows[0].count,
  }

  return (
    <PageContainer>
      <PageHeader title="Admin" description="A simple overview of the SkillSwap platform." />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm capitalize text-muted-foreground">{key}</p>
            <p className="mt-1 text-3xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <p className="text-sm font-medium">Admin access</p>
        <p className="mt-1 text-sm text-muted-foreground">
          This page is available only to the email addresses configured in <code>ADMIN_EMAILS</code>.
        </p>
      </div>
    </PageContainer>
  )
}
