import {
  LayoutDashboard, Compass, Inbox, MessageSquare,
  Layers, Bookmark, Bell, Settings, User, Shield,
  type LucideIcon,
} from "lucide-react"

export type NavItem = { label: string; href: string; icon: LucideIcon; badge?: number }

export const primaryNav: NavItem[] = [
  { label: "Dashboard",    href: "/dashboard", icon: LayoutDashboard },
  { label: "Browse offers",href: "/browse",    icon: Compass },
  { label: "Requests",     href: "/requests",  icon: Inbox },
  { label: "Messages",     href: "/messages",  icon: MessageSquare },
  { label: "My offers",    href: "/my-offers", icon: Layers },
  { label: "Saved",        href: "/saved",     icon: Bookmark },
]

export const secondaryNav: NavItem[] = [
  { label: "Notifications", href: "/notifications", icon: Bell },
  { label: "Profile",       href: "/profile/me",    icon: User },
  { label: "Settings",      href: "/settings",      icon: Settings },
  { label: "Admin",         href: "/admin",          icon: Shield },
]

export const mobileNav: NavItem[] = [
  { label: "Home",     href: "/dashboard",  icon: LayoutDashboard },
  { label: "Browse",   href: "/browse",     icon: Compass },
  { label: "Requests", href: "/requests",   icon: Inbox },
  { label: "Messages", href: "/messages",   icon: MessageSquare },
  { label: "Profile",  href: "/profile/me", icon: User },
]
