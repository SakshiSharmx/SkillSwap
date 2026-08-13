"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Eye, Loader2, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/badges"
import { SwapPair } from "@/components/offer-card"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function MyOffersClient() {
  const [tab, setTab]       = useState("active")
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res  = await fetch("/api/offers/mine")
    const data = await res.json()
    setOffers(data.offers ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/offers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    toast.success(`Offer ${status === "active" ? "reactivated" : status}`)
    load()
  }

  async function deleteOffer(id: string) {
    await fetch(`/api/offers/${id}`, { method: "DELETE" })
    toast.success("Offer deleted")
    load()
  }

  const visible = offers.filter((o) => o.status === tab)

  return (
    <div className="mt-6">
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {["active","draft","paused","completed"].map((t) => (
            <TabsTrigger key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              <span className="ml-1.5 text-xs text-muted-foreground">
                {offers.filter((o) => o.status === t).length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-5 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : visible.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No {tab} offers yet.{" "}
            {tab === "active" && <Link href="/offers/new" className="text-primary hover:underline">Create one</Link>}
          </div>
        ) : (
          visible.map((offer) => {
            const id = String(offer._id)
            return (
              <div key={id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">{offer.title}</p>
                    <StatusBadge status={offer.status} />
                  </div>
                  <SwapPair offers={offer.offers} wants={offer.wants} className="mt-1" />
                  <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
                    <span>{offer.views ?? 0} views</span>
                    <span>{offer.saves ?? 0} saves</span>
                    <span>{offer.requests ?? 0} requests</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/offers/${id}`}><Eye className="size-4" />View</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/offers/${id}/edit`}><Pencil className="size-4" />Edit</Link>
                    </DropdownMenuItem>
                    {offer.status === "active" && (
                      <DropdownMenuItem onClick={() => updateStatus(id, "paused")}>
                        <Pause className="size-4" />Pause
                      </DropdownMenuItem>
                    )}
                    {offer.status === "paused" && (
                      <DropdownMenuItem onClick={() => updateStatus(id, "active")}>
                        <Play className="size-4" />Reactivate
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                          <Trash2 className="size-4" />Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this offer?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteOffer(id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
