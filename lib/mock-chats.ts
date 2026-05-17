/**
 * Mock chats and messages for /account/messages/*.
 * Replace with Supabase Realtime once chats + messages tables are wired up.
 */

import type { Locale } from "./mock-listings";

export type ChatBuyer = {
  name: string;
  initials: string;
  online: boolean;
};

export type Chat = {
  id: string;
  listingId: string;
  listingTitle: string;
  buyer: ChatBuyer;
  lastMessage: Record<Locale, string>;
  /** Display label for the chat list (already humanized in source) */
  timestamp: Record<Locale, string>;
  unread: number;
};

export type MessageAuthor = "me" | "them";

/** Logical day bucket — used as a divider in the thread. */
export type DayBucket = "today" | "yesterday" | "earlier";

export type ChatMessage = {
  id: string;
  author: MessageAuthor;
  text: Record<Locale, string>;
  time: string; // "10:15"
  day: DayBucket;
};

export const MOCK_CHATS: Chat[] = [
  {
    id: "c1",
    listingId: "4",
    listingTitle: "Audi A6 Avant Quattro",
    buyer: { name: "Maria K.", initials: "MK", online: true },
    lastMessage: {
      uk: "Чи можна подивитись авто в суботу зранку?",
      ru: "Можно посмотреть авто в субботу утром?",
      en: "Can I come see the car on Saturday morning?",
    },
    timestamp: { uk: "14:23", ru: "14:23", en: "14:23" },
    unread: 1,
  },
  {
    id: "c2",
    listingId: "6",
    listingTitle: "Mercedes E-Class E220d W213",
    buyer: { name: "Pavel S.", initials: "PS", online: false },
    lastMessage: {
      uk: "Дякую, передзвоню завтра.",
      ru: "Спасибо, перезвоню завтра.",
      en: "Thanks, I'll call back tomorrow.",
    },
    timestamp: { uk: "вчора", ru: "вчера", en: "yesterday" },
    unread: 0,
  },
];

export const MOCK_MESSAGES_BY_CHAT: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: "c1-m1",
      author: "them",
      day: "today",
      time: "10:15",
      text: {
        uk: "Добрий день! Авто ще в продажу?",
        ru: "Здравствуйте! Авто ещё в продаже?",
        en: "Hi! Is the car still available?",
      },
    },
    {
      id: "c1-m2",
      author: "me",
      day: "today",
      time: "10:18",
      text: {
        uk: "Вітаю, так, продається. Хочете огляд?",
        ru: "Здравствуйте, да, продаётся. Хотите осмотр?",
        en: "Hi, yes, still for sale. Want to see it in person?",
      },
    },
    {
      id: "c1-m3",
      author: "them",
      day: "today",
      time: "10:22",
      text: {
        uk: "Так, в ці вихідні?",
        ru: "Да, в эти выходные?",
        en: "Yes — this weekend?",
      },
    },
    {
      id: "c1-m4",
      author: "me",
      day: "today",
      time: "12:45",
      text: {
        uk: "Краще субота, зранку. Записати на 11:00?",
        ru: "Лучше суббота, утром. Записать на 11:00?",
        en: "Saturday morning works best. 11:00?",
      },
    },
    {
      id: "c1-m5",
      author: "them",
      day: "today",
      time: "14:23",
      text: {
        uk: "Чи можна подивитись авто в суботу зранку?",
        ru: "Можно посмотреть авто в субботу утром?",
        en: "Can I come see the car on Saturday morning?",
      },
    },
  ],
  c2: [
    {
      id: "c2-m1",
      author: "them",
      day: "yesterday",
      time: "16:01",
      text: {
        uk: "Доброго дня, торг можливий?",
        ru: "Здравствуйте, торг возможен?",
        en: "Hi, is the price negotiable?",
      },
    },
    {
      id: "c2-m2",
      author: "me",
      day: "yesterday",
      time: "16:30",
      text: {
        uk: "Мінімум 23 500 €. Вже знизив.",
        ru: "Минимум 23 500 €. Уже снизил.",
        en: "23 500 € is my floor — already discounted.",
      },
    },
    {
      id: "c2-m3",
      author: "them",
      day: "yesterday",
      time: "17:12",
      text: {
        uk: "Зрозумів. Подумаю до завтра.",
        ru: "Понял. Подумаю до завтра.",
        en: "Got it. Will think about it overnight.",
      },
    },
    {
      id: "c2-m4",
      author: "them",
      day: "yesterday",
      time: "18:55",
      text: {
        uk: "Дякую, передзвоню завтра.",
        ru: "Спасибо, перезвоню завтра.",
        en: "Thanks, I'll call back tomorrow.",
      },
    },
  ],
};

export function getChatById(id: string): Chat | null {
  return MOCK_CHATS.find((c) => c.id === id) ?? null;
}

export function getMessagesForChat(id: string): ChatMessage[] {
  return MOCK_MESSAGES_BY_CHAT[id] ?? [];
}
