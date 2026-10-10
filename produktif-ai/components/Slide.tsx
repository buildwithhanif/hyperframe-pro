import { forwardRef } from "react";
import { splitAnchor, type Slide as SlideData } from "@/lib/schema";

export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

// Shrink type for long copy so nothing spills off a 1080x1350 slide.
function titleSize(kind: SlideData["kind"], text: string): number {
  const n = text.length;
  if (kind === "hook") return n > 75 ? 70 : n > 52 ? 80 : 92;
  return n > 62 ? 56 : n > 44 ? 64 : 72;
}

function bodySize(text: string): number {
  const n = text.length;
  return n > 210 ? 32 : n > 160 ? 36 : 40;
}

type Props = {
  slide: SlideData;
  index: number;
  total: number;
  handle: string;
};

export const Slide = forwardRef<HTMLDivElement, Props>(function Slide({ slide, index, total, handle }, ref) {
  const [before, gold, after] = splitAnchor(slide.title, slide.anchor);
  const last = index === total - 1;
  return (
    <div ref={ref} className={`slide slide--${slide.kind}`} style={{ width: SLIDE_W, height: SLIDE_H }}>
      <div className="slide__top">
        <span className="slide__handle">{handle}</span>
        <span className="slide__count">
          {index + 1}/{total}
        </span>
      </div>
      <div className="slide__main">
        <div className="slide__content">
          {slide.kicker ? <div className="slide__kicker">{slide.kicker}</div> : null}
          <h2 className="slide__title" style={{ fontSize: titleSize(slide.kind, slide.title) }}>
            {before}
            {gold ? <span className="slide__gold">{gold}</span> : null}
            {after}
          </h2>
          {slide.body ? (
            <p className="slide__body" style={{ fontSize: bodySize(slide.body) }}>
              {slide.body}
            </p>
          ) : null}
        </div>
      </div>
      <div className="slide__bottom">
        <div className="slide__progress" aria-hidden="true">
          <div className="slide__progress-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="slide__pill">
          {last ? "SIMPAN" : "GESER"}
          {last ? null : (
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>
    </div>
  );
});
