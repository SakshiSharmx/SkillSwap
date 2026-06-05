"use client"

import { useEffect, useState, useCallback } from "react"
import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { OfferCard } from "@/components/offer-card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"

const CATEGORIES = ["Development","Design","Languages","Music","Cooking","Fitness","Tutoring","Writing","Photography","Crafts"]
const MODES = [{ value: "online", label: "Online" }, { value: "in-person", label: "In person" }, { value: "both", label: "Either" }]
const LEVELS = ["Beginner", "Intermediate", "Advanced"]

export function BrowseClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery]   = useState(initialQuery)
  const [cats, setCats]     = useState<string[]>([])
  const [modes, setModes]   = useState<string[]>([])
  const [levels, setLevels] = useState<string[]>([])
  const [sort, setSort]     = useState("newest")
  const [view, setView]     = useState<"grid" | "list">("grid")
  const [offers, setOffers] = useState<any[]>([])
  const [total, setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchOffers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ sort, status: "active" })
    if (query.trim())  params.set("q", query.trim())
    if (cats.length)   params.set("category", cats[0])
    if (modes.length)  params.set("mode", modes[0])
    if (levels.length) params.set("level", levels[0])

    const res  = await fetch(`/api/offers?${params.toString()}`)
    const data = await res.json()
    setOffers(data.offers ?? [])
    setTotal(data.pagination?.total ?? 0)
    setLoading(false)
  }, [query, cats, modes, levels, sort])

  useEffect(() => {
    const t = setTimeout(fetchOffers, 300)
    return () => clearTimeout(t)
  }, [fetchOffers])

  const toggle = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>) => (val: T) =>
    setter((prev) => prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val])

  const reset = () => { setCats([]); setModes([]); setLevels([]); setQuery("") }
  const activeFilters = cats.length + modes.length + levels.length

  const FilterControls = () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-foreground">Filters</h2>
        <button onClick={reset} className="text-xs text-primary hover:underline">Reset</button>
      </div>
      <fieldset>
        <legend className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Category</legend>
        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((c) => (
            <Label key={c} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal">
              <Checkbox checked={cats.includes(c)} onCheckedChange={() => toggle(setCats)(c)} />
              <span className="flex-1 text-foreground">{c}</span>
            </Label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Mode</legend>
        <div className="flex flex-col gap-2.5">
          {MODES.map((m) => (
            <Label key={m.value} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal text-foreground">
              <Checkbox checked={modes.includes(m.value)} onCheckedChange={() => toggle(setModes)(m.value)} />
              {m.label}
            </Label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Level</legend>
        <div className="flex flex-col gap-2.5">
          {LEVELS.map((l) => (
            <Label key={l} className="flex cursor-pointer items-center gap-2.5 text-sm font-normal text-foreground">
              <Checkbox checked={levels.includes(l)} onCheckedChange={() => toggle(setLevels)(l)} />
              {l}
            </Label>
          ))}
        </div>
      </fieldset>
    </div>
  )

  return (
    <div className="px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Browse offers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{total} active offers.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills, e.g. React, guitar, Spanish…"
            className="h-10 w-full rounded-md border border-border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 lg:hidden">
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilters > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {activeFilters}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto p-5">
              <SheetHeader className="px-0"><SheetTitle>Filters</SheetTitle></SheetHeader>
              <FilterControls />
            </SheetContent>
          </Sheet>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[150px]" size="sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Most recent</SelectItem>
              <SelectItem value="popular">Most viewed</SelectItem>
              <SelectItem value="saves">Most saved</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden items-center rounded-md border border-border p-0.5 sm:flex">
            <button onClick={() => setView("grid")} className={cn("rounded p-1.5", view === "grid" ? "bg-muted text-foreground" : "text-muted-foreground")} aria-label="Grid view">
              <LayoutGrid className="size-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("rounded p-1.5", view === "list" ? "bg-muted text-foreground" : "text-muted-foreground")} aria-label="List view">
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {activeFilters > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {[...cats, ...modes, ...levels].map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-foreground">{f}</span>
          ))}
          <button onClick={reset} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="size-3" /> Clear all
          </button>
        </div>
      )}

      <div className="mt-6 flex gap-8">
        <div className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20"><FilterControls /></div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-4 text-sm text-muted-foreground">{offers.length} {offers.length === 1 ? "result" : "results"}</p>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-lg border border-border bg-card animate-pulse" />)}
            </div>
          ) : offers.length === 0 ? (
            <Empty className="rounded-lg border border-dashed border-border py-16">
              <EmptyHeader>
                <EmptyMedia variant="icon"><Search className="size-5" /></EmptyMedia>
                <EmptyTitle>No offers match your search</EmptyTitle>
                <EmptyDescription>Try removing a filter or searching for a broader skill.</EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" size="sm" onClick={reset}>Clear filters</Button>
            </Empty>
          ) : (
            <div className={cn(view === "grid" ? "grid gap-4 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-3")}>
              {offers.map((offer) => (
                <OfferCard key={String(offer._id)} offer={{ ...offer, id: String(offer._id) }} layout={view} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
