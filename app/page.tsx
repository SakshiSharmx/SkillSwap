import Link from "next/link"
import Image from "next/image"
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  Handshake,
  MessageSquare,
  Repeat,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import { MarketingNav } from "@/components/landing/marketing-nav"
import { SiteFooter } from "@/components/landing/site-footer"
import { Button } from "@/components/ui/button"
import { OfferCard } from "@/components/offer-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CATEGORIES, OFFERS, PEOPLE } from "@/lib/data"

export default function LandingPage() {
  const featured = OFFERS.slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pt-14 md:px-6 md:pt-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" />
              No money. Just skills traded between people.
            </span>
            <h1 className="mt-5 text-balance font-serif text-4xl font-medium leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Trade what you know for what you want to learn.
            </h1>
            <p className="mt-5 max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
              SkillSwap is a local barter marketplace for students and neighbors. Offer a skill, ask for one in
              return, and grow together — no fees, no money changing hands.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  Start swapping
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/browse">Browse offers</Link>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                {Object.values(PEOPLE)
                  .slice(0, 4)
                  .map((p) => (
                    <Avatar key={p.id} className="size-8 border-2 border-background">
                      <AvatarImage src={p.avatar || "/placeholder.svg"} alt={p.name} />
                      <AvatarFallback>{p.name[0]}</AvatarFallback>
                    </Avatar>
                  ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">2,400+ swaps</span> completed this year
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border">
              <Image
                src="/landing/hero.png"
                alt="Two people swapping skills at a table"
                width={720}
                height={560}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <div className="absolute -bottom-4 left-4 hidden items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm sm:flex">
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/15 text-primary">
                <Handshake className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">React lessons</p>
                <p className="text-xs text-muted-foreground">swapped for a logo design</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Explore by category
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">A few of the things people are trading right now.</p>
          </div>
          <Link href="/browse" className="hidden shrink-0 items-center gap-1 text-sm text-primary hover:underline sm:flex">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {CATEGORIES.slice(0, 10).map((c) => (
            <Link
              key={c.name}
              href="/browse"
              className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <p className="text-sm font-medium text-foreground">{c.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{c.blurb}</p>
              <p className="mt-3 text-xs text-muted-foreground">{c.count} offers</p>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <div className="max-w-xl">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            How a swap works
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Four simple steps from finding someone to finishing a swap.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Compass, title: "Find a match", body: "Search offers or post your own. Filter by skill, location, and how you'd like to meet." },
            { icon: MessageSquare, title: "Agree on terms", body: "Message to align on what each of you will give and how much time it takes." },
            { icon: Repeat, title: "Make the swap", body: "Meet online or in person, track sessions, and keep everything in one workspace." },
            { icon: Star, title: "Review & repeat", body: "Leave a review to build trust, then line up your next swap with the community." },
          ].map((step, i) => (
            <div key={step.title} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-md bg-muted text-foreground">
                  <step.icon className="size-[18px]" />
                </span>
                <span className="font-serif text-2xl text-border">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-sm font-medium text-foreground">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured offers */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Featured offers
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Fresh swaps from people in the community.</p>
          </div>
          <Link href="/browse" className="hidden shrink-0 items-center gap-1 text-sm text-primary hover:underline sm:flex">
            See more <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      </section>

      {/* Trust & safety */}
      <section id="trust" className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <div className="grid items-center gap-10 rounded-xl border border-border bg-card p-6 md:grid-cols-2 md:p-10">
          <div>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              Built on trust, not transactions
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every member can verify their identity and student status. Ratings, completed swaps, and response
              reliability are always visible, so you know who you&apos;re trading with.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link href="/signup">Join the community</Link>
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: BadgeCheck, title: "Verified members", body: "Email, phone, and student verification badges." },
              { icon: Star, title: "Honest reviews", body: "Two-way reviews after every completed swap." },
              { icon: ShieldCheck, title: "Reporting tools", body: "Report offers or users in a couple of taps." },
              { icon: Handshake, title: "Clear agreements", body: "Every swap records what each side gives." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-background p-4">
                <item.icon className="size-5 text-primary" />
                <h3 className="mt-3 text-sm font-medium text-foreground">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <h2 className="max-w-xl text-balance text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          People who swapped
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            { id: "priya", quote: "I taught calculus and finally got conversational in French. Felt completely natural — like helping a friend." },
            { id: "tomas", quote: "Traded guitar lessons for a running coach. Two months later I ran my first half marathon." },
            { id: "amira", quote: "I got real design feedback for my app and shared a bit of my culture through cooking. Lovely community." },
          ].map(({ id, quote }) => {
            const p = PEOPLE[id]
            return (
              <figure key={id} className="flex flex-col rounded-lg border border-border bg-card p-5">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-primary" />
                  ))}
                </div>
                <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                  “{quote}”
                </blockquote>
                <figcaption className="mt-4 flex items-center gap-2.5">
                  <Avatar className="size-8">
                    <AvatarImage src={p.avatar || "/placeholder.svg"} alt={p.name} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.community}</p>
                  </div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-20 md:px-6 md:pt-28">
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center md:px-10 md:py-16">
          <h2 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-medium tracking-tight text-foreground md:text-4xl">
            Someone nearby wants exactly what you can teach.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground">
            Create your first offer in a couple of minutes. It&apos;s free, and always will be.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/signup">
                Create your offer
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/browse">Explore first</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mt-20 md:mt-28">
        <SiteFooter />
      </div>
    </div>
  )
}
