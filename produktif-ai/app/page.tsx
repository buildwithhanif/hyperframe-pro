import type { Viewport } from "next";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "./landing.css";
import WaitlistForm from "@/components/WaitlistForm";

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

const RECEIPT_LINES: [string, string][] = [
  ["Video talking head", "60"],
  ["Shooting abis setup", "0"],
  ["Rekaman abis setup", "0"],
  ["Nyari topik", "0"],
];

// Numbers from @hanifmuh_'s own dashboards (social profile, 7-10 Oct 2026).
const REELS = [
  {
    title: "STOP transfer balik",
    kind: "Reel",
    result: "17,6 jt views di IG, 4,8 jt di FB",
    href: "https://www.instagram.com/reel/DdwMBX4ywwk/",
  },
  {
    title: "STOP minjemin HP",
    kind: "Reel",
    result: "4,4 jt views di IG, 8,7 jt di FB",
    href: "https://www.instagram.com/reel/Dd8O73qSouU/",
  },
];

const STEPS = [
  {
    title: "Setup sekali",
    text: "Lo kirim video dan rekaman suara singkat, terus kita ngobrol soal bisnis atau keahlian lo. Dari situ gue bikin persona dan suara AI lo.",
  },
  {
    title: "Produksi tiap hari",
    text: "Topik dan naskahnya gue yang urus. Tiap hari jadi 2 video talking head pake persona lo, subtitle udah nempel.",
  },
  {
    title: "Lo cek, baru tayang",
    text: "Tiap video bisa lo cek dulu. Ga ada yang tayang atas nama lo tanpa lo setujuin.",
  },
];

const FIT = [
  "Pemilik bisnis yang tau harus ngonten dan selalu kehabisan waktu.",
  "Profesional kayak dokter, konsultan, atau agen properti yang mau dikenal di bidangnya.",
  "Coach dan edukator yang materinya banyak, tapi ga betah di depan kamera.",
];

const NOT_FIT = ["Yang nyari views dijamin.", "Yang mau clone wajah atau suara orang lain."];

const FAQ = [
  {
    q: "Harganya berapa?",
    a: "Rp 4 juta per bulan buat 60 video, dua per hari. Anggap aja lo gaji satu orang yang kerjanya cuma bikin konten buat lo.",
  },
  {
    q: "Rekamannya beneran cuma sekali?",
    a: "Cuma sekali di awal, buat bikin persona dan suara AI lo. Abis itu ga perlu lagi.",
  },
  {
    q: "Views-nya dijamin?",
    a: "Ga. Ga ada yang bisa jamin views, dan gue ga mau janji yang ga bisa gue pegang. Yang pasti lo dapet: 60 video talking head sebulan pake persona AI lo, dengan gaya naskah kayak Reels gue.",
  },
  {
    q: "Bisa clone wajah atau suara orang lain?",
    a: "Ga bisa. Persona cuma dibikin dari rekaman lo sendiri, dengan izin lo.",
  },
  {
    q: "Videonya dikasih label AI?",
    a: "Iya, harus. Instagram sama TikTok minta konten AI yang realistis dikasih label. Pas upload, lo tinggal nyalain label AI-nya, nanti gue kasih tau caranya.",
  },
];

