import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { fontVars } from "@/app/fonts";
import "../tokens.css";
import "./v3.css";
import { Wordmark } from "@/components/site/Brand";
import TrackedLink from "@/components/v2/TrackedLink";
import EventLink from "@/components/v3/EventLink";
import HeroMedia, { Arrow } from "@/components/v3/HeroMedia";
import TopBar from "@/components/v3/TopBar";

// v3: the minimal page. One full-screen loop of Hanif's AI version, the
// promise, one button, then four short blocks. v1 (/) and v2 (/v2) stay up
// for comparison; this one is kept out of search until a winner is picked.
export const metadata: Metadata = {
  title: "produktif.ai | 60 videos a month. You never film yourself.",
  description:
    "Short videos for your business, each opening and closing with an AI version of you, with your shop and products in between. Rp 4,000,000 a month. Free to apply.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "60 videos a month. You never film yourself.",
    description: "Short videos for your business, made with an AI version of you. Rp 4,000,000 a month. Free to apply.",
  },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "only light", viewportFit: "cover" };

const IG = "https://www.instagram.com/hanifmuh_/";
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "";
const WA_DIGITS = WA.replace(/\D/g, "");

const STEPS = [
  ["Today", "Apply in about 2 minutes with your WhatsApp number, so we can reply. No payment details."],
  ["If we pick you", "A short setup call. Then you sign and pay a refundable Rp 1,000,000 deposit."],
  [
    "In about 7 days",
    "Send 3 photos and a 2-minute voice recording, and we make a short test clip of your AI version. You see it before any monthly bill. Still not right after 1 redo? You get the full deposit back.",
  ],
  ["Every week", "Approve scripts and videos on WhatsApp. Then you post them with the AI label on. We never post for you."],
];

export default function V3Home() {
  return (
    <div className={`pai v3 ${fontVars}`}>
      <a className="v3-skip" href="#main">
        Skip to content
      </a>
      <TopBar />

      <section className="v3-hero" aria-labelledby="v3-h">
        <HeroMedia />
        <div className="v3-top">
          <Link href="/v3" aria-label="produktif.ai home">
            <Wordmark title={null} className="v3-wm" />
          </Link>
        </div>
        <div className="v3-copy">
          <h1 id="v3-h" className="v3-h1">
            <span>
              <b>60</b> videos a month.
            </span>
            <span>You never film yourself.</span>
          </h1>
          <p className="v3-sub">
            For your shop, café, salon or brand. An AI version of you opens and closes each one, with your shop and products in between.
          </p>
          <span id="v3-hero-cta" className="v3-cta-wrap">
            <TrackedLink href="/v3/start" pos="v3_hero" className="v3-btn">
              Get started <Arrow />
            </TrackedLink>
          </span>
          <p className="v3-micro">
            <b>Rp&nbsp;4,000,000 a month.</b> Free to apply. You see a test clip of yourself before any monthly bill.
          </p>
        </div>
      </section>

      <main id="main" className="v3-rest">
        <section className="v3-sec" aria-labelledby="v3-anat-h">
          <h2 id="v3-anat-h" className="v3-h2">
            What each video looks like
          </h2>
          <div className="v3-anat">
            <figure className="v3-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/samples/v3/open.jpg"
                alt="Hanif’s AI version at the start of a video. Made with AI."
                width={360}
                height={640}
                loading="lazy"
                decoding="async"
              />
              <span className="v3-tag">Made with AI</span>
            </figure>
            <div className="v3-slot">
              <b>Your shop and products</b>
              <small>From the photos and clips you send</small>
            </div>
            <figure className="v3-tile">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/samples/v3/close.jpg"
                alt="Hanif’s AI version at the end of a video. Made with AI."
                width={360}
                height={640}
                loading="lazy"
                decoding="async"
              />
              <span className="v3-tag">Made with AI</span>
            </figure>
            <p className="v3-cap">Your AI version opens</p>
            <p className="v3-cap" aria-hidden="true" />
            <p className="v3-cap">Your AI version closes</p>
          </div>
          <p className="v3-shown">Shown here: Hanif’s AI version.</p>
          <p className="v3-body">60 a month, about 2 a day. Each is 30 to 45 seconds, with subtitles and a caption ready to paste.</p>
        </section>

        <section className="v3-sec" aria-labelledby="v3-how-h">
          <h2 id="v3-how-h" className="v3-h2">
            How it starts
          </h2>
          <ol className="v3-steps">
            {STEPS.map(([when, text]) => (
              <li key={when}>
                <span className="v3-when">{when}</span>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="v3-sec v3-who" aria-labelledby="v3-who-h">
          <h2 id="v3-who-h" className="sr">
            Who runs it
          </h2>
          <p>
            <b>Run by Hanif, the founder.</b> His personal Instagram,{" "}
            <a href={IG} target="_blank" rel="noopener">
              @hanifmuh_
            </a>
            , got 178.7M views and +288K followers in 90 days, counting all his posts, including ones made without his AI version
            (Instagram’s own dashboard, checked 7 to 10 Oct 2026).
          </p>
          <p className="v3-tagline">
            <span className="v3-no">His own account. No client results yet. We can’t promise views or sales.</span>
          </p>
        </section>

        <section className="v3-close" aria-labelledby="v3-price-h">
          <div className="v3-close-in">
            <h2 id="v3-price-h" className="v3-price">
              <span className="rp">Rp</span>&nbsp;4,000,000 a month
            </h2>
            <p className="v3-line">For 60 videos. Founding rate, month to month.</p>
            <p className="v3-fine">
              The deposit comes off your first month. Cancel at least 7 days before your next bill. Once delivery starts, there are no cash
              refunds.
            </p>
            <span id="v3-end-cta" className="v3-cta-wrap">
              <TrackedLink href="/v3/start" pos="v3_end" className="v3-btn">
                Get started <Arrow />
              </TrackedLink>
            </span>
            <p className="v3-note">Free to apply, about 2 minutes. You pay nothing unless we pick you and you sign.</p>
            <p className="v3-ask">
              Questions first?{" "}
              {WA_DIGITS ? (
                <EventLink href={`https://wa.me/${WA_DIGITS}`} event="contact_click" data={{ via: "wa" }} external>
                  Message us on WhatsApp
                </EventLink>
              ) : (
                <EventLink href="mailto:hello@produktif.ai" event="contact_click" data={{ via: "email" }}>
                  Email hello@produktif.ai
                </EventLink>
              )}
            </p>
            <footer className="v3-foot">
              <Wordmark className="v3-foot-wm" />
              <nav aria-label="Footer">
                <EventLink href="/v2?from=v3#faq" event="details_click">
                  Full details and FAQ
                </EventLink>
                <Link href="/consent">How we use your face and voice</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
              </nav>
              <p>produktif.ai, Yogyakarta, Indonesia.{WA ? ` WhatsApp: ${WA}.` : ""}</p>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}
