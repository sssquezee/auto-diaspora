"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  sendMessageAction,
  markChatReadAction,
} from "@/app/[locale]/account/messages/actions";

type Labels = {
  todayLabel: string;
  yesterdayLabel: string;
  earlierLabel: string;
  composerPlaceholder: string;
  sendLabel: string;
  sendHint: string;
};

export type ChatMessage = {
  id: string;
  author: "me" | "them";
  body: string;
  createdAt: string;
};

type DayBucket = "today" | "yesterday" | "earlier";

function dayBucket(iso: string): DayBucket {
  const now = new Date();
  const then = new Date(iso);
  const sameDay =
    now.getFullYear() === then.getFullYear() &&
    now.getMonth() === then.getMonth() &&
    now.getDate() === then.getDate();
  if (sameDay) return "today";
  const dayDiff = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (dayDiff <= 1) return "yesterday";
  return "earlier";
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

type Props = {
  chatId: string;
  currentUserId: string;
  initialMessages: ChatMessage[];
  labels: Labels;
};

export function ChatRoom({
  chatId,
  currentUserId,
  initialMessages,
  labels,
}: Props) {
  const locale = useLocale();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Realtime — subscribe to INSERTs into messages for this chat
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            sender_id: string;
            body: string;
            created_at: string;
          };
          setMessages((prev) => {
            // Dedupe by real id (our own sent messages arrive back via RT too)
            if (prev.some((m) => m.id === row.id)) return prev;
            // Replace optimistic placeholder if it matches body + same author
            const optimisticIdx = prev.findIndex(
              (m) =>
                m.id.startsWith("optimistic-") &&
                m.body === row.body &&
                m.author === (row.sender_id === currentUserId ? "me" : "them")
            );
            const next: ChatMessage = {
              id: row.id,
              author: row.sender_id === currentUserId ? "me" : "them",
              body: row.body,
              createdAt: row.created_at,
            };
            if (optimisticIdx !== -1) {
              const copy = prev.slice();
              copy[optimisticIdx] = next;
              return copy;
            }
            return [...prev, next];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatId, currentUserId]);

  // Mark counterpart messages as read once on mount
  useEffect(() => {
    const fd = new FormData();
    fd.append("chat_id", chatId);
    fd.append("locale", locale);
    markChatReadAction(fd);
  }, [chatId, locale]);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [draft]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);

    // Optimistic insert
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: optimisticId,
      author: "me",
      body,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setDraft("");

    const fd = new FormData();
    fd.append("chat_id", chatId);
    fd.append("body", body);
    try {
      await sendMessageAction(fd);
    } catch {
      // Roll back optimistic on error
      setMessages((prev) => prev.filter((m) => m.id !== optimisticId));
    } finally {
      setSending(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Group messages by day bucket
  const groups: Array<{ day: DayBucket; items: ChatMessage[] }> = [];
  for (const msg of messages) {
    const d = dayBucket(msg.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.day === d) last.items.push(msg);
    else groups.push({ day: d, items: [msg] });
  }

  const dayLabel = (d: DayBucket) =>
    d === "today"
      ? labels.todayLabel
      : d === "yesterday"
      ? labels.yesterdayLabel
      : labels.earlierLabel;

  return (
    <div className="bg-white border-[1.5px] border-ink flex flex-col h-[min(75vh,720px)]">
      <div
        ref={threadRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col gap-3"
      >
        {groups.map((group, gi) => (
          <div key={gi} className="flex flex-col gap-2.5">
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-line" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-ink-faded">
                {dayLabel(group.day)}
              </span>
              <div className="flex-1 h-px bg-line" />
            </div>
            {group.items.map((msg) => (
              <Bubble key={msg.id} msg={msg} />
            ))}
          </div>
        ))}
      </div>

      <div className="border-t-[1.5px] border-ink px-3 sm:px-4 py-3 flex items-end gap-2">
        <textarea
          ref={taRef}
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKey}
          placeholder={labels.composerPlaceholder}
          disabled={sending}
          className="flex-1 resize-none border-[1.5px] border-line-strong focus:border-ink focus:border-2 bg-white px-3 py-2 font-sans text-[14px] text-ink outline-none leading-[1.4] disabled:bg-bg-subtle"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim() || sending}
          title={labels.sendHint}
          className="bg-accent hover:bg-accent-2 disabled:bg-ink-faded disabled:cursor-not-allowed text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.14em] px-4 py-3 cursor-pointer border-0 transition-colors flex-shrink-0"
        >
          {labels.sendLabel}
        </button>
      </div>
    </div>
  );
}

function Bubble({ msg }: { msg: ChatMessage }) {
  const me = msg.author === "me";
  const isOptimistic = msg.id.startsWith("optimistic-");
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] flex flex-col gap-1 ${me ? "items-end" : "items-start"}`}
      >
        <div
          className={`px-3.5 py-2.5 font-sans text-[14px] leading-[1.45] whitespace-pre-wrap ${
            me
              ? "bg-accent text-white"
              : "bg-bg-subtle text-ink border-[1.5px] border-line-strong"
          } ${isOptimistic ? "opacity-70" : ""}`}
        >
          {msg.body}
        </div>
        <span className="font-mono text-[10.5px] text-ink-faded px-1 tabular-nums">
          {timeLabel(msg.createdAt)}
        </span>
      </div>
    </div>
  );
}
