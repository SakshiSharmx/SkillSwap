import { BadgeCheck, Globe, MapPin, Repeat } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Mode } from "@/lib/data"

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-success",
        className,
      )}
      title="Verified member"
    >
      <BadgeCheck className="size-3.5" aria-hidden="true" />
      Verified
    </span>
  )
}

const modeMeta: Record<Mode, { label: string; icon: typeof Globe }> = {
  online: { label: "Online", icon: Globe },
  "in-person": { label: "In person", icon: MapPin },
  both: { label: "Online or in person", icon: Repeat },
}

export function ModeTag({ mode, className }: { mode: Mode; className?: string }) {
  const meta = modeMeta[mode]
  const Icon = meta.icon
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Icon className="size-3.5" aria-hidden="true" />
      {meta.label}
    </span>
  )
}

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/20",
  draft: "bg-muted text-muted-foreground border-border",
  completed: "bg-primary/15 text-primary border-primary/20",
  expired: "bg-destructive/15 text-destructive border-destructive/25",
  paused: "bg-muted text-muted-foreground border-border",
  incoming: "bg-primary/15 text-primary border-primary/20",
  sent: "bg-muted text-muted-foreground border-border",
  accepted: "bg-success/15 text-success border-success/20",
  rejected: "bg-destructive/15 text-destructive border-destructive/25",
  negotiating: "bg-chart-3/15 text-chart-3 border-chart-3/25",
}

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        statusStyles[status] ?? statusStyles.draft,
        className,
      )}
    >
      {status}
    </span>
  )
}
