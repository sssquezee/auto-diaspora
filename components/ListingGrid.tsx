import { ListingCard } from "./ListingCard";
import { NoResults } from "./NoResults";
import { type Listing } from "@/lib/mock-listings";

type Props = {
  listings: Listing[];
  isAuthed: boolean;
  favoriteIds: Set<string>;
};

export async function ListingGrid({ listings, isAuthed, favoriteIds }: Props) {
  if (listings.length === 0) {
    return <NoResults />;
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {await Promise.all(
        listings.map(async (listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            isAuthed={isAuthed}
            isFavorite={favoriteIds.has(listing.id)}
          />
        ))
      )}
    </div>
  );
}
