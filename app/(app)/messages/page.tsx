"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Loader2, MessageSquare } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PageContainer, PageHeader } from "@/components/page-header"

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    // Load accepted swap requests — each one is a conversation
    fetch("/api/requests?status=accepted")
      .then((r) => r.json())
      .then(async (data) => {
        const requests = data.requests ?? []
        // For each request, fetch the other person's profile
        const withPartners = await Promise.all(
          requests.map(async (req: any) => {
            const partnerId =
              req.fromId === session?.user?.id ? req.toId : req.fromId
            try {
              const res    = await fetch(`/api/users/${partnerId}`)
              const partner = await res.json()
              return { ...req, partner }
            } catch {
              return { ...req, partner: null }
            }
          })
        )
        setConversations(withPartners)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session?.user?.id])

  return (
    <PageContainer>
      <PageHeader title="Messages" description="Your active swap conversations." />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <MessageSquare className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No conversations yet.</p>
          <p className="text-xs text-muted-foreground">
            When a swap request is accepted, your conversation will appear here.
          </p>
          <Link href="/browse" className="text-sm text-primary hover:underline">
            Browse offers
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {conversations.map((conv: any) => {
            const partner = conv.partner
            return (
              <Link
                key={String(conv._id)}
                href={`/requests`}
                className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:border-primary/40 transition-colors"
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={partner?.image} alt={partner?.name} />
                  <AvatarFallback>{partner?.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {partner?.name ?? "Unknown user"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {conv.proposed || conv.message?.slice(0, 60)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </PageContainer>
  )
}