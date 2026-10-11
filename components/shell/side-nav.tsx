"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { primaryNav, secondaryNav } from "@/components/shell/nav-items"
import { cn } from "@/lib/utils"

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  active,
}: {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
          : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
      )}
    >
      <Icon className="size-[18px] shrink-0" />
      <span className="flex-1">{label}</span>
      {badge ? (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

export function SideNav({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === pathname || (href !== "/dashboard" && pathname.startsWith(href))

  const visibleSecondaryNav = secondaryNav.filter((item) => item.href !== "/admin" || isAdmin)

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-3 py-5 lg:flex">
      <nav className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>
      <div className="my-4 border-t border-sidebar-border" />
      <nav className="flex flex-col gap-1">
        {visibleSecondaryNav.map((item) => (
          <NavLink key={item.href} {...item} active={isActive(item.href)} />
        ))}
      </nav>

      <div className="mt-auto rounded-lg border border-sidebar-border bg-sidebar-accent/40 p-3">
        <p className="text-sm font-medium text-foreground">Keep your profile useful</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Add the skills you can teach and the skills you want to learn so people can find a good match.
        </p>
        <Link href="/profile/me" className="mt-2 inline-block text-xs font-medium text-primary hover:underline">
          Update profile
        </Link>
      </div>
    </aside>
  )
}
