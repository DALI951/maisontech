"use client";

import { useEffect, useState } from "react";
import { IconClose } from "@/components/icons";

const ROTATE_MS = 6500;
const DISMISS_KEY = "mt.announcement.dismissed";

/**
 * Rotating announcement bar. The messages come from the admin settings, so a
 * shop owner can edit them without touching code.
 */
export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") setVisible(false);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!visible || messages.length < 2 || paused) return;
    const timer = setInterval(() => setIndex((current) => (current + 1) % messages.length), ROTATE_MS);
    return () => clearInterval(timer);
  }, [messages.length, paused, visible]);

  if (!visible || messages.length === 0) return null;

  return (
    <div
      className="relative bg-navy text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-page flex h-9 items-center justify-center gap-3">
        <p key={index} className="fade-up truncate text-center text-[12px] font-medium tracking-[0.01em] text-white/90 sm:text-[12.5px]">
          {messages[index]}
        </p>
        {messages.length > 1 && (
          <span className="hidden items-center gap-1 sm:flex" aria-hidden="true">
            {messages.map((message, position) => (
              <button
                key={message}
                type="button"
                onClick={() => setIndex(position)}
                aria-label={`Annonce ${position + 1}`}
                className={`h-1 rounded-full transition-all ${
                  position === index ? "w-4 bg-white" : "w-1 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          try {
            window.sessionStorage.setItem(DISMISS_KEY, "1");
          } catch {
            /* ignore */
          }
        }}
        aria-label="Masquer les annonces"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
      >
        <IconClose size={14} />
      </button>
    </div>
  );
}
