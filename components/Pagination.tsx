import { Link } from "@/i18n/navigation";

type Props = {
  currentPage: number;
  totalPages: number;
  baseHref: string;
  /** Existing query string to preserve, e.g. "?brand=BMW&fuel=diesel" — must start with "?" or be empty. */
  preserveQuery?: string;
};

function buildHref(baseHref: string, preserve: string, page: number): string {
  if (page === 1) {
    return preserve ? `${baseHref}${preserve}` : baseHref;
  }
  if (!preserve) return `${baseHref}?page=${page}`;
  return `${baseHref}${preserve}&page=${page}`;
}

export function Pagination({
  currentPage,
  totalPages,
  baseHref,
  preserveQuery = "",
}: Props) {
  if (totalPages <= 1) return null;

  // Window the page numbers around the current page so the row never
  // overflows a phone screen (e.g. 50 pages → at most ~5 buttons + ellipses).
  const WINDOW = 1; // pages on each side of current
  const pageSet = new Set<number>([1, totalPages, currentPage]);
  for (let d = 1; d <= WINDOW; d++) {
    pageSet.add(currentPage - d);
    pageSet.add(currentPage + d);
  }
  const visible = [...pageSet]
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  // Build items with gap markers where pages are skipped.
  const items: Array<number | "gap"> = [];
  let prev = 0;
  for (const p of visible) {
    if (prev && p - prev > 1) items.push("gap");
    items.push(p);
    prev = p;
  }

  const linkClass =
    "min-w-[36px] h-9 grid place-items-center border-[1.5px] border-ink bg-white font-mono font-bold text-[13px] text-ink no-underline px-2 hover:bg-ink hover:text-white transition-colors";
  const activeClass =
    "min-w-[36px] h-9 grid place-items-center border-[1.5px] border-ink bg-ink text-white font-mono font-bold text-[13px] px-2";
  const disabledClass =
    "min-w-[36px] h-9 grid place-items-center border-[1.5px] border-line-strong bg-bg-subtle font-mono font-bold text-[13px] text-ink-faded px-2 cursor-not-allowed";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap justify-center gap-1 py-7">
      {currentPage > 1 ? (
        <Link
          href={buildHref(baseHref, preserveQuery, currentPage - 1)}
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

      {items.map((it, i) =>
        it === "gap" ? (
          <span
            key={`gap-${i}`}
            className="min-w-[36px] h-9 grid place-items-center font-mono font-bold text-[13px] text-ink-faded"
            aria-hidden
          >
            …
          </span>
        ) : (
          <Link
            key={it}
            href={buildHref(baseHref, preserveQuery, it)}
            className={it === currentPage ? activeClass : linkClass}
            aria-current={it === currentPage ? "page" : undefined}
          >
            {it}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={buildHref(baseHref, preserveQuery, currentPage + 1)}
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
