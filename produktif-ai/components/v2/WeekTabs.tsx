"use client";

import { useId, useRef, useState } from "react";

// One made-up week of topics, shown as the WhatsApp-style message an owner
// gets, for three kinds of business. Phones show 3 days until asked for more.
type Day = [day: string, a: string, b: string];
const WEEKS: { key: string; tab: string; days: Day[]; reply: string }[] = [
  {
    key: "coffee",
    tab: "Coffee shop",
    days: [
      ["Mon", "Best-seller spotlight", "“Do you deliver?”"],
      ["Tue", "Keeping iced coffee from going watery", "Why I opened this shop"],
      ["Wed", "Payday bundle", "Hot drinks for rainy season"],
      ["Thu", "New on the menu", "“Is it halal?” (with your certificate)"],
      ["Fri", "Ordering for the office", "Weekend plans"],
      ["Sat", "Non-coffee drinks", "Where our beans come from"],
      ["Sun", "Weekend offer", "Opening hours and parking"],
    ],
    reply: "OK, all good. Change Thursday’s to the new matcha.",
  },
  {
    key: "skincare",
    tab: "Skincare",
    days: [
      ["Mon", "Best-seller: what it does, what it doesn’t", "“Can I use it with retinol?”"],
      ["Tue", "Morning vs night routine", "Why I started this brand"],
      ["Wed", "Payday bundle", "“Safe for sensitive skin?” (with your test results)"],
      ["Thu", "New size is in", "How we pack your order"],
      ["Fri", "One ingredient, explained", "The toner mistake most people make"],
      ["Sat", "Your top DM question this week", "What’s in the travel kit"],
      ["Sun", "Weekend offer", "Shipping times and where to buy"],
    ],
    reply: "All good. Swap Wednesday’s bundle for the new serum.",
  },
  {
    key: "service",
    tab: "Laundry",
    days: [
      ["Mon", "Same-day pickup: how it works", "“Do you wash comforters?”"],
      ["Tue", "Our price list in 30 seconds", "Why we started this laundry"],
      ["Wed", "How we keep whites white", "“Can you get this stain out?”"],
      ["Thu", "New: shoe cleaning", "How we fold and pack your order"],
      ["Fri", "One fabric-care tip", "The drying mistake that shrinks clothes"],
      ["Sat", "Your top WhatsApp question this week", "Behind the counter on a busy Saturday"],
      ["Sun", "Weekend offer", "Opening hours and pickup area"],
    ],
    reply: "OK. Move the shoe cleaning one to Monday.",
  },
];

export default function WeekTabs() {
  const uid = useId();
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const week = WEEKS[active];

  const move = (to: number) => {
    const i = (to + WEEKS.length) % WEEKS.length;
    setActive(i);
    tabs.current[i]?.focus();
  };

  return (
    <div className="week">
      <div className="week-tabs" role="tablist" aria-label="Kind of business">
        {WEEKS.map((w, i) => (
          <button
            key={w.key}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${uid}-tab-${w.key}`}
            aria-selected={i === active}
            aria-controls={`${uid}-panel`}
            tabIndex={i === active ? 0 : -1}
            className="week-tab"
            onClick={() => setActive(i)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") move(i + 1);
              else if (e.key === "ArrowLeft") move(i - 1);
            }}
          >
            {w.tab}
          </button>
        ))}
      </div>
      <div className={`chat${open ? " is-open" : ""}`} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${week.key}`}>
        <div className="chat-in">
          <p className="chat-from">produktif.ai</p>
          <p className="chat-title">Your 14 videos for next week</p>
          <ul className="chat-days">
            {week.days.map(([d, a, b]) => (
              <li key={d}>
                <em>{d}</em>
                <span>{a}</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <button type="button" className="chat-more" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            {open ? "Show less" : "See the full week"}
          </button>
        </div>
        <p className="chat-out">{week.reply}</p>
      </div>
      <p className="week-note">Made-up businesses, for illustration. In a real plan, every fact comes from you.</p>
    </div>
  );
}
