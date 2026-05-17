"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { buildSearchString, parseFilters } from "@/lib/filters";

type Props = {
  initialQuery: string;
  placeholder: string;
  submitLabel: string;
  clearLabel: string;
};

export function SearchInput({
  initialQuery,
  placeholder,
  submitLabel,
  clearLabel,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initialQuery);

  const submit = (next: string) => {
    const raw: Record<string, string | string[] | undefined> = {};
    searchParams.forEach((v, k) => {
      raw[k] = v;
    });
    const filters = parseFilters(raw);
    router.push(
      `/search${buildSearchString({
        ...filters,
        q: next.trim() || undefined,
        page: 1,
      })}`
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submit(q);
  };

  const clear = () => {
    setQ("");
    submit("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <div className="flex border-2 border-ink bg-white">
        <span className="grid place-items-center px-3 text-ink-muted border-r border-line">
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
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
        <input
          type="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="flex-1 min-w-0 px-3 py-3 font-sans text-[15px] text-ink outline-none bg-transparent"
        />
        {q && (
          <button
            type="button"
            onClick={clear}
            aria-label={clearLabel}
            className="px-3 text-ink-muted hover:text-ink cursor-pointer border-0 bg-transparent"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
        <button
          type="submit"
          className="bg-accent hover:bg-accent-2 text-white font-sans font-extrabold text-[13px] tracking-[0.1em] uppercase px-5 sm:px-6 cursor-pointer border-0 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
