import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "./Logo";
import { MegaSearch } from "./MegaSearch";

function HeartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export async function Header() {
  const t = await getTranslations("Header.actions");

  return (
    <header className="bg-white border-b-2 border-ink">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-[18px] flex items-center gap-3 md:grid md:grid-cols-[auto_1fr_auto] md:gap-8">
        <Logo className="text-[20px] sm:text-[26px] shrink-0" />

        {/* Full search bar — desktop only. On mobile it lives on the catalog
            page (Hero/NavCats), so the header stays compact. */}
        <div className="hidden md:flex justify-center">
          <MegaSearch />
        </div>

        <div className="flex gap-2 items-center ml-auto md:ml-0">
          <button
            type="button"
            title={t("favorites")}
            aria-label={t("favorites")}
            className="w-9 h-9 sm:w-10 sm:h-10 border-[1.5px] border-ink bg-white grid place-items-center text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <HeartIcon />
          </button>

          <Link
            href="/account"
            title={t("profile")}
            aria-label={t("profile")}
            className="w-9 h-9 sm:w-10 sm:h-10 border-[1.5px] border-ink bg-white grid place-items-center text-ink hover:bg-ink hover:text-white transition-colors cursor-pointer relative no-underline shrink-0"
          >
            <UserIcon />
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"
            />
          </Link>

          <Link
            href="/new"
            aria-label={t("publish")}
            className="bg-ink text-white h-9 w-9 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 grid place-items-center font-sans font-extrabold text-[12px] tracking-[1px] uppercase no-underline hover:bg-accent transition-colors shrink-0"
          >
            {/* Plus icon on mobile, full label from sm up */}
            <span className="sm:hidden text-[20px] leading-none">+</span>
            <span className="hidden sm:inline">{t("publish")}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
