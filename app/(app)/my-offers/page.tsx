import Link from "next/link"
import { Plus } from "lucide-react"
import { PageContainer, PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { MyOffersClient } from "@/components/my-offers/my-offers-client"

export default function MyOffersPage() {
  return (
    <PageContainer>
      <PageHeader title="My offers" description="Track performance and manage the skills you're offering.">
        <Button asChild>
          <Link href="/offers/new">
            <Plus className="size-4" />
            New offer
          </Link>
        </Button>
      </PageHeader>
      <MyOffersClient />
    </PageContainer>
  )
}
