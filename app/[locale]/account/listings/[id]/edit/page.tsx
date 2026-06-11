import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditListingForm } from "./EditListingForm";

type DbRow = {
  id: string;
  user_id: string;
  category: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
  fuel_type: string | null;
  transmission: string | null;
  body_type: string | null;
  drive_type: string | null;
  engine_volume: number | null;
  power_hp: number | null;
  color: string | null;
  vin: string | null;
  country: string;
  city: string;
  price: number;
  price_negotiable: boolean;
  condition: string;
  customs_cleared: boolean;
  description: string | null;
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // UUID sanity
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data } = await supabase
    .from("listings")
    .select(
      "id,user_id,category,brand,model,year,mileage,fuel_type,transmission,body_type,drive_type,engine_volume,power_hp,color,vin,country,city,price,price_negotiable,condition,customs_cleared,description"
    )
    .eq("id", id)
    .maybeSingle<DbRow>();

  if (!data) notFound();
  // Defence in depth — RLS already enforces this, but redirect cleanly
  if (data.user_id !== user.id) {
    redirect(`/${locale}/account/listings`);
  }

  // Fetch existing photos for the PhotosEditor
  const { data: photoRows } = await supabase
    .from("listing_photos")
    .select("id, storage_path, position")
    .eq("listing_id", id)
    .order("position", { ascending: true });

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost";
  const existingPhotos = (photoRows ?? []).map((p) => {
    const row = p as { id: string; storage_path: string };
    return {
      id: row.id,
      url: `${supabaseUrl}/storage/v1/object/public/listings/${row.storage_path}`,
    };
  });

  const t = await getTranslations("EditListing");

  return (
    <div className="max-w-[860px] w-full mx-auto px-6 py-8">
      <Link
        href="/account/listings"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-accent no-underline mb-3 inline-block"
      >
        ← {t("back")}
      </Link>

      <header className="mb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent mb-2">
          {t("kicker")}
        </p>
        <h1 className="font-sans font-black text-[32px] sm:text-[40px] uppercase tracking-[-0.04em] text-ink leading-none">
          {data.brand} {data.model}
        </h1>
      </header>

      <EditListingForm
        listingId={data.id}
        locale={locale}
        userId={user.id}
        existingPhotos={existingPhotos}
        defaults={{
          category: data.category,
          brand: data.brand,
          model: data.model,
          year: data.year ?? undefined,
          mileage: data.mileage ?? undefined,
          fuel_type: data.fuel_type ?? undefined,
          transmission: data.transmission ?? undefined,
          body_type: data.body_type ?? undefined,
          drive_type: data.drive_type ?? undefined,
          engine_volume: data.engine_volume,
          power_hp: data.power_hp,
          color: data.color,
          vin: data.vin,
          country: data.country,
          city: data.city,
          price: Number(data.price),
          price_negotiable: data.price_negotiable,
          condition: data.condition,
          customs: data.customs_cleared ? "yes" : "no",
          description: data.description,
        }}
      />
    </div>
  );
}
