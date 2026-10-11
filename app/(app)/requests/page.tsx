import { PageContainer, PageHeader } from "@/components/page-header"
import { RequestsClient } from "@/components/requests/requests-client"

export default function RequestsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Requests"
        description="Manage swap requests coming in and the ones you've sent out."
      />
      <RequestsClient />
    </PageContainer>
  )
}
