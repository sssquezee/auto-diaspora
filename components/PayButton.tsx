"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { TierKey } from "@/lib/tiers";

type Props = {
  tier: TierKey;
  listingId?: string;
  label: string;
  pendingLabel: string;
  errorLabel: string;
};

export function PayButton({ tier, listingId, label, pendingLabel, errorLabel }: Props) {
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mollie/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, listingId, locale }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `HTTP ${res.status}`);
      }
      const { checkoutUrl } = (await res.json()) as { checkoutUrl: string };
      // Slight delay so users notice the state transition in mock mode
      await new Promise((r) => setTimeout(r, 800));
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : errorLabel);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={loading}
        onClick={handlePay}
        className={`w-full font-sans font-extrabold text-[14px] uppercase tracking-[0.14em] py-4 cursor-pointer border-[1.5px] border-ink transition-all ${
          loading
            ? "bg-ink text-white cursor-wait"
            : "bg-accent hover:bg-accent-2 text-white shadow-[3px_3px_0_var(--ink)] hover:shadow-[6px_6px_0_var(--ink)] hover:-translate-x-[3px] hover:-translate-y-[3px]"
        }`}
      >
        {loading ? pendingLabel : label}
      </button>
      {error && (
        <p className="font-mono text-[11px] text-[#cf222e]" role="alert">
          {errorLabel}: {error}
        </p>
      )}
    </div>
  );
}
