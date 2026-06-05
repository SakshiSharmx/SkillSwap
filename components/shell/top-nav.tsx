"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Bell, LogOut, MessageSquare, Plus, Search, Settings, User } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TopNav() {
  const router = useRouter()
  const { data: session } = useSession()
  const [query, setQuery]           = useState("")
  const [unreadCount, setUnreadCount] = useState(0)

  const user   = session?.user
  const handle = (user as any)?.handle ?? ""

  useEffect(() => {
    if (!session) return
    fetch("/api/notifications?unread=true&limit=1")
      .then(r => r.json())
      .then(d => setUnreadCount(d.unreadCount ?? 0))
      .catch(() => {})
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetch("/api/notifications?unread=true&limit=1")
        .then(r => r.json())
        .then(d => setUnreadCount(d.unreadCount ?? 0))
        .catch(() => {})
    }, 30000)
    return () => clearInterval(interval)
  }, [session])

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4 md:px-6">
        <Logo />

        <form
          onSubmit={(e) => {
            e.preventDefault()
            router.push(`/browse${query ? `?q=${encodeURIComponent(query)}` : ""}`)
          }}
          className="ml-2 hidden max-w-md flex-1 items-center md:flex"
        >
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search skills, people, places…"
              className="h-9 w-full rounded-md border border-border bg-secondary pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1">
          <Link href="/browse" className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Search">
              <Search className="size-4" />
            </Button>
          </Link>

          <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link href="/offers/new">
              <Plus className="size-4" />
              New offer
            </Link>
          </Button>

          <Link href="/messages" aria-label="Messages"
            className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MessageSquare className="size-[18px]" />
          </Link>

          <Link href="/notifications" aria-label="Notifications"
            className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Bell className="size-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 rounded-full outline-none ring-ring/40 focus-visible:ring-2" aria-label="Open profile menu">
                <Avatar className="size-8">
                  <AvatarImage src={user?.image ?? "/placeholder-user.jpg"} alt={user?.name ?? "User"} />
                  <AvatarFallback>{(user?.name ?? "U")[0]}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-medium">{user?.name ?? "User"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {handle ? `@${handle}` : user?.email ?? ""}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/me"><User className="size-4" />View profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings"><Settings className="size-4" />Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="size-4" />Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}