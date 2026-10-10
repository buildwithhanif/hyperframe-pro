import { Fragment } from "react";

// Headline whose words rise out of a mask, line by line. Pure CSS, so it
// renders and plays before any JavaScript loads (see .k-word in home.css).
// It ships no JavaScript of its own.
// Wrap one word in asterisks to set it in the record red: "*videos.*".
export default function Kinetic({ lines, className, delay = 0.1, as = "h1", id }: { lines: string[]; className?: string; delay?: number; as?: "h1" | "h2" | "p"; id?: string }) {
  const Tag = as;
  let n = 0;
  return (
    <Tag className={className} id={id} aria-label={lines.join(" ").replace(/\*/g, "")}>
      {lines.map((line, li) => {
        const words = line.split(" ");
        return (
          <span key={li} className="k-line" aria-hidden="true">
            {words.map((raw, wi) => {
              const i = n++;
              const rec = /^\*.+\*$/.test(raw);
              return (
                <Fragment key={wi}>
                  <span className="k-mask">
                    <span className={rec ? "k-word is-rec" : "k-word"} style={{ animationDelay: `${delay + i * 0.04}s` }}>
                      {rec ? raw.slice(1, -1) : raw}
                    </span>
                  </span>
                  {wi < words.length - 1 ? " " : ""}
                </Fragment>
              );
            })}
          </span>
        );
      })}
    </Tag>
  );
}
