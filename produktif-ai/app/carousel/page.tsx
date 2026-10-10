import type { Metadata, Viewport } from "next";
import "@fontsource/plus-jakarta-sans/500.css";
import "@fontsource/plus-jakarta-sans/700.css";
import "@fontsource/plus-jakarta-sans/800.css";
import "../globals.css";
import Generator from "@/components/Generator";

export const metadata: Metadata = {
  title: "Carousel engine · produktif.ai",
  description:
    "Masukin topik, keluar carousel Instagram yang siap posting. Formatnya dari 220 carousel @hanifmuh_ yang tembus 106,7 juta views.",
};

export const viewport: Viewport = {
  themeColor: "#0D1117",
  colorScheme: "dark",
};

const CONSULT_URL = "https://s.id/hanifose";

const STATS = [
  { value: "220", label: "carousel" },
  { value: "106,7 jt", label: "views" },
  { value: "189 rb", label: "follower baru" },
];

const STEPS = [
  {
    title: "Topik lo dites dulu",
    text: "Sebelum nulis, AI ngecek empat hal: ada duit atau data yang dilindungin, ada pihak yang untung dari ketidaktahuan orang, bisa dikerjain hari ini, dan ada orang yang langsung kebayang buat dikirimin. Kalau topiknya lemah, lo dikasih tahu sebelum buang waktu.",
  },
  {
    title: "Naskah ditulis per slide",
    text: "Slide 1 buat hook, slide 2 nambah info baru, terus satu langkah per slide dan satu peringatan. Penutupnya ngajak pembaca ngirim carousel itu ke satu orang tertentu.",
  },
  {
    title: "Tinggal download",
    text: "PNG 1080×1350 siap upload ke Instagram, plus caption. Klaim yang perlu dicek didaftar, biar lo cek dulu sebelum posting.",
  },
];

export default function CarouselPage() {
  return (
    <div lang="id">
      <header className="nav">
        <a href="/" className="logo">
          produktif<span>.ai</span>
        </a>
        <a href={CONSULT_URL} className="nav__link" target="_blank" rel="noopener noreferrer">
          Konsultasi 1-on-1
        </a>
      </header>

      <main>
        <section className="hero">
          <p className="eyebrow">Carousel engine</p>
          <h1>
            Masukin topik. Keluar carousel yang orang <span className="gold">save</span> dan kirim ke temennya.
          </h1>
          <p className="lead">
            Template dan cara nulisnya diambil dari carousel @hanifmuh_. Ini hasilnya di akun itu dalam 63 hari (22 Juli sampai 22 September 2026):
          </p>
          <ul className="stats" aria-label="Hasil format ini di akun @hanifmuh_">
            {STATS.map((s) => (
              <li key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="section" id="coba" aria-labelledby="coba-title">
          <h2 id="coba-title">Coba sekarang</h2>
          <p className="section__lead">Tulis topiknya atau tempel thread yang lagi rame. Hasilnya bisa lo edit sebelum di-download.</p>
          <Generator />
        </section>

        <section className="section" aria-labelledby="cara-title">
          <h2 id="cara-title">Cara kerjanya</h2>
          <ol className="steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="card">
                <span className="steps__n">{i + 1}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="section why" aria-labelledby="why-title">
          <h2 id="why-title">Kenapa mulai dari carousel?</h2>
          <p>
            Di @hanifmuh_, carousel dipakai buat ngetes topik. Topik yang jalan di carousel baru dijadiin Reels. Tool ini ngerjain bagian pertamanya buat
            lo.
          </p>
        </section>
      </main>

      <footer className="footer">
        <p>
          produktif.ai, dibikin Hanif Produktif di Yogyakarta.{" "}
          <a href={CONSULT_URL} target="_blank" rel="noopener noreferrer">
            Mau dibantu setup konten lo? Konsultasi 1-on-1.
          </a>
        </p>
      </footer>
    </div>
  );
}
