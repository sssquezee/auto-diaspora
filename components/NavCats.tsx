import { getTranslations } from "next-intl/server";

type Category = { key: string; href: string; active?: boolean };

const CATEGORIES: Category[] = [
  { key: "all", href: "/", active: true },
  { key: "cars", href: "/c/cars" },
  { key: "suv", href: "/c/suv" },
  { key: "electric", href: "/c/electric" },
  { key: "hybrid", href: "/c/hybrid" },
  { key: "moto", href: "/c/moto" },
  { key: "commercial", href: "/c/commercial" },
  { key: "trailers", href: "/c/trailers" },
  { key: "parts", href: "/c/parts" },
];

export async function NavCats() {
  const t = await getTranslations("NavCats");

  return (
    <nav
      aria-label="Categories"
      className="bg-white border-b border-line"
    >
      <div className="max-w-[1400px] mx-auto px-6 flex overflow-x-auto">
        {CATEGORIES.map((cat) => (
          <a
            key={cat.key}
            href={cat.href}
            className={`px-[18px] py-[13px] text-[13px] uppercase tracking-[0.04em] whitespace-nowrap no-underline transition-colors border-b-[3px] ${
              cat.active
                ? "text-ink font-extrabold border-accent"
                : "text-ink-muted font-semibold border-transparent hover:text-ink"
            }`}
          >
            {t(cat.key)}
          </a>
        ))}
      </div>
    </nav>
  );
}
