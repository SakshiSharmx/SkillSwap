import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Code2,
  Languages,
  Palette,
  Repeat2,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"
import { MarketingNav } from "@/components/landing/marketing-nav"
import { SiteFooter } from "@/components/landing/site-footer"
import { Button } from "@/components/ui/button"

const categories = [
  { name: "Development", description: "Programming, web and software skills.", icon: Code2 },
  { name: "Design", description: "UI, branding and visual design.", icon: Palette },
  { name: "Languages", description: "Conversation, writing and exam practice.", icon: Languages },
  { name: "Tutoring", description: "Maths, science and academic help.", icon: BookOpen },
]

const steps = [
  { number: "01", title: "Find a skill", text: "Browse offers and find someone who can teach what you want to learn." },
  { number: "02", title: "Make an offer", text: "Tell them what you can teach in return. Keep the exchange simple and clear." },
  { number: "03", title: "Agree and swap", text: "Message each other, agree on the details and complete the skill exchange." },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-20 pt-20 md:px-6 md:pb-28 md:pt-28">
          <div className="max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">SkillSwap</p>
            <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
              Learn a skill. Teach a skill. Swap fairly.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
              SkillSwap is a simple platform where people exchange skills instead of money. Find something you want to learn and offer something you know in return.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">Create an account <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/browse"><Search className="size-4" /> Browse offers</Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 grid gap-4 border-y border-border py-8 md:grid-cols-3">
            {[
              { icon: Repeat2, title: "Skill for skill", text: "No prices or payments. Agree on a useful exchange." },
              { icon: Users, title: "People first", text: "Profiles, requests and messages keep the exchange clear." },
              { icon: ShieldCheck, title: "Built with trust", text: "Authentication, reviews and clear ownership protect users." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 md:border-r md:border-border md:px-5 first:md:pl-0 last:md:border-r-0 last:md:pr-0">
                <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="categories" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-primary">Browse skills</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">Start with something you want to learn.</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">These are examples of the kinds of offers you can find on SkillSwap. Real offers come from registered users.</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link key={category.name} href="/browse" className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/60">
                  <category.icon className="size-5 text-primary" />
                  <h3 className="mt-4 text-sm font-semibold">{category.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{category.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
            <div className="max-w-xl">
              <p className="text-sm font-medium text-primary">How it works</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">A straightforward exchange.</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="border-t border-border pt-5">
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground">{step.number}</span>
                  <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="trust" className="border-t border-border">
          <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
            <div className="flex flex-col justify-between gap-8 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:p-8">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-primary">A real project, not a showcase of fake activity</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">The platform starts with you.</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">There are no made-up swap counts, testimonials or user activity on this page. Once people use the platform, the database can provide real statistics and activity.</p>
              </div>
              <Button asChild variant="outline" className="shrink-0"><Link href="/signup">Join SkillSwap</Link></Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
