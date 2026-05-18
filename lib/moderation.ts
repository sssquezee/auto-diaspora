/**
 * Lightweight content moderation for listings.
 *
 * Blocks obvious spam at submission time. Not a replacement for proper
 * moderation queue + ML — just the first filter that keeps the catalog
 * clean enough for MVP launch.
 *
 * False positives win over false negatives here: if a word is a problem
 * mostly when used as spam, we accept the rare edge case (user can
 * rephrase). Real-world tuning happens after first week of traffic.
 */

/**
 * Substrings that should NEVER appear in a clean car listing.
 * Lowercased — comparison is case-insensitive.
 *
 * Sources: typical second-hand-marketplace spam patterns across
 * UK/RU/EN traffic plus EU-specific schemes.
 */
const STOP_WORDS: readonly string[] = [
  // Crypto / forex / investment scams
  "bitcoin",
  "binance",
  "форекс",
  "forex",
  "криптoвалют",
  "криптовалют",
  "1xbet",
  "casino",
  "казино",
  // Adult services
  "escort",
  "ескорт",
  "эскорт",
  "viagra",
  // Drugs
  "марихуан",
  "marijuan",
  "cocain",
  "кокаин",
  "кокаїн",
  // Counterfeit / fraud-related auto-spam
  "перешить vin",
  "перешити vin",
  "vin под заказ",
  "скрутити пробіг",
  "скрутить пробег",
  // Generic scam attractors
  "easy money",
  "заробити швидко",
  "заработать быстро",
];

/**
 * Pattern that catches external links and Telegram handles inside the
 * description. Buyers reach out via the in-app chat — there is no
 * legitimate reason to embed external contacts in the description
 * (and "call/text me on +43..." spam is the #1 way scammers funnel
 * victims off-platform).
 */
const EXTERNAL_LINK = /(https?:\/\/|www\.[a-z0-9-]+\.|t\.me\/|@[a-z0-9_]{4,})/i;

export type ModerationResult =
  | { ok: true }
  | { ok: false; reason: "stop_word" | "external_url"; matched?: string };

export function moderateListing(input: {
  title: string;
  description: string | null;
}): ModerationResult {
  const haystack = `${input.title} ${input.description ?? ""}`.toLowerCase();

  for (const word of STOP_WORDS) {
    if (haystack.includes(word)) {
      return { ok: false, reason: "stop_word", matched: word };
    }
  }

  if (input.description && EXTERNAL_LINK.test(input.description)) {
    return { ok: false, reason: "external_url" };
  }

  return { ok: true };
}
