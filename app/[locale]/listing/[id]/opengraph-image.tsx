import { ImageResponse } from "next/og";
import { getListingById } from "@/lib/listings";

export const runtime = "nodejs";
export const alt = "Auto Diaspora listing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Per-listing OG image. Renders a card with the primary photo, brand +
 * model + year, price, and the SECONDBID-style brand tag.
 *
 * Telegram / WhatsApp / Twitter requests this at /listing/<id>/opengraph-image
 * — Next.js generates it on first hit and caches at the edge. No build-time
 * generation needed.
 */
export default async function ListingOG({ params }: { params: { id: string } }) {
  const listing = await getListingById(params.id);

  if (!listing) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0a0a0a",
            color: "#ffffff",
            fontFamily: "sans-serif",
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            textTransform: "uppercase",
          }}
        >
          Auto Diaspora
        </div>
      ),
      size
    );
  }

  const photo = listing.photoUrls?.[0];
  const title = `${listing.brand} ${listing.model}`.toUpperCase();
  const price = `€${listing.priceEur.toLocaleString("en-US")}`;
  const meta =
    listing.year != null && listing.mileageKm != null
      ? `${listing.year} · ${listing.mileageKm.toLocaleString("en-US")} km · ${listing.country}`
      : listing.country;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f5f5f5",
          fontFamily: "sans-serif",
        }}
      >
        {/* Photo half */}
        <div
          style={{
            width: 700,
            height: "100%",
            background: "#0a0a0a",
            display: "flex",
            position: "relative",
          }}
        >
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photo}
              alt=""
              width={700}
              height={630}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#888888",
                fontSize: 24,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              No photo
            </div>
          )}
        </div>

        {/* Right side — text */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 56,
            justifyContent: "space-between",
            background: "#ffffff",
            borderLeft: "3px solid #0a0a0a",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: "#0052ff",
                textTransform: "uppercase",
              }}
            >
              Auto Diaspora
            </div>
            <div
              style={{
                fontSize: 60,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                lineHeight: 1,
                color: "#0a0a0a",
                marginTop: 16,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#555555",
                marginTop: 12,
                letterSpacing: "0.04em",
              }}
            >
              {meta}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#888888",
              }}
            >
              Price
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                letterSpacing: "-0.05em",
                color: "#0a0a0a",
                lineHeight: 1,
              }}
            >
              {price}
            </div>
          </div>
        </div>
      </div>
    ),
    size
  );
}
