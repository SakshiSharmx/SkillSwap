import { PageContainer, PageHeader } from "@/components/page-header"
import { MessageSquare } from "lucide-react"

export default function MessagesPage() {
  return (
    <PageContainer>
      <PageHeader title="Messages" description="Your conversations." />
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <MessageSquare className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Open a swap request to start chatting.</p>
      </div>
    </PageContainer>
  )
}
