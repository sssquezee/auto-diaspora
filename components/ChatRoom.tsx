"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, DayBucket } from "@/lib/mock-chats";
import type { Locale } from "@/lib/mock-listings";

type Labels = {
  todayLabel: string;
  yesterdayLabel: string;
  earlierLabel: string;
  composerPlaceholder: string;
  sendLabel: string;
  sendHint: string;
};

type Props = {
  initial: ChatMessage[];
  locale: Locale;
  labels: Labels;
};

export function ChatRoom({ initial, locale, labels }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
  }, [draft]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const msg: ChatMessage = {
      id: `local-${now.getTime()}`,
      author: "me",
      day: "today",
      time: `${hh}:${mm}`,
      text: { uk: text, ru: text, en: text },
    };
    setMessages((prev) => [...prev, msg]);
    setDraft("");
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const groups: Array<{ day: DayBucket; items: ChatMessage[] }> = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last.day === msg.day) last.items.push(msg);
    else groups.push({ day: msg.day, items: [msg] });
  }

  const dayLabel = (d: DayBucket) =>
    d === "today" ? labels.todayLabel : d === "yesterday" ? labels.yesterdayLabel : labels.earlierLabel;

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
              <Bubble key={msg.id} msg={msg} locale={locale} />
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
          className="flex-1 resize-none border-[1.5px] border-line-strong focus:border-ink focus:border-2 bg-white px-3 py-2 font-sans text-[14px] text-ink outline-none leading-[1.4]"
        />
        <button
          type="button"
          onClick={send}
          disabled={!draft.trim()}
          title={labels.sendHint}
          className="bg-accent hover:bg-accent-2 disabled:bg-ink-faded disabled:cursor-not-allowed text-white font-sans font-extrabold text-[12px] uppercase tracking-[0.14em] px-4 py-3 cursor-pointer border-0 transition-colors flex-shrink-0"
        >
          {labels.sendLabel}
        </button>
      </div>
    </div>
  );
}

function Bubble({ msg, locale }: { msg: ChatMessage; locale: Locale }) {
  const me = msg.author === "me";
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
          }`}
        >
          {msg.text[locale]}
        </div>
        <span className="font-mono text-[10.5px] text-ink-faded px-1 tabular-nums">
          {msg.time}
        </span>
      </div>
    </div>
  );
}
