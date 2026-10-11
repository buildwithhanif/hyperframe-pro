"use client";

import { useEffect, useId, useRef, useState } from "react";

export type ClipSource = { id: string; title: string; src: string; poster: string };

// Only one clip on the page plays with sound at a time.
const SOUND_EVENT = "pai:sound";

// A real 9:16 clip of Hanif's AI persona. Plays muted and inline when it is on
// screen, pauses when it leaves, and offers sound on tap. If the browser
// refuses autoplay (Low Power Mode, data saver), the poster stays up with a
// play button instead.
export default function Clip({
  clip,
  eager = false,
  className = "",
  label = "AI persona",
}: {
  clip: ClipSource;
  eager?: boolean;
  className?: string;
  label?: string;
}) {
  const id = useId();
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setBlocked(true);
    let visible = false;
    const play = () => {
      if (!visible) return;
      v.play().then(
        () => setBlocked(false),
        () => setBlocked(true),
      );
    };
    // Video bytes wait for the page's own load, so the still and the
    // headline paint first on a slow connection.
    const loaded = () => document.readyState === "complete";
    if (!loaded()) window.addEventListener("load", play, { once: true });
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        if (!visible) v.pause();
        else if (loaded()) play();
      },
      { threshold: 0.4 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      window.removeEventListener("load", play);
    };
  }, []);

  useEffect(() => {
    const onOther = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) setMuted(true);
    };
    window.addEventListener(SOUND_EVENT, onOther);
    return () => window.removeEventListener(SOUND_EVENT, onOther);
  }, [id]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  const toggleSound = () => {
    const v = ref.current;
    if (!v) return;
    const next = !muted;
    setMuted(next);
    v.muted = next;
    if (!next) {
      window.dispatchEvent(new CustomEvent(SOUND_EVENT, { detail: id }));
      v.currentTime = 0;
      v.play().then(
        () => setBlocked(false),
        () => setBlocked(true),
      );
    }
  };

  const playNow = () => {
    ref.current?.play().then(
      () => setBlocked(false),
      () => undefined,
    );
  };

  return (
    <figure className={`clip ${className}`}>
      {/* The still sits under the video: high priority for the hero, lazy for
          the rest. Video only paints over it once frames arrive. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="clip-still"
        src={clip.poster}
        alt=""
        width={540}
        height={960}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
      />
      <video
        ref={ref}
        src={clip.src}
        poster={eager ? clip.poster : undefined}
        muted
        loop
        playsInline
        preload={eager ? "metadata" : "none"}
        onError={() => setBlocked(true)}
        aria-label={`${clip.title}. A video made with Hanif's AI persona.`}
      />
      <span className="clip-label">{label}</span>
      {blocked ? (
        <button type="button" className="clip-play" onClick={playNow} aria-label={`Play ${clip.title}`}>
          Play
        </button>
      ) : (
        <button type="button" className="clip-sound" onClick={toggleSound} aria-pressed={!muted}>
          {muted ? "Sound" : "Sound on"}
          <span className="sr">, {clip.title}</span>
        </button>
      )}
    </figure>
  );
}
