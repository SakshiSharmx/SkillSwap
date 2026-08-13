"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Rating } from "@/components/rating"
import { ModeTag, VerifiedBadge } from "@/components/badges"
import { cn } from "@/lib/utils"

export function SwapPair({ offers, wants, className }: { offers: string; wants: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <span className="rounded-md bg-muted px-2 py-1 font-medium text-foreground">{offers}</span>
      <ArrowRight className="size-3.5 shrink-0 text-primary" aria-hidden="true" />
      <span className="rounded-md border border-dashed border-border px-2 py-1 text-muted-foreground">{wants}</span>
    </div>
  )
}

export function OfferCard({ offer, layout = "grid" }: { offer: any; layout?: "grid" | "list" }) {
  const [saved, setSaved] = useState(false)
  const id = offer.id ?? String(offer._id)

  async function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    setSaved((s) => !s)
    await fetch("/api/saved", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: saved ? undefined : JSON.stringify({ offerId: id }),
    })
    if (saved) {
      const params = new URLSearchParams({ id })
      await fetch(`/api/saved?${params}`, { method: "DELETE" })
    }
  }

  return (
    <Link
      href={`/offers/${id}`}
      className={cn(
        "group relative flex flex-col rounded-lg border border-border bg-card transition-colors hover:border-primary/40",
        layout === "list" ? "sm:flex-row" : ""
      )}
    >
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-md border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground">
            {offer.category}
          </span>
          <button
            onClick={handleSave}
            className={cn("shrink-0 transition-colors", saved ? "text-primary" : "text-muted-foreground hover:text-foreground")}
            aria-label={saved ? "Unsave offer" : "Save offer"}
          >
            <Bookmark className={cn("size-4", saved && "fill-current")} />
          </button>
        </div>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:text-primary">
          {offer.title}
        </h3>

        <SwapPair offers={offer.offers} wants={offer.wants} />

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={offer.ownerImage ?? "/placeholder-user.jpg"} />
              <AvatarFallback>{(offer.ownerName ?? "U")[0]}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">{offer.ownerName ?? "SkillSwap user"}</span>
          </div>
          <ModeTag mode={offer.mode} />
        </div>
      </div>
    </Link>
  )
}
