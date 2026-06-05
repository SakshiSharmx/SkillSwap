"use client"

import { useEffect, useState } from "react"
import { Inbox, Loader2 } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RequestCard } from "@/components/request-card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

const TABS = [
  { value: "incoming", label: "Incoming" },
  { value: "sent",     label: "Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
]

export function RequestsClient() {
  const [tab, setTab]           = useState("incoming")
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res  = await fetch("/api/requests")
      const data = await res.json()
      setRequests(data.requests ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const visible = requests.filter((r) => {
    if (tab === "incoming") return r.direction === "incoming" && (r.status === "sent" || r.status === "incoming")
    if (tab === "sent")     return r.direction === "sent"     && (r.status === "sent" || r.status === "incoming")
    return r.status === tab
  })

  const countFor = (tabValue: string) => {
    return requests.filter((r) => {
      if (tabValue === "incoming") return r.direction === "incoming" && (r.status === "sent" || r.status === "incoming")
      if (tabValue === "sent")     return r.direction === "sent"     && (r.status === "sent" || r.status === "incoming")
      return r.status === tabValue
    }).length
  }

  return (
    <div className="mt-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          {TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value}>
              {t.label}
              <span className="ml-1.5 text-xs text-muted-foreground">{countFor(t.value)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {loading ? (
          <div className="flex items-center justify-center py-12 lg:col-span-2">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <Empty className="rounded-lg border border-dashed border-border lg:col-span-2">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Inbox className="size-5" /></EmptyMedia>
              <EmptyTitle>No {tab} requests</EmptyTitle>
              <EmptyDescription>When a swap reaches this stage, it'll show up here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          visible.map((r) => (
            <RequestCard key={String(r._id)} request={{ ...r, id: String(r._id) }} />
          ))
        )}
      </div>
    </div>
  )
}
