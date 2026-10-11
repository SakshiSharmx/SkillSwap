"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell, MessageSquare, Plus, Search } from "lucide-react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </Link>
  )
}

export function TopNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const router = useRouter()
  const [q, setQ] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user ?? null))
  }, [])

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <Logo />

        <form
          onSubmit={(event) => {
            event.preventDefault()
            router.push(`/browse${q ? `?q=${encodeURIComponent(q)}` : ""}`)
          }}
          className="ml-2 hidden max-w-md flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="Search skills, people, places…"
              className="h-9 w-full rounded-md border border-border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/browse" className="md:hidden">
            <Button variant="ghost" size="icon"><Search className="size-4" /></Button>
          </Link>
          <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link href="/offers/new"><Plus className="size-4" />New offer</Link>
          </Button>
          <IconLink href="/messages" label="Messages"><MessageSquare className="size-[18px]" /></IconLink>
          <IconLink href="/notifications" label="Notifications"><Bell className="size-[18px]" /></IconLink>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-1 rounded-full outline-none ring-ring/40 focus-visible:ring-2" aria-label="Open account menu">
                  <Avatar className="size-8">
                    <AvatarFallback>{user.name?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex flex-col">
                  <span className="text-sm font-medium">{user.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link href="/profile/me">View profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings">Settings</Link></DropdownMenuItem>
                {isAdmin && <DropdownMenuItem asChild><Link href="/admin">Admin</Link></DropdownMenuItem>}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
