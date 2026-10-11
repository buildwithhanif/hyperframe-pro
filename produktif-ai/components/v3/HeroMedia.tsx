"use client";

import { track } from "@vercel/analytics";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

// The v3 hero: a muted 4.5-second loop of Hanif's AI version, cut by
// scripts/cut-v3.sh. The poster paints first and stays if autoplay is skipped
// or refused, so the page never shows a play button. After 4 loops the video
// rests on frame 0 (the poster), which keeps moving content under the limit
// for things that auto-play. A tap on the face or the "Hear the AI voice"
// pill opens a dialog with a real post, with sound.

const LOOPS = 4;
const CLIPS = [
  { src: "/samples/ahliwaris.mp4", poster: "/samples/ahliwaris.jpg" },
  { src: "/samples/colokan.mp4", poster: "/samples/colokan.jpg" },
];
export const DIALOG_EVENT = "pai:v3-dialog";

function send(name: string, data?: Record<string, string | boolean>) {
  try {
    track(name, data);
  } catch {}
}

export default function HeroMedia() {
  const box = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const v = hero.current;
    const el = box.current;
    if (!v || !el) return;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    const skip = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "reduced"
      : conn?.saveData || /(^|-)2g$/.test(conn?.effectiveType ?? "")
        ? "data"
        : "";
    if (skip) {
      send("hero_autoplay", { ok: false, why: skip });
      return;
    }
    let visible = false;
    let loops = 0;
    let last = 0;
    let reported = false;
    let started = false;
    const report = (ok: boolean, why?: string) => {
      if (reported) return;
      reported = true;
      send("hero_autoplay", why ? { ok, why } : { ok });
    };
    const play = () => {
      if (!visible || loops >= LOOPS || document.querySelector(".v3-dialog[open], .v3-dialog.is-open")) return;
      if (!started) {
        started = true;
        v.src = "/samples/v3/hero.mp4";
      }
      v.play().catch(() => report(false, "blocked"));
    };
    const onPlaying = () => {
      setPlaying(true);
      report(true);
    };
    const onTime = () => {
      if (v.currentTime + 0.05 < last) {
        loops += 1;
        if (loops >= LOOPS) {
          v.pause();
          v.currentTime = 0;
        }
      }
      last = v.currentTime;
    };
    const onError = () => {
      setPlaying(false);
      report(false, "error");
    };
    v.addEventListener("playing", onPlaying);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("error", onError);
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible) v.pause();
        else if (document.readyState === "complete") play();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    // Video bytes wait for the page's own load, so the poster and the
    // headline paint first on a slow connection.
    const onLoad = () => play();
    if (document.readyState !== "complete") window.addEventListener("load", onLoad, { once: true });
    const onDialog = (e: Event) => {
      if ((e as CustomEvent<boolean>).detail) v.pause();
      else play();
    };
    window.addEventListener(DIALOG_EVENT, onDialog);
    return () => {
      io.disconnect();
      window.removeEventListener("load", onLoad);
      window.removeEventListener(DIALOG_EVENT, onDialog);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("error", onError);
    };
  }, []);

  return (
    <SoundDialog>
      {(open) => (
        <div className="v3-media" ref={box} onClick={(e) => e.target === e.currentTarget && open("face")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/samples/v3/hero.jpg"
            alt="Hanif’s AI version talking to the camera. Made with AI."
            width={720}
            height={820}
            fetchPriority="high"
            decoding="async"
            onClick={() => open("face")}
          />
          <video
            ref={hero}
            className={playing ? "is-on" : undefined}
            muted
            loop
            playsInline
            preload="none"
            disablePictureInPicture
            disableRemotePlayback
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => open("face")}
          />
          <p className="v3-ai">
            <i aria-hidden="true" />
            Made with AI <span>· AI version of Hanif, founder</span>
          </p>
          <button type="button" className="v3-pill" aria-haspopup="dialog" onClick={() => open("pill")}>
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 1.2v9.6L10.4 6z" fill="currentColor" />
            </svg>
            Hear the AI voice
          </button>
        </div>
      )}
    </SoundDialog>
  );
}

// A full-screen viewer for a real post, with sound. Sound has to start inside
// the tap that opens it (iOS, and Instagram's in-app browser), so the source,
// unmute and play all happen in the click handler.
function SoundDialog({ children }: { children: (open: (from: "pill" | "face") => void) => React.ReactNode }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const [isOpen, setOpen] = useState(false);
  const [clip, setClip] = useState(0);

  const start = (i: number) => {
    const v = vid.current;
    if (!v) return;
    v.src = CLIPS[i].src;
    v.poster = CLIPS[i].poster;
    v.muted = false;
    v.play().catch(() => {});
  };

  const open = useCallback((from: "pill" | "face") => {
    const d = dlg.current;
    if (!d) return;
    opener.current = document.activeElement as HTMLElement | null;
    setClip(0);
    setOpen(true);
    window.dispatchEvent(new CustomEvent(DIALOG_EVENT, { detail: true }));
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
    start(0);
    send("sound_open", { from });
  }, []);

  const close = useCallback(() => {
    const d = dlg.current;
    const v = vid.current;
    if (v) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    if (d?.open) {
      if (typeof d.close === "function") d.close();
      else d.removeAttribute("open");
    }
    setOpen(false);
    window.dispatchEvent(new CustomEvent(DIALOG_EVENT, { detail: false }));
    opener.current?.focus({ preventScroll: true });
  }, []);

  const next = () => {
    const i = (clip + 1) % CLIPS.length;
    setClip(i);
    start(i);
    send("sound_next");
  };

  return (
    <>
      {children(open)}
      <dialog
        ref={dlg}
        className={`v3-dialog${isOpen ? " is-open" : ""}`}
        aria-labelledby="v3-dialog-h"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => e.target === e.currentTarget && close()}
        onKeyDown={(e) => e.key === "Escape" && close()}
      >
        <div className="v3-dialog-in">
          <h2 id="v3-dialog-h" className="sr">
            Hanif’s AI version, with sound
          </h2>
          <button type="button" className="v3-x" aria-label="Close" onClick={close}>
            ×
          </button>
          <div className="v3-dialog-media">
            <video
              ref={vid}
              controls
              playsInline
              preload="none"
              aria-label="A post from Hanif’s personal account, made with his AI version."
            />
            <p className="v3-ai v3-ai--dialog">
              <i aria-hidden="true" />
              Made with AI <span>· Hanif’s own post</span>
            </p>
          </div>
          <p className="v3-dialog-cap">
            A post from Hanif’s personal account, made with his AI version. Personal topic, captions in the original language.
          </p>
          <div className="v3-dialog-actions">
            <button type="button" className="v3-ghost" onClick={next}>
              Next clip
            </button>
            <Link href="/v3/start" className="v3-btn v3-btn--auto" onClick={() => send("cta_click", { pos: "v3_viewer" })}>
              Get started <Arrow />
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}

export function Arrow() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
