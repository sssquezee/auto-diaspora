/**
 * Reviews data layer — buyer rates seller after a deal.
 *
 * Eligibility rule mirrors the DB RLS policy:
 *   1. current user is signed in
 *   2. current user has at least one chat with the seller about the listing
 *   3. the listing is marked status='sold'
 *   4. current user hasn't already reviewed this listing
 *
 * Aggregates (avg rating, count) are computed on the fly — review
 * volume per seller is tiny, no need to denormalise.
 */

import { createClient } from "@/lib/supabase/server";

export type Review = {
  id: string;
  seller_id: string;
  buyer_id: string;
  listing_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at: string;
  buyer: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    email: string;
  } | null;
  listing: {
    id: string;
    brand: string;
    model: string;
    year: number;
  } | null;
};

export type SellerStats = {
  active_listings: number;
  sold_listings: number;
  member_since: string;
  review_count: number;
  avg_rating: number | null;
};

export type SellerProfile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  country: string | null;
  is_verified: boolean;
  is_dealer: boolean;
  created_at: string;
};

export async function getSellerProfile(
  sellerId: string
): Promise<SellerProfile | null> {
  if (!/^[0-9a-f]{8}-/i.test(sellerId)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,full_name,avatar_url,phone,city,country,is_verified,is_dealer,created_at"
    )
    .eq("id", sellerId)
    .maybeSingle<SellerProfile>();
  if (error) {
    console.error("[reviews] getSellerProfile:", error.message);
    return null;
  }
  return data;
}

export async function getSellerStats(sellerId: string): Promise<SellerStats> {
  const supabase = await createClient();

  const [activeRes, soldRes, profileRes, agg] = await Promise.all([
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", sellerId)
      .eq("status", "active"),
    supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("user_id", sellerId)
      .eq("status", "sold"),
    supabase
      .from("profiles")
      .select("created_at")
      .eq("id", sellerId)
      .maybeSingle<{ created_at: string }>(),
    supabase
      .from("reviews")
      .select("rating")
      .eq("seller_id", sellerId)
      .returns<Array<{ rating: number }>>(),
  ]);

  const ratings = agg.data ?? [];
  const review_count = ratings.length;
  const avg_rating =
    review_count > 0
      ? ratings.reduce((s, r) => s + r.rating, 0) / review_count
      : null;

  return {
    active_listings: activeRes.count ?? 0,
    sold_listings: soldRes.count ?? 0,
    member_since: profileRes.data?.created_at ?? new Date().toISOString(),
    review_count,
    avg_rating,
  };
}

export async function getSellerReviews(
  sellerId: string,
  limit = 20
): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select(
      "id,seller_id,buyer_id,listing_id,rating,comment,created_at,updated_at," +
        "buyer:profiles!reviews_buyer_id_fkey(id,full_name,avatar_url,email)," +
        "listing:listings(id,brand,model,year)"
    )
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<Review[]>();
  if (error) {
    console.error("[reviews] getSellerReviews:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Whether the *current* signed-in user can leave a review for this
 * (seller, listing) pair. Returns null when conditions aren't met so
 * the caller can branch on a single check.
 */
export async function getReviewEligibility(params: {
  sellerId: string;
  listingId: string;
}): Promise<
  | { eligible: false; reason: "not_authed" | "not_sold" | "no_chat" | "self" | "already_reviewed" }
  | { eligible: true; buyerId: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { eligible: false, reason: "not_authed" };
  if (user.id === params.sellerId) return { eligible: false, reason: "self" };

  // Listing must be sold AND belong to seller.
  const { data: listing } = await supabase
    .from("listings")
    .select("user_id,status")
    .eq("id", params.listingId)
    .maybeSingle<{ user_id: string; status: string }>();
  if (!listing) return { eligible: false, reason: "not_sold" };
  if (listing.user_id !== params.sellerId || listing.status !== "sold") {
    return { eligible: false, reason: "not_sold" };
  }

  // Chat must exist between buyer + seller on this listing.
  const { count: chatCount } = await supabase
    .from("chats")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", params.listingId)
    .eq("buyer_id", user.id)
    .eq("seller_id", params.sellerId);
  if ((chatCount ?? 0) === 0) return { eligible: false, reason: "no_chat" };

  // No prior review by this buyer for this listing.
  const { count: existingCount } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("buyer_id", user.id)
    .eq("listing_id", params.listingId);
  if ((existingCount ?? 0) > 0)
    return { eligible: false, reason: "already_reviewed" };

  return { eligible: true, buyerId: user.id };
}

export async function getBuyerReviewForListing(
  listingId: string
): Promise<Review | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("reviews")
    .select(
      "id,seller_id,buyer_id,listing_id,rating,comment,created_at,updated_at," +
        "buyer:profiles!reviews_buyer_id_fkey(id,full_name,avatar_url,email)," +
        "listing:listings(id,brand,model,year)"
    )
    .eq("buyer_id", user.id)
    .eq("listing_id", listingId)
    .maybeSingle<Review>();
  return data;
}
