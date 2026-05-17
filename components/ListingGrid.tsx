import { ListingCard } from "./ListingCard";
import { type Listing } from "@/lib/mock-listings";

type Props = { listings: Listing[] };

export async function ListingGrid({ listings }: Props) {
  if (listings.length === 0) {
    return (
      <div className="bg-white border-[1.5px] border-line px-6 py-12 text-center">
        <p className="font-mono text-[12px] uppercase tracking-[0.16em] text-ink-muted">
          —
        </p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {await Promise.all(
        listings.map(async (listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))
      )}
    </div>
  );
}
