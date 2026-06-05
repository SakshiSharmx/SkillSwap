import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function Rating({
  value,
  reviews,
  size = "sm",
  className,
}: {
  value: number
  reviews?: number
  size?: "sm" | "md"
  className?: string
}) {
  const starSize = size === "md" ? "size-4" : "size-3.5"
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground", className)}>
      <Star className={cn(starSize, "fill-primary text-primary")} aria-hidden="true" />
      <span className={cn("font-medium text-foreground", size === "md" ? "text-sm" : "text-xs")}>
        {value.toFixed(1)}
      </span>
      {reviews !== undefined && (
        <span className={size === "md" ? "text-sm" : "text-xs"}>({reviews})</span>
      )}
    </span>
  )
}
