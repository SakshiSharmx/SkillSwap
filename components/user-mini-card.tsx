import Link from "next/link"
import { CheckCircle2, MessageCircleReply, Repeat } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Rating } from "@/components/rating"
import { VerifiedBadge } from "@/components/badges"
import type { Person } from "@/lib/data"

export function UserMiniCard({ person }: { person: Person }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <Link href={`/profile/${person.id}`} className="flex items-center gap-3">
        <Avatar className="size-12">
          <AvatarImage src={person.avatar || "/placeholder.svg"} alt={person.name} />
          <AvatarFallback>{person.name[0]}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate font-medium text-foreground">{person.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{person.area}</p>
        </div>
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Rating value={person.rating} reviews={person.reviews} />
        {person.verified && <VerifiedBadge />}
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
        <div>
          <dt className="sr-only">Completed swaps</dt>
          <dd className="flex flex-col items-center gap-1">
            <Repeat className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{person.completedSwaps}</span>
            <span className="text-[11px] text-muted-foreground">swaps</span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Response rate</dt>
          <dd className="flex flex-col items-center gap-1">
            <MessageCircleReply className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{person.responseRate}%</span>
            <span className="text-[11px] text-muted-foreground">reply rate</span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Member since</dt>
          <dd className="flex flex-col items-center gap-1">
            <CheckCircle2 className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">{person.memberSince.split(" ")[1]}</span>
            <span className="text-[11px] text-muted-foreground">member</span>
          </dd>
        </div>
      </dl>
    </div>
  )
}
