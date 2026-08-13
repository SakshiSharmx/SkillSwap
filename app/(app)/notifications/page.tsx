"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell, CheckCheck, Loader2 } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [marking, setMarking]             = useState(false)

  async function load() {
    setLoading(true)
    const res  = await fetch("/api/notifications?limit=50")
    const data = await res.json()
    setNotifications(data.notifications ?? [])
    setLoading(false)
  }

  async function markAllRead() {
    setMarking(true)
    await fetch("/api/notifications", { method: "PATCH" })
    await load()
    setMarking(false)
  }

  async function markOneRead(id: string) {
    await fetch(`/api/notifications?id=${id}`, { method: "PATCH" })
    setNotifications((prev) =>
      prev.map((n) => (String(n._id) === id ? { ...n, read: true } : n))
    )
  }

  useEffect(() => { load() }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <PageContainer>
      <div className="flex items-center justify-between">
        <PageHeader
          title="Notifications"
          description={
            unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up."
          }
        />
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={marking}
            className="shrink-0"
          >
            {marking
              ? <Loader2 className="size-4 animate-spin" />
              : <CheckCheck className="size-4" />}
            Mark all read
          </Button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Bell className="size-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={String(n._id)}
              onClick={() => { if (!n.read) markOneRead(String(n._id)) }}
              className={`rounded-lg border p-4 transition-colors cursor-default ${
                n.read
                  ? "border-border bg-card"
                  : "border-primary/30 bg-primary/5 cursor-pointer hover:bg-primary/8"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                </div>
                {!n.read && (
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
              {n.link && (
                <Link
                  href={n.link}
                  className="mt-2 inline-block text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View →
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </PageContainer>
  )
}