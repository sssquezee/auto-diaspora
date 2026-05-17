import { ListingCard } from "./ListingCard";
import { MOCK_LISTINGS } from "@/lib/mock-listings";

export async function ListingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {await Promise.all(
        MOCK_LISTINGS.map(async (listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))
      )}
    </div>
  );
}
