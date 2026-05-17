import { ListingCard } from "./ListingCard";
import { MOCK_LISTINGS, PAGE_SIZE } from "@/lib/mock-listings";

type Props = { page?: number };

export async function ListingGrid({ page = 1 }: Props) {
  const start = (page - 1) * PAGE_SIZE;
  const slice = MOCK_LISTINGS.slice(start, start + PAGE_SIZE);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {await Promise.all(
        slice.map(async (listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))
      )}
    </div>
  );
}
