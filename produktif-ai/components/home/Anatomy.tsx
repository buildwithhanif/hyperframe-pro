"use client";

import { m, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { AiChip } from "@/components/site/Brand";

const SEGS = [
  { at: "0:00", name: "Hook", what: "Your AI persona", cls: "tl-hook" },
  { at: "0:05", name: "Middle", what: "Motion graphics and screen demos, narrated in your voice", cls: "tl-body" },
  { at: "0:35", name: "Outro", what: "Your persona and your call to action", cls: "tl-outro" },
];

// The timeline of one video, with a playhead that follows the scroll. It runs
// on the compositor: one scaleX transform, nothing else.
export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const transform = useTransform(scrollYProgress, [0.2, 0.75], ["scaleX(0)", "scaleX(1)"]);
  return (
    <div ref={ref} className="tl">
      <ol className="tl-segs">
        {SEGS.map((s) => (
          <li key={s.name} className={`tl-seg ${s.cls}`}>
            <em>{s.at}</em>
            <b>{s.name}</b>
            <span>{s.what}</span>
          </li>
        ))}
      </ol>
      <div className="tl-track" aria-hidden="true">
        <m.i style={reduce ? { transform: "scaleX(1)" } : { transform }} />
      </div>
      <p className="tl-every">
        <em>Every video</em> Captions burned in, plus a post caption with hashtags and a CTA.
      </p>
    </div>
  );
}

const LANGS = [
  { id: "id", label: "Bahasa Indonesia", words: ["Cek", "dulu", "sebelum", "transfer."] },
  { id: "en", label: "English", words: ["Check", "before", "you", "transfer."] },
] as const;

// One sample frame, captioned in either language. Switching re-runs the
// caption word-pop.
export function LangSample() {
  const [lang, setLang] = useState<(typeof LANGS)[number]["id"]>("id");
  const cur = LANGS.find((l) => l.id === lang)!;
  return (
    <div className="ls">
      <div className="pr pr--sample">
        <p className="sr">A sample video frame with the caption: {cur.words.join(" ")}</p>
        <AiChip className="pr-chip" />
        <div className="pr-body" aria-hidden="true">
          <div className="pr-scene pr-persona is-on">
            <span className="pr-face" />
          </div>
          <p className="pr-cap pr-cap--pop" key={lang}>
            {cur.words.map((w, i) => (
              <span key={i} className={`w in${i === 0 ? " box" : ""}`} style={{ animationDelay: `${i * 0.24}s` }}>
                {w}
              </span>
            ))}
          </p>
        </div>
      </div>
      <div className="ls-toggle" role="group" aria-label="Caption language">
        {LANGS.map((l) => (
          <button key={l.id} type="button" aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
            {l.label}
          </button>
        ))}
      </div>
      <p className="ls-note">Indonesian, English or both. You pick each month.</p>
    </div>
  );
}
