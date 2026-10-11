"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CalendarClock,
  Check,
  MessageSquare,
  Repeat,
  Send,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { StatusBadge } from "@/components/badges"
import { CURRENT_USER, THREAD, getPerson, type Offer } from "@/lib/data"

const CHECKLIST_INIT = [
  { id: "1", label: "Agree on swap terms", done: true },
  { id: "2", label: "Schedule first session", done: true },
  { id: "3", label: "Complete first exchange", done: false },
  { id: "4", label: "Complete second exchange", done: false },
  { id: "5", label: "Leave a review", done: false },
]

export function SwapWorkspace({ offer, partnerId }: { offer: Offer; partnerId: string }) {
  const partner = getPerson(partnerId)
  const [checklist, setChecklist] = useState(CHECKLIST_INIT)
  const [draft, setDraft] = useState("")
  const [reviewOpen, setReviewOpen] = useState(false)
  const [stars, setStars] = useState(5)

  const doneCount = checklist.filter((c) => c.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)

  function toggle(id: string) {
    setChecklist((prev) => prev.map((c) => (c.id === id ? { ...c, done: !c.done } : c)))
  }

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
            <Repeat className="size-4 text-primary" aria-hidden="true" />
            <span className="font-medium text-foreground">{offer.wants}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{offer.terms}</p>
        </section>

        {/* Schedule */}
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="text-base font-medium text-foreground">Session schedule</h2>
          <div className="mt-4 space-y-3">
            <ScheduleRow title="Session 1 · React basics" when="Tue, May 6 · 6:30 PM" done />
            <ScheduleRow title="Session 2 · Hooks & state" when="Thu, May 8 · 6:30 PM" />
            <ScheduleRow title="Logo concepts review" when="Sat, May 10 · 11:00 AM" />
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            <CalendarClock className="size-4" />
            Propose a time
          </Button>
        </section>

        {/* Chat preview */}
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-medium text-foreground">Conversation</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/messages">
                <MessageSquare className="size-4" />
                Open full chat
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {THREAD.slice(-3).map((m) => (
              <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.fromMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <form
            className="mt-4 flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (!draft.trim()) return
              toast.success("Message sent")
              setDraft("")
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
            />
            <Button type="submit" size="icon" aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </section>
      </div>

      {/* Sidebar */}
      <aside className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-sm font-medium text-foreground">Participants</h2>
          <div className="space-y-3">
            <Participant id={CURRENT_USER.id} role="You" />
            <Participant id={partner.id} role="Partner" />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Progress</h2>
            <span className="text-xs text-muted-foreground">
              {doneCount}/{checklist.length}
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <ul className="mt-4 space-y-3">
            {checklist.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5">
                <Checkbox
                  id={`c-${c.id}`}
                  checked={c.done}
                  onCheckedChange={() => toggle(c.id)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`c-${c.id}`}
                  className={`text-sm leading-snug ${c.done ? "text-muted-foreground line-through" : "text-foreground"}`}
                >
                  {c.label}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <Button className="w-full" onClick={() => setReviewOpen(true)}>
            <Check className="size-4" />
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
            <DialogTitle>Leave a review for {partner.name.split(" ")[0]}</DialogTitle>
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
                <Star
                  className={`size-7 transition-colors ${
                    n <= stars ? "fill-primary text-primary" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea placeholder="Share a few words about the swap…" rows={4} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setReviewOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setReviewOpen(false)
                toast.success("Swap completed", { description: "Thanks for leaving a review!" })
              }}
            >
              Submit review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ScheduleRow({ title, when, done }: { title: string; when: string; done?: boolean }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5">
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-md ${
          done ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
        }`}
      >
        {done ? <Check className="size-4" /> : <CalendarClock className="size-4" />}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{when}</p>
      </div>
    </div>
  )
}

function Participant({ id, role }: { id: string; role: string }) {
  const person = getPerson(id)
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-9">
        <AvatarFallback>{person.name[0]}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">{person.name}</p>
        <p className="text-xs text-muted-foreground">{role}</p>
      </div>
    </div>
  )
}
