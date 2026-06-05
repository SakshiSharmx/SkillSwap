"use client"
import { useEffect, useState } from "react"
import { Loader2, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PageContainer, PageHeader } from "@/components/page-header"

export default function SettingsPage() {
  const [form, setForm]       = useState({ handle: "", area: "", community: "", bio: "", skillsOffered: "", skillsWanted: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    fetch("/api/users/me").then(r => r.json()).then(u => {
      setForm({
        handle:        u.handle ?? "",
        area:          u.area ?? "",
        community:     u.community ?? "",
        bio:           u.bio ?? "",
        skillsOffered: (u.skillsOffered ?? []).join(", "),
        skillsWanted:  (u.skillsWanted  ?? []).join(", "),
      })
      setLoading(false)
    })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        skillsOffered: form.skillsOffered.split(",").map(s => s.trim()).filter(Boolean),
        skillsWanted:  form.skillsWanted.split(",").map(s => s.trim()).filter(Boolean),
      }),
    })
    setSaving(false)
    if (res.ok) toast.success("Profile saved!")
    else toast.error("Failed to save")
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Update your profile and preferences." />
      <form onSubmit={save} className="mt-6 max-w-xl space-y-5">
        {[
          { label: "Handle", key: "handle", placeholder: "yourhandle" },
          { label: "Area / Neighbourhood", key: "area", placeholder: "e.g. Koramangala, Bangalore" },
          { label: "Community", key: "community", placeholder: "e.g. Christ University" },
        ].map(({ label, key, placeholder }) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Input id={key} value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} className="mt-1.5" />
          </div>
        ))}
        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="skillsOffered">Skills you offer (comma separated)</Label>
          <Input id="skillsOffered" value={form.skillsOffered} onChange={e => setForm(f => ({ ...f, skillsOffered: e.target.value }))} placeholder="React, Figma, Guitar..." className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="skillsWanted">Skills you want (comma separated)</Label>
          <Input id="skillsWanted" value={form.skillsWanted} onChange={e => setForm(f => ({ ...f, skillsWanted: e.target.value }))} placeholder="Cooking, Photography..." className="mt-1.5" />
        </div>
        <Button type="submit" disabled={saving} className="gap-2">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Save changes
        </Button>
      </form>
    </PageContainer>
  )
}
