"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  AlertTriangle, CalendarClock, Check,
  Loader2, MessageSquare, Repeat, Send, Star,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/badges"

const CHECKLIST_INIT = [
  { id: "1", label: "Agree on swap terms",       done: false },
  { id: "2", label: "Schedule first session",    done: false },
  { id: "3", label: "Complete first exchange",   done: false },
  { id: "4", label: "Complete second exchange",  done: false },
  { id: "5", label: "Leave a review",            done: false },
]

interface SwapWorkspaceProps {
  offer: {
    id: string
    title: string
    offers: string
    wants: string
    terms?: string
    ownerId: string
  }
  partnerId: string   // the other user's MongoDB _id string
  requestId: string   // the swapRequest _id string
}

export function SwapWorkspace({ offer, partnerId, requestId }: SwapWorkspaceProps) {
  const { data: session } = useSession()
  const myId = session?.user?.id ?? ""

  // Conversation id: sorted([myId, partnerId]) + "_" + offerId
  const conversationId = [myId, partnerId].sort().join("_") + "_" + offer.id

  const [partner, setPartner]       = useState<any>(null)
  const [messages, setMessages]     = useState<any[]>([])
  const [draft, setDraft]           = useState("")
  const [sending, setSending]       = useState(false)
  const [checklist, setChecklist]   = useState(CHECKLIST_INIT)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [stars, setStars]           = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [completing, setCompleting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Load partner profile
  useEffect(() => {
    if (!partnerId) return
    fetch(`/api/users/${partnerId}`)
      .then((r) => r.json())
      .then((d) => setPartner(d))
      .catch(() => {})
  }, [partnerId])

  // Poll messages every 4 seconds
  const fetchMessages = useCallback(async () => {
    if (!myId) return
    try {
      const res  = await fetch(`/api/messages?conversationId=${conversationId}`)
      const data = await res.json()
      if (data.messages) setMessages(data.messages)
    } catch {}
  }, [conversationId, myId])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 4000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !myId) return
    setSending(true)
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          offerId: offer.id,
          toId:    partnerId,
          text:    draft.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages((prev) => [...prev, data])
      setDraft("")
    } catch (err: any) {
      toast.error("Failed to send message", { description: err.message })
    } finally {
      setSending(false)
    }
  }

  async function markComplete() {
    setCompleting(true)
    try {
      // Mark the swap request as accepted (completed)
      await fetch(`/api/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "accepted" }),
      })
      toast.success("Swap marked as complete!")
      setReviewOpen(true)
    } catch {
      toast.error("Could not mark as complete")
    } finally {
      setCompleting(false)
    }
  }

  async function submitReview() {
    if (!reviewText.trim() || !partner) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toId:    partnerId,
          offerId: offer.id,
          rating:  stars,
          text:    reviewText.trim(),
          skill:   offer.offers,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Review submitted!", { description: "Thanks for helping build trust on SkillSwap." })
      setReviewOpen(false)
    } catch (err: any) {
      toast.error("Could not submit review", { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  function toggleCheck(id: string) {
    setChecklist((prev) =>
      prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c))
    )
  }

  const doneCount = checklist.filter((c) => c.done).length
  const progress  = Math.round((doneCount / checklist.length) * 100)

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">

        {/* Agreement */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">Agreement</h2>
            <StatusBadge status="negotiating" />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{offer.title}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-md bg-muted px-3 py-2.5 text-sm">
            <span className="font-medium text-foreground">{offer.offers}</span>
            <Repeat className="size-4 text-primary" />
            <span className="font-medium text-foreground">{offer.wants}</span>
          </div>
          {offer.terms && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{offer.terms}</p>
          )}
        </section>

        {/* Chat */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">Conversation</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages">
                <MessageSquare className="size-4" />Open full chat
              </Link>
            </Button>
          </div>

          <div className="flex h-64 flex-col gap-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No messages yet. Say hello!
              </p>
            ) : (
              messages.map((m: any) => {
                const fromMe = m.fromId === myId
                return (
                  <div key={String(m._id)} className={`flex ${fromMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                      fromMe ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form className="mt-4 flex items-center gap-2" onSubmit={sendMessage}>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              disabled={sending}
            />
            <Button type="submit" size="icon" aria-label="Send" disabled={sending || !draft.trim()}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">

        {/* Participants */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-medium text-foreground">Participants</h2>
          <div className="space-y-3">
            {/* Me */}
            <div className="flex items-center gap-3">
              <Avatar className="size-9">
                <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
                <AvatarFallback>{session?.user?.name?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {session?.user?.name ?? "You"}
                </p>
                <p className="text-xs text-muted-foreground">You</p>
              </div>
            </div>
            {/* Partner */}
            {partner ? (
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarImage src={partner.image} alt={partner.name} />
                  <AvatarFallback>{partner.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{partner.name}</p>
                  <p className="text-xs text-muted-foreground">Partner</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1">
                  <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-2 w-12 rounded bg-muted animate-pulse" />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Progress checklist */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Progress</h2>
            <span className="text-xs text-muted-foreground">{doneCount}/{checklist.length}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <ul className="mt-4 space-y-3">
            {checklist.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5">
                <Checkbox
                  id={`c-${c.id}`}
                  checked={c.done}
                  onCheckedChange={() => toggleCheck(c.id)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`c-${c.id}`}
                  className={`text-sm leading-snug cursor-pointer ${
                    c.done ? "text-muted-foreground line-through" : "text-foreground"
                  }`}
                >
                  {c.label}
                </label>
              </li>
            ))}
          </ul>
        </section>

        {/* Actions */}
        <section className="space-y-2">
          <Button className="w-full" onClick={markComplete} disabled={completing}>
            {completing
              ? <Loader2 className="size-4 animate-spin" />
              : <Check className="size-4" />}
            Mark as completed
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive"
            onClick={() => toast("Issue reported", { description: "Our team will review this swap." })}
          >
            <AlertTriangle className="size-4" />
            Report an issue
          </Button>
        </section>
      </aside>

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Leave a review for {partner?.name?.split(" ")[0] ?? "your partner"}
            </DialogTitle>
            <DialogDescription>
              Reviews keep SkillSwap trustworthy. How was your experience?
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                <Star className={`size-7 transition-colors ${
                  n <= stars ? "fill-primary text-primary" : "text-muted-foreground"
                }`} />
              </button>
            ))}
          </div>

          <Textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share a few words about the swap…"
            rows={4}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewOpen(false)} disabled={submitting}>
              Skip for now
            </Button>
            <Button onClick={submitReview} disabled={submitting || !reviewText.trim()}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Submit review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}