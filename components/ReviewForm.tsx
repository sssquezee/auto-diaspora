"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createReviewAction } from "@/app/[locale]/account/messages/[chatId]/actions";

type Props = {
  locale: string;
  chatId: string;
  sellerId: string;
  listingId: string;
  sellerName: string;
};

const MAX_COMMENT = 1000;

export function ReviewForm({
  locale,
  chatId,
  sellerId,
  listingId,
  sellerName,
}: Props) {
  const t = useTranslations("Review.form");
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");

  const active = hover || rating;

  return (
    <form
      action={createReviewAction}
      onSubmit={() => setSubmitting(true)}
      className="bg-white border-[1.5px] border-accent p-4 flex flex-col gap-3"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="chat_id" value={chatId} />
      <input type="hidden" name="seller_id" value={sellerId} />
      <input type="hidden" name="listing_id" value={listingId} />
      <input type="hidden" name="rating" value={rating} />

      <header className="flex items-baseline justify-between gap-2">
        <h3 className="font-sans font-extrabold text-[13px] uppercase tracking-[0.12em] text-ink m-0">
          {t("title", { name: sellerName })}
        </h3>
        <span className="font-mono text-[10px] text-ink-muted uppercase tracking-[0.1em]">
          {t("required")}
        </span>
      </header>
      <p className="font-sans text-[12px] text-ink-muted leading-relaxed m-0">
        {t("hint")}
      </p>

      {/* Star picker */}
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={t("starLabel", { n })}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            className={`bg-transparent border-0 cursor-pointer p-1 text-[28px] leading-none transition-colors ${
              n <= active ? "text-accent" : "text-ink-faded hover:text-accent"
            }`}
          >
            ★
          </button>
        ))}
        <span className="font-mono text-[11px] text-ink-muted ml-2">
          {rating > 0 ? t(`scale.${rating}`) : t("scalePrompt")}
        </span>
      </div>

      {/* Comment */}
      <div>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT))}
          placeholder={t("placeholder")}
          rows={3}
          className="w-full border-[1.5px] border-line-strong bg-white px-3 py-2.5 font-sans text-[13px] text-ink outline-none focus:border-ink focus:border-2 focus:px-[11px] focus:py-[9px] resize-y"
        />
        <div className="font-mono text-[10px] text-ink-muted text-right mt-1">
          {comment.length} / {MAX_COMMENT}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        className={`self-start font-sans font-extrabold text-[12px] uppercase tracking-[0.14em] px-5 py-2.5 cursor-pointer border-0 transition-colors ${
          submitting || rating === 0
            ? "bg-ink-faded text-white cursor-not-allowed"
            : "bg-accent hover:bg-accent-2 text-white"
        }`}
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
