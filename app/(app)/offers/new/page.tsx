import { PageContainer, PageHeader } from "@/components/page-header"
import { CreateOfferClient } from "@/components/create/create-offer-client"

export default function CreateOfferPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Create an offer"
        description="Share a skill you can teach and the skill you'd like in return. A clear, fair swap gets the best response."
      />
      <div className="mt-6">
        <CreateOfferClient />
      </div>
    </PageContainer>
  )
}
