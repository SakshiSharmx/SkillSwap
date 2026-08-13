import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { TopNav } from "@/components/shell/top-nav"
import { SideNav } from "@/components/shell/side-nav"
import { MobileNav } from "@/components/shell/mobile-nav"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <div className="mx-auto flex w-full max-w-[1400px]">
        <SideNav />
        <main className="min-w-0 flex-1 pb-24 lg:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  )
}