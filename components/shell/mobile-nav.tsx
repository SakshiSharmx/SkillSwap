"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"
import { mobileNav } from "@/components/shell/nav-items"
import { cn } from "@/lib/utils"

export function MobileNav() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === pathname || (href !== "/dashboard" && pathname.startsWith(href))

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2">
        {mobileNav.slice(0, 2).map((item) => (
          <MobileLink key={item.href} item={item} active={isActive(item.href)} />
        ))}

        <Link
          href="/create"
          className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm"
          aria-label="Create offer"
        >
          <Plus className="size-5" />
        </Link>

        {mobileNav.slice(3).map((item) => (
          <MobileLink key={item.href} item={item} active={isActive(item.href)} />
        ))}
      </div>
    </nav>
  )
}

function MobileLink({
  item,
  active,
}: {
  item: { href: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }
  active: boolean
}) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      className={cn(
        "relative flex flex-1 flex-col items-center gap-1 py-2 text-[11px]",
        active ? "text-primary" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" />
      {item.label}
      {item.badge ? (
        <span className="absolute right-1/4 top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
          {item.badge}
        </span>
      ) : null}
    </Link>
  )
}
