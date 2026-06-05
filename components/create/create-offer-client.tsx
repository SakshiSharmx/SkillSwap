"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, ArrowRight, Check, Eye, Loader2, Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SwapPair } from "@/components/offer-card"
import { ModeTag } from "@/components/badges"
import { Rating } from "@/components/rating"
import { CATEGORIES, type Mode } from "@/lib/data"
import { cn } from "@/lib/utils"

type FormState = {
  title: string; category: string; offers: string; wants: string
  description: string; terms: string; mode: Mode; location: string
  level: string; availability: string; tags: string[]
}

const STEPS = ["Basics", "The swap", "Details", "Review"]

const initial: FormState = {
  title: "", category: "", offers: "", wants: "", description: "",
  terms: "", mode: "online", location: "", level: "Beginner",
  availability: "", tags: [],
}

export function CreateOfferClient() {
  const router = useRouter()
  const { data: session } = useSession()
  const [step, setStep]     = useState(0)
  const [form, setForm]     = useState<FormState>(initial)
  const [tagDraft, setTagDraft] = useState("")
  const [touched, setTouched]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    fetch("/api/users/me").then((r) => r.json()).then((d) => setUserProfile(d)).catch(() => {})
  }, [])

  const previewName    = userProfile?.name       ?? session?.user?.name  ?? "Your Name"
  const previewAvatar  = userProfile?.image      ?? session?.user?.image ?? "/placeholder-user.jpg"
  const previewArea    = userProfile?.area       ?? ""
  const previewRating  = userProfile?.rating     ?? 0
  const previewReviews = userProfile?.reviewCount ?? 0

  async function submitOffer(status: "active" | "draft") {
    setSubmitting(true)
    try {
      const res  = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed")
      toast.success(status === "draft" ? "Draft saved" : "Offer published!", {
        description: status === "draft"
          ? "You can finish it later from My Offers."
          : "Your offer is now live in Browse.",
      })
      router.push("/my-offers")
    } catch (err: any) {
      toast.error("Something went wrong", { description: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addTag() {
    const t = tagDraft.trim()
    if (!t || form.tags.includes(t) || form.tags.length >= 6) return
    update("tags", [...form.tags, t])
    setTagDraft("")
  }

  const stepValid = (() => {
    if (step === 0) return form.title.trim().length >= 8 && form.category !== ""
    if (step === 1) return form.offers.trim() !== "" && form.wants.trim() !== ""
    if (step === 2) return form.description.trim().length >= 20
    return true
  })()

  function next() {
    setTouched(true)
    if (!stepValid) return
    setTouched(false)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  function back() {
    setTouched(false)
    setStep((s) => Math.max(s - 1, 0))
  }

  const titleError    = touched && step === 0 && form.title.trim().length < 8
  const categoryError = touched && step === 0 && form.category === ""
  const swapError     = touched && step === 1
  const descError     = touched && step === 2 && form.description.trim().length < 20

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <ol className="mb-8 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  i === step && "border-primary bg-primary text-primary-foreground",
                  i < step  && "border-primary/40 bg-primary/15 text-primary",
                  i > step  && "border-border text-muted-foreground",
                )}
                aria-current={i === step ? "step" : undefined}
              >
                {i < step ? <Check className="size-3.5" /> : i + 1}
              </button>
              <span className={cn("hidden text-sm sm:inline", i === step ? "font-medium text-foreground" : "text-muted-foreground")}>
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-border" aria-hidden="true" />}
            </li>
          ))}
        </ol>

        <div className="rounded-lg border border-border bg-card p-5 md:p-6">
          {step === 0 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Offer title</Label>
                <Input id="title" placeholder="e.g. I'll teach you React, looking for a logo"
                  value={form.title} onChange={(e) => update("title", e.target.value)} aria-invalid={titleError} />
                <p className={cn("text-xs", titleError ? "text-destructive" : "text-muted-foreground")}>
                  {titleError ? "Give your offer a clear title (at least 8 characters)." : "A clear, specific title gets more requests."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={form.category} onValueChange={(v) => update("category", v)}>
                  <SelectTrigger id="category" aria-invalid={categoryError}>
                    <SelectValue placeholder="Choose a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {categoryError && <p className="text-xs text-destructive">Please pick a category.</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="offers">What you&apos;ll offer</Label>
                <Input id="offers" placeholder="e.g. React & TypeScript lessons"
                  value={form.offers} onChange={(e) => update("offers", e.target.value)}
                  aria-invalid={swapError && !form.offers.trim()} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wants">What you want in return</Label>
                <Input id="wants" placeholder="e.g. Logo design"
                  value={form.wants} onChange={(e) => update("wants", e.target.value)}
                  aria-invalid={swapError && !form.wants.trim()} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms">Exchange terms</Label>
                <Textarea id="terms" rows={3} placeholder="Describe the fair trade — sessions, deliverables, revisions…"
                  value={form.terms} onChange={(e) => update("terms", e.target.value)} />
              </div>
              {swapError && (!form.offers.trim() || !form.wants.trim()) && (
                <p className="text-xs text-destructive">Tell people what you offer and what you want.</p>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={5}
                  placeholder="Describe your experience, what a session looks like, and who this is for."
                  value={form.description} onChange={(e) => update("description", e.target.value)} aria-invalid={descError} />
                <p className={cn("text-xs", descError ? "text-destructive" : "text-muted-foreground")}>
                  {descError ? "Add a little more detail (at least 20 characters)." : `${form.description.length} characters`}
                </p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mode</Label>
                  <RadioGroup value={form.mode} onValueChange={(v) => update("mode", v as Mode)} className="gap-2">
                    {(["online", "in-person", "both"] as Mode[]).map((m) => (
                      <Label key={m} className="flex cursor-pointer items-center gap-2.5 rounded-md border border-border px-3 py-2 text-sm font-normal has-[:checked]:border-primary/50 has-[:checked]:bg-primary/5">
                        <RadioGroupItem value={m} />
                        <span className="capitalize">{m === "in-person" ? "In person" : m}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select value={form.level} onValueChange={(v) => update("level", v)}>
                      <SelectTrigger id="level"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Online or Brooklyn, NY"
                      value={form.location} onChange={(e) => update("location", e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="availability">Availability</Label>
                <Input id="availability" placeholder="e.g. Weekday evenings, EST"
                  value={form.availability} onChange={(e) => update("availability", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex gap-2">
                  <Input id="tags" placeholder="Add a tag and press Enter" value={tagDraft}
                    onChange={(e) => setTagDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }} />
                  <Button type="button" variant="outline" size="icon" onClick={addTag} aria-label="Add tag">
                    <Plus className="size-4" />
                  </Button>
                </div>
                {form.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {form.tags.map((t) => (
                      <span key={t} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs text-foreground">
                        {t}
                        <button type="button" onClick={() => update("tags", form.tags.filter((x) => x !== t))}
                          aria-label={`Remove ${t}`} className="text-muted-foreground hover:text-foreground">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="size-4" />This is how your offer will appear to others.
              </div>
              {[
                ["Title", form.title || "—"],
                ["Category", form.category || "—"],
                ["Swap", `${form.offers || "—"} → ${form.wants || "—"}`],
                ["Terms", form.terms || "—"],
                ["Description", form.description || "—"],
                ["Mode", form.mode === "in-person" ? "In person" : form.mode],
                ["Level", form.level],
                ["Location", form.location || "—"],
                ["Availability", form.availability || "—"],
                ["Tags", form.tags.length ? form.tags.join(", ") : "—"],
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-[100px_1fr] gap-3 border-b border-border pb-3 last:border-0">
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="text-sm text-foreground">{value}</dd>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <Button type="button" variant="ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft className="size-4" />Back
            </Button>
            <div className="flex items-center gap-2">
              {step === STEPS.length - 1 ? (
                <>
                  <Button type="button" variant="outline" onClick={() => submitOffer("draft")} disabled={submitting}>
                    {submitting && <Loader2 className="size-4 animate-spin" />}Save draft
                  </Button>
                  <Button type="button" onClick={() => submitOffer("active")} disabled={submitting}>
                    {submitting && <Loader2 className="size-4 animate-spin" />}Publish offer
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={next}>Continue<ArrowRight className="size-4" /></Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">Live preview</p>
        <article className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <Avatar className="size-8">
              <AvatarImage src={previewAvatar} alt={previewName} />
              <AvatarFallback>{previewName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{previewName}</p>
              <p className="text-xs text-muted-foreground">{form.location || previewArea || "Location"}</p>
            </div>
          </div>
          <h3 className="text-pretty text-base font-medium leading-snug text-foreground">
            {form.title || "Your offer title appears here"}
          </h3>
          <div className="mt-3">
            <SwapPair offers={form.offers || "You offer"} wants={form.wants || "You want"} />
          </div>
          {form.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{t}</span>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-3">
            <Rating value={previewRating} reviews={previewReviews} />
            <ModeTag mode={form.mode} />
          </div>
        </article>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Offers with a clear title, fair terms, and a few tags get noticed faster.{" "}
          <Link href="/browse" className="text-primary hover:underline">See examples</Link>
        </p>
      </aside>
    </div>
  )
}