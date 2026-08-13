import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  href = "/",
  showWord = true,
}: {
  className?: string
  href?: string
  showWord?: boolean
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 text-foreground", className)}
      aria-label="SkillSwap home"
    >
      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
          <path
            d="M7 8h7a3 3 0 0 1 0 6h-1M9 16l-2-2 2-2M17 16H10a3 3 0 0 1 0-6h1M15 8l2 2-2 2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {showWord && (
        <span className="text-base font-semibold tracking-tight">
          Skill<span className="text-primary">Swap</span>
        </span>
      )}
    </Link>
  )
}
