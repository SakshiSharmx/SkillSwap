"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, Check, MessageSquare, X } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/badges"

export function RequestCard({ request }: { request: any }) {
  const [status, setStatus] = useState(request.status)
  const isIncoming = request.direction === "incoming"

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/requests/${request._id ?? request.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setStatus(newStatus)
      toast.success(newStatus === "accepted" ? "Request accepted!" : "Request declined")
    } else {
      toast.error("Something went wrong")
    }
  }

  const personName  = isIncoming ? request.fromName  : request.toName
  const personImage = isIncoming ? request.fromImage : request.toImage

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="size-9">
            <AvatarImage src={personImage ?? "/placeholder-user.jpg"} />
            <AvatarFallback>{(personName ?? "U")[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-foreground">{personName ?? "SkillSwap user"}</p>
            <p className="text-xs text-muted-foreground">{request.proposed}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {request.message && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{request.message}</p>
      )}

      {isIncoming && (status === "sent" || status === "incoming") && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" onClick={() => updateStatus("accepted")} className="gap-1">
            <Check className="size-3.5" /> Accept
          </Button>
          <Button size="sm" variant="outline" onClick={() => updateStatus("rejected")} className="gap-1">
            <X className="size-3.5" /> Decline
          </Button>
        </div>
      )}
    </article>
  )
}
