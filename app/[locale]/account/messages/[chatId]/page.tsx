import { notFound, redirect } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChatRoom } from "@/components/ChatRoom";
import { ReviewForm } from "@/components/ReviewForm";
import { createClient } from "@/lib/supabase/server";
import { getChatById, getChatMessages } from "@/lib/chats-server";
import { getBuyerReviewForListing } from "@/lib/reviews";
import type { Locale } from "@/lib/mock-listings";

export default async function ChatDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; chatId: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { locale: localeParam, chatId } = await params;
  setRequestLocale(localeParam);
  const locale = localeParam as Locale;
  const sp = await searchParams;

  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chatId)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const chat = await getChatById(chatId);
  if (!chat) notFound();

  const messages = await getChatMessages(chatId);

  // Review eligibility: buyer side only, listing sold, no prior review.
  const canBuyerReview = !chat.iAmSeller && chat.listing.status === "sold";
  const existingReview = canBuyerReview
    ? await getBuyerReviewForListing(chat.listing.id)
    : null;
  const showReviewForm = canBuyerReview && !existingReview;

  const t = await getTranslations("Account.messages.chat");
  const tReview = await getTranslations("Review");

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/account/messages"
        className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-muted hover:text-accent no-underline self-start"
      >
        ← {t("back")}
      </Link>

      <header className="bg-white border-[1.5px] border-ink p-4 flex items-center gap-3 flex-wrap">
        <div className="w-12 h-12 bg-accent text-white grid place-items-center font-sans font-black text-[15px] flex-shrink-0">
          {chat.counterpart.initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-sans font-extrabold text-[15px] uppercase tracking-[-0.01em] text-ink truncate">
            {chat.counterpart.name}
          </div>
          <div className="font-mono text-[11px] text-ink-muted mt-0.5">
            {chat.iAmSeller ? t("asSeller") : t("asBuyer")}
          </div>
        </div>

        <Link
          href={`/listing/${chat.listing.id}`}
          className="no-underline border-[1.5px] border-ink px-3 py-2 bg-white hover:bg-ink hover:text-white text-ink transition-colors flex items-center gap-2 max-w-full"
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            {t("about")}
          </span>
          <span className="font-sans font-bold text-[13px] uppercase tracking-[-0.01em] truncate">
            {chat.listing.title}
          </span>
        </Link>
      </header>

      {sp?.review === "ok" && (
        <div
          role="status"
          className="bg-accent-soft border-l-[3px] border-accent p-3 font-sans text-[13px] text-ink leading-relaxed"
        >
          {tReview("banners.thanks")}
        </div>
      )}
      {sp?.review && sp.review !== "ok" && (
        <div
          role="alert"
          className="bg-[#cf222e]/5 border-l-[3px] border-[#cf222e] p-3 font-sans text-[13px] text-[#cf222e] leading-relaxed"
        >
          {tReview(`errors.${sp.review}` as
            | "errors.invalid"
            | "errors.not_authed"
            | "errors.not_sold"
            | "errors.no_chat"
            | "errors.self"
            | "errors.already_reviewed"
            | "errors.server")}
        </div>
      )}

      {existingReview && (
        <div className="bg-white border-[1.5px] border-line-strong p-4 flex flex-col gap-2">
          <h3 className="font-sans font-extrabold text-[12px] uppercase tracking-[0.12em] text-ink m-0">
            {tReview("existing.title")}
          </h3>
          <div className="font-mono text-[14px] text-accent">
            {"★".repeat(existingReview.rating)}
            <span className="text-ink-faded">
              {"★".repeat(5 - existingReview.rating)}
            </span>
          </div>
          {existingReview.comment && (
            <p className="font-sans text-[13px] text-ink leading-relaxed m-0 whitespace-pre-wrap">
              {existingReview.comment}
            </p>
          )}
        </div>
      )}

      {showReviewForm && (
        <ReviewForm
          locale={locale}
          chatId={chat.id}
          sellerId={chat.sellerId}
          listingId={chat.listing.id}
          sellerName={chat.counterpart.name}
        />
      )}

      <ChatRoom
        chatId={chat.id}
        currentUserId={user.id}
        initialMessages={messages.map((m) => ({
          id: m.id,
          author: m.sender_id === user.id ? "me" : "them",
          body: m.body,
          createdAt: m.created_at,
        }))}
        labels={{
          todayLabel: t("day.today"),
          yesterdayLabel: t("day.yesterday"),
          earlierLabel: t("day.earlier"),
          composerPlaceholder: t("composer.placeholder"),
          sendLabel: t("composer.send"),
          sendHint: t("composer.sendHint"),
        }}
      />
    </div>
  );
}