export default function Home() {
  return (
    <div className="lp">
      <header className="lp-nav lp-wrap">
        <a href="/" className="lp-logo">
          produktif<span>.ai</span>
        </a>
        <a href="#daftar" className="lp-nav__cta">
          Daftar waitlist
        </a>
      </header>

      <main>
        <section className="lp-hero lp-wrap" aria-labelledby="hero-title">
          <div className="lp-hero__copy">
            <p className="lp-tag">Done for you · waitlist batch pertama</p>
            <h1 id="hero-title">
              2 video talking head tiap hari. <span className="lp-red">Rekamannya cukup sekali.</span>
            </h1>
            <p className="lp-lead">
              Gue bikin persona AI dari wajah dan suara lo. Abis itu tiap hari lo dapet 2 video Reels yang siap posting, lengkap sama naskah dan
              subtitle, Rp 4 juta sebulan. Gaya naskahnya ngikutin Reels di akun gue.
            </p>
            <div id="daftar" className="lp-anchor">
              <WaitlistForm source="hero" />
            </div>
          </div>

          <figure className="lp-order" aria-label="Isi paket per bulan, ditulis kayak struk: 60 video talking head, nol shooting dan nol rekaman abis setup, nol nyari topik, total Rp 4.000.000">
            <div className="receipt receipt--order">
              <p className="receipt__head">
                <strong>PRODUKTIF.AI</strong>
                <span>DONE FOR YOU · PER BULAN</span>
              </p>
              <ul className="receipt__totals receipt__totals--plain">
                {RECEIPT_LINES.map(([label, qty]) => (
                  <li key={label}>
                    <span>{label.toUpperCase()}</span>
                    <i aria-hidden="true" />
                    <span className={qty === "0" ? "receipt__zero" : undefined}>{qty}</span>
                  </li>
                ))}
              </ul>
              <ul className="receipt__totals">
                <li>
                  <span>TOTAL</span>
                  <i aria-hidden="true" />
                  <span>Rp 4.000.000</span>
                </li>
                <li>
                  <span>KEMBALIAN</span>
                  <i aria-hidden="true" />
                  <span>WAKTU LO</span>
                </li>
              </ul>
              <p className="receipt__foot">2 video sehari · 9:16 · siap posting</p>
            </div>
          </figure>
        </section>

        <section className="lp-ink" aria-labelledby="proof-title">
          <div className="lp-wrap">
            <p className="lp-tag lp-tag--dark">Buktinya</p>
            <h2 id="proof-title" className="lp-h2">
              Gaya naskahnya udah jalan di akun gue.
            </h2>
            <p className="lp-ink__lead">
              Yang di depan kamera di Reels ini emang gue sendiri, bukan persona AI. Naskah video lo gue tulis pake cara yang sama: dibuka pake
              hook STOP, durasinya 60 sampai 120 detik. Voice-over di banyak Reels gue juga udah pake suara clone gue sendiri.
            </p>
            <ul className="lp-reels">
              {REELS.map((r) => (
                <li key={r.title}>
                  <a href={r.href} target="_blank" rel="noopener noreferrer" className="receipt receipt--dark lp-reel">
                    <span className="receipt__label">{r.kind.toUpperCase()}</span>
                    <strong className="lp-reel__title">{r.title}</strong>
                    <span className="lp-reel__result">{r.result}</span>
                    <span className="lp-reel__open">Tonton di Instagram</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="lp-median">
              Median 30 Reels terakhir: <strong>297{" "}rb views</strong>.
            </p>
            <p className="lp-disclaimer">
              Ini angka akun gue: IG @hanifmuh_ yang follower-nya 298 rb, plus Facebook gue. Akun lo mulai dari titik yang beda, dan ga ada yang
              bisa jamin views.
            </p>
          </div>
        </section>

        <section className="lp-section lp-wrap" aria-labelledby="how-title">
          <p className="lp-tag">Cara kerjanya</p>
          <h2 id="how-title" className="lp-h2">
            Lo cukup muncul sekali di awal.
          </h2>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span className="lp-steps__n" aria-hidden="true">
                  {i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="lp-note">Detail alurnya gue rapiin bareng batch pertama.</p>
        </section>

        <section className="lp-section lp-wrap" aria-labelledby="fit-title">
          <p className="lp-tag">Buat siapa</p>
          <h2 id="fit-title" className="lp-h2">
            Paling kepake buat orang yang ilmunya banyak tapi waktunya mepet.
          </h2>
          <div className="lp-fit">
            <div>
              <h3>Cocok</h3>
              <ul>
                {FIT.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div className="lp-fit__no">
              <h3>Belum cocok</h3>
              <ul>
                {NOT_FIT.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="lp-soft" aria-labelledby="faq-title">
          <div className="lp-wrap lp-faq">
            <h2 id="faq-title" className="lp-h2">
              Yang pasti lo tanyain.
            </h2>
            <div className="lp-faq__list">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-ink lp-close" aria-labelledby="close-title">
          <div className="lp-wrap lp-close__inner">
            <h2 id="close-title" className="lp-h2">
              Batch pertama gue buka kecil dulu, <span className="lp-red-dark">biar kualitasnya kejaga.</span>
            </h2>
            <WaitlistForm source="footer" tone="ink" />
          </div>
        </section>
      </main>

      <footer className="lp-foot lp-wrap">
        <p>produktif.ai · Muhammad Hanif · @hanifproduktif · Yogyakarta</p>
      </footer>
    </div>
  );
}
