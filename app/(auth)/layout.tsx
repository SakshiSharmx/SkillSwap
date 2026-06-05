import type { ReactNode } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PEOPLE } from "@/lib/data"

export default function AuthLayout({ children }: { children: ReactNode }) {
  const p = PEOPLE.priya
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-6 md:px-8">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </header>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      <aside className="relative hidden flex-col justify-between border-l border-border bg-card p-10 lg:flex">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-1.5 rounded-full bg-success" />
          Trusted by students and neighbors worldwide
        </div>
        <div className="max-w-md">
          <div className="flex gap-0.5 text-primary">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-primary" />
            ))}
          </div>
          <p className="mt-4 text-pretty font-serif text-2xl font-medium leading-snug text-foreground">
            “I taught calculus and finally got conversational in French. It felt completely natural — like helping a
            friend, and being helped right back.”
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarImage src={p.avatar || "/placeholder.svg"} alt={p.name} />
              <AvatarFallback>{p.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium text-foreground">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.community}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
          <div>
            <p className="font-serif text-2xl text-foreground">12k+</p>
            <p className="text-xs text-muted-foreground">members</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-foreground">2.4k</p>
            <p className="text-xs text-muted-foreground">swaps this year</p>
          </div>
          <div>
            <p className="font-serif text-2xl text-foreground">4.9</p>
            <p className="text-xs text-muted-foreground">avg. rating</p>
          </div>
        </div>
      </aside>
    </div>
  )
}
