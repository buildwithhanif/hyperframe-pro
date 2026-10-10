import { fontVars } from "@/app/fonts";
import type { ReactNode } from "react";
import Link from "next/link";
import { Wordmark } from "@/components/site/Brand";

export type LegalSection = { id: string; heading: string; body: ReactNode };

// Shared layout for /privacy, /terms and /consent.
export default function LegalPage(props: { title: string; updated: string; intro: ReactNode; sections: LegalSection[] }) {
  return (
    <div className={`pai lg ${fontVars}`}>
      <header className="lg-top">
        <Link href="/" className="lg-brand" aria-label="produktif.ai home">
          <Wordmark title={null} className="lg-wm" />
        </Link>
        <Link href="/start" className="lg-cta">
          Get started
        </Link>
      </header>
      <main className="lg-main">
        <h1>{props.title}</h1>
        <p className="lg-updated">Last updated {props.updated}</p>
        <div className="lg-intro">{props.intro}</div>
        <nav className="lg-toc" aria-label="On this page">
          <ol>
            {props.sections.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.heading}</a>
              </li>
            ))}
          </ol>
        </nav>
        {props.sections.map((s) => (
          <section key={s.id} id={s.id} className="lg-sec">
            <h2>{s.heading}</h2>
            <div className="lg-body">{s.body}</div>
          </section>
        ))}
        <div className="lg-end">
          <p>Questions answered? Applying takes about 2 minutes, and you pay nothing until you&rsquo;re picked.</p>
          <Link href="/start" className="lg-cta">
            Get started
          </Link>
        </div>
      </main>
      <footer className="lg-foot">
        <p>© 2026 produktif.ai, Yogyakarta, Indonesia</p>
        <nav aria-label="Legal">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/consent">Face and voice</Link>
        </nav>
      </footer>
    </div>
  );
}
