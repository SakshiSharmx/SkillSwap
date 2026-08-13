import Link from "next/link"
import { Logo } from "@/components/logo"

const groups = [
  {
    title: "Product",
    links: [
      { label: "Browse offers", href: "/browse" },
      { label: "Create an offer", href: "/create" },
      { label: "Categories", href: "#categories" },
      { label: "Pricing", href: "#" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Trust & safety", href: "#trust" },
      { label: "Guidelines", href: "#" },
      { label: "Stories", href: "#" },
      { label: "Help center", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-5 md:px-6">
        <div className="col-span-2">
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Trade what you know for what you want to learn. A calmer, more human way to grow your skills.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <h3 className="text-sm font-medium text-foreground">{g.title}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {g.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row md:px-6">
          <p>© {new Date().getFullYear()} SkillSwap. Made for students and neighbors.</p>
          <p>Trade skills, not money.</p>
        </div>
      </div>
    </footer>
  )
}
