import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { TopNav } from "@/components/shell/top-nav"
import { SideNav } from "@/components/shell/side-nav"
import { MobileNav } from "@/components/shell/mobile-nav"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-background">
      <TopNav isAdmin={user.isAdmin} />
      <div className="mx-auto flex w-full max-w-[1400px]">
        <SideNav isAdmin={user.isAdmin} />
        <main className="min-w-0 flex-1 pb-24 lg:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}
