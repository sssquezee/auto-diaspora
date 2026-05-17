import { Link } from "@/i18n/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
  baseHref: string;
};

export function Pagination({ currentPage, totalPages, baseHref }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const linkClass =
    "min-w-[36px] h-9 grid place-items-center border-[1.5px] border-ink bg-white font-mono font-bold text-[13px] text-ink no-underline px-2 hover:bg-ink hover:text-white transition-colors";
  const activeClass =
    "min-w-[36px] h-9 grid place-items-center border-[1.5px] border-ink bg-ink text-white font-mono font-bold text-[13px] px-2";
  const disabledClass =
    "min-w-[36px] h-9 grid place-items-center border-[1.5px] border-line-strong bg-bg-subtle font-mono font-bold text-[13px] text-ink-faded px-2 cursor-not-allowed";

  return (
    <nav
      aria-label="Pagination"
      className="flex justify-center gap-1 py-7"
    >
      {currentPage > 1 ? (
        <Link
          href={`${baseHref}?page=${currentPage - 1}`}
          className={linkClass}
          aria-label="Previous page"
        >
          ←
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden>
          ←
        </span>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={p === 1 ? baseHref : `${baseHref}?page=${p}`}
          className={p === currentPage ? activeClass : linkClass}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </Link>
      ))}

      {currentPage < totalPages ? (
        <Link
          href={`${baseHref}?page=${currentPage + 1}`}
          className={linkClass}
          aria-label="Next page"
        >
          →
        </Link>
      ) : (
        <span className={disabledClass} aria-hidden>
          →
        </span>
      )}
    </nav>
  );
}
