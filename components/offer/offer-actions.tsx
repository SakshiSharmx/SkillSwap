"use client"

import { useState } from "react"
import { Bookmark, Loader2, Send } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { SwapPair } from "@/components/offer-card"

export function OfferActions({ offer }: { offer: any }) {
  const [saved, setSaved]     = useState(false)
  const [open, setOpen]       = useState(false)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState("")
  const [proposed, setProposed] = useState("")

  async function handleSave() {
    if (saved) {
      await fetch(`/api/saved?id=${offer.id ?? String(offer._id)}`, { method: "DELETE" })
      setSaved(false)
      toast.success("Removed from saved")
    } else {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId: offer.id ?? String(offer._id) }),
      })
      setSaved(true)
      toast.success("Saved!")
    }
  }

  async function sendRequest(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offerId:  offer.id ?? String(offer._id),
        toId:     offer.ownerId,
        message,
        proposed,
      }),
    })
    setSending(false)
    if (res.ok) {
      toast.success("Request sent!", { description: "You'll be notified when they respond." })
      setOpen(false)
      setMessage("")
      setProposed("")
    } else {
      const data = await res.json()
      toast.error(data.error ?? "Failed to send request")
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-2">
            <Send className="size-4" />
            Send swap request
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a swap request</DialogTitle>
            <DialogDescription>
              Introduce yourself and explain what you're offering in return.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={sendRequest} className="flex flex-col gap-4 mt-2">
            <div>
              <Label htmlFor="proposed">What you're proposing</Label>
              <Input
                id="proposed"
                placeholder={`e.g. ${offer.wants} ↔ ${offer.offers}`}
                value={proposed}
                onChange={(e) => setProposed(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="message">Your message</Label>
              <Textarea
                id="message"
                placeholder="Tell them a bit about yourself and why this swap makes sense..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="mt-1.5"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={sending || !message.trim()}>
                {sending && <Loader2 className="size-4 animate-spin" />}
                Send request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Button variant="outline" className="w-full gap-2" onClick={handleSave}>
        <Bookmark className={`size-4 ${saved ? "fill-current text-primary" : ""}`} />
        {saved ? "Saved" : "Save offer"}
      </Button>
    </div>
  )
}
