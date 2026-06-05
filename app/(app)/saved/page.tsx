import { getServerSession } from "next-auth"
import Link from "next/link"
import { ObjectId } from "mongodb"
import { Bookmark } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { PageContainer, PageHeader } from "@/components/page-header"
import { OfferCard } from "@/components/offer-card"
import { getDb } from "@/lib/mongodb"

export default async function SavedPage() {
  const session = await getServerSession(authOptions)
  const userId  = session?.user?.id ?? ""

  let offers: any[] = []

  try {
    const db    = await getDb()
    const saved = await db
      .collection("savedOffers")
      .find({ userId })
      .sort({ savedAt: -1 })
      .toArray()

    const ids = saved.map((s: any) => {
      // offerId is stored as a string — convert to ObjectId for the lookup
      try { return new ObjectId(s.offerId) } catch { return s.offerId }
    })

    if (ids.length > 0) {
      offers = await db
        .collection("offers")
        .find({ _id: { $in: ids as any[] } })
        .toArray()
    }
  } catch {}

  return (
    <PageContainer>
      <PageHeader
        title="Saved offers"
        description="Offers you've bookmarked."
      />

      {offers.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center">
          <Bookmark className="size-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No saved offers yet.</p>
          <Link href="/browse" className="text-sm text-primary hover:underline">
            Browse offers
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o: any) => (
            <OfferCard
              key={String(o._id)}
              offer={{ ...o, id: String(o._id) }}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}