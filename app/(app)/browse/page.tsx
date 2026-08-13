import { BrowseClient } from "@/components/browse/browse-client"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  return <BrowseClient initialQuery={q ?? ""} />
}
