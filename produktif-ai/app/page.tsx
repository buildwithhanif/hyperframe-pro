import type { Viewport } from "next";
import "@fontsource/courier-prime/400.css";
import "@fontsource/courier-prime/700.css";
import "./landing.css";
import WaitlistForm from "@/components/WaitlistForm";

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

const ORDER = [
  ["SKILL", "Carousel engine"],
  ["SKILL", "Hook 5 ketukan"],
  ["SKILL", "Bedah konten viral"],
  ["SKILL", "Profil akun & ICP"],
  ["FLOW", "Mesin konten organik"],
];

const SKILL_RULES = [
  ["Skor topik dulu: wallet, villain, tomorrow, tag.", "Lolos kurang dari dua? Bilang terus terang."],
  ['Slide 1 buka di pembaca. Jangan mulai dari "gue".'],
  ["Slide 2 wajib nambah info baru."],
  ["Satu langkah per slide, satu peringatan."],
  ["Satu kata emas per judul."],
  ["Angka yang nggak dikasih user: dilarang."],
];

const RECEIPTS = [
  { value: "106,7 jt", text: "views dari 220 carousel dalam 63 hari", source: "@hanifmuh_, 22 Jul–22 Sep 2026" },
  { value: "1,7 jt", text: "views di satu thread organik", source: "@hanifproduktif" },
  { value: "27", text: "thread viral yang dibedah buat skill hook, masing-masing 80 rb sampai 1,7 jt views", source: "@hanifproduktif" },
  { value: "Rp 0", text: "keluar buat iklan", source: "semua akun" },
];

const CATALOG = [
  {
    type: "Skill",
    name: "Carousel engine",
    text: "Topik jadi naskah carousel 5 sampai 12 slide, lengkap sama skor topik dan daftar klaim yang perlu lo cek.",
  },
  {
    type: "Skill",
    name: "Hook 5 ketukan",
    text: "Nulis pembuka thread pakai pola dari 27 thread yang tembus 80 rb sampai 1,7 jt views.",
  },
  {
    type: "Skill",
    name: "Bedah konten viral",
    text: "Ambil mekanik konten orang yang lagi rame, terus tulis versi lo tanpa nyontek kalimatnya.",
  },
  {
    type: "Skill",
    name: "Profil akun & ICP",
    text: "Satu jawaban dari lo plus maksimal empat pertanyaan, jadi profil akun yang dipakai sebagai dasar semua konten.",
  },
  {
    type: "Workflow",
    name: "Mesin konten organik",
    text: "Cek antrean, isi jadwal minggu depan, saring kualitasnya, lalu belajar dari performa minggu lalu. Nyambung ke Buffer.",
  },
  {
    type: "Workflow",
    name: "Invoice & quotation",
    text: "Buat kreator yang mulai dapet brand deal: invoice dan penawaran yang rapi, siap kirim ke klien.",
  },
];

const FAQ = [
  {
    q: "Bedanya sama prompt gratisan yang banyak beredar?",
    a: "Prompt gratisan biasanya satu permintaan. Skill isinya cara kerja lengkap: langkah, standar kualitas, dan larangan. Potongannya ada di bagian atas halaman ini.",
  },
  {
    q: "Bisa dipakai di ChatGPT?",
    a: "Bisa. Di Claude, file-nya dipasang sebagai Skill. Di ChatGPT, isinya dimasukin ke Project atau Custom GPT. Tiap skill dateng sama panduan pasang buat dua-duanya.",
  },
  {
    q: "Harus ngerti coding?",
    a: "Nggak. Lo pasang file-nya, terus ngobrol kayak biasa. Workflow yang nyambung ke tools lain, kayak Buffer, dateng sama panduan setup langkah demi langkah.",
  },
  {
    q: "Hasilnya bahasa Indonesia?",
    a: "Iya. Skill konten nulis dalam bahasa Indonesia santai pakai gue-lo, gaya yang sama dengan akun-akun gue.",
  },
  {
    q: "Kapan rilis, berapa harganya?",
    a: "Belum diumumin. Yang ada di waitlist dikabarin duluan, sebelum dibuka ke publik.",
  },
];

export default function Home() {
  return (
    <div className="lp">
      <header className="lp-nav lp-wrap">
        <a href="/" className="lp-logo">
          produktif<span>.ai</span>
        </a>
        <a href="#waitlist" className="lp-nav__cta">
          Gabung waitlist
        </a>
      </header>

      <main>
        <section className="lp-hero lp-wrap" id="waitlist" aria-labelledby="hero-title">
          <div className="lp-hero__copy">
            <p className="lp-tag">Waitlist · drop pertama</p>
            <h1 id="hero-title">
              Lo udah bayar AI-nya. Yang belum ada: <span className="lp-red">cara kerjanya.</span>
            </h1>
            <p className="lp-lead">
              Skill dan workflow yang gue pakai buat ngejalanin akun-akun dengan total sekitar 690 ribu follower. Dibungkus jadi file yang tinggal lo
              pasang di ChatGPT atau Claude.
            </p>
            <WaitlistForm source="hero" />
            <p className="lp-fine">Daftarnya gratis. Email cuma dikirim pas drop pertama dibuka.</p>
          </div>

          <figure className="lp-order" aria-label="Contoh isi drop pertama, ditulis kayak struk">
            <div className="receipt receipt--order">
              <p className="receipt__head">
                <strong>PRODUKTIF.AI</strong>
                <span>ORDER #001 · DROP PERTAMA</span>
              </p>
              <ul className="receipt__lines">
                {ORDER.map(([type, name]) => (
                  <li key={name}>
                    <span className="receipt__type">{type}</span>
                    <span className="receipt__name">{name}</span>
                    <span className="receipt__qty">1</span>
                  </li>
                ))}
              </ul>
              <ul className="receipt__totals">
                <li>
                  <span>AD SPEND</span>
                  <i aria-hidden="true" />
                  <span>Rp 0</span>
                </li>
                <li>
                  <span>PAID IN</span>
                  <i aria-hidden="true" />
                  <span>CONSISTENCY</span>
                </li>
              </ul>
              <p className="receipt__foot">Dipakai di akun sendiri dulu, baru dijual.</p>
            </div>
          </figure>
        </section>

        <section className="lp-ink" aria-labelledby="diff-title">
          <div className="lp-wrap">
            <p className="lp-tag lp-tag--dark">Prompt vs skill</p>
            <h2 id="diff-title" className="lp-h2">
              Prompt nyuruh AI ngapain. Skill ngajarin dia ngerjainnya kayak orang yang udah ratusan kali ngerjain.
            </h2>
            <div className="lp-diff">
              <figure className="lp-diff__col">
                <div className="receipt receipt--dark">
                  <p className="receipt__label">PROMPT</p>
                  <p className="receipt__prompt">Bikinin carousel tentang modus transfer nyasar.</p>
                </div>
                <figcaption>Satu kalimat. AI nebak sisanya sendiri.</figcaption>
              </figure>
              <figure className="lp-diff__col lp-diff__col--wide">
                <div className="receipt receipt--dark">
                  <p className="receipt__label">SKILL · CAROUSEL ENGINE</p>
                  <ol className="receipt__rules">
                    {SKILL_RULES.map((lines, i) => (
                      <li key={i}>
                        <span className="receipt__n">{String(i + 1).padStart(2, "0")}</span>
                        <span>
                          {lines[0]}
                          {lines[1] ? <em>{lines[1]}</em> : null}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
                <figcaption>Ini potongan aturannya. Versi lengkapnya puluhan baris, disusun dari 220 carousel yang udah tayang.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="lp-section lp-wrap" aria-labelledby="proof-title">
          <p className="lp-tag">Buktinya</p>
          <h2 id="proof-title" className="lp-h2">
            Tiap skill lahir dari akun yang beneran jalan.
          </h2>
          <ul className="lp-proof">
            {RECEIPTS.map((r) => (
              <li key={r.value}>
                <strong>{r.value}</strong>
                <span>{r.text}</span>
                <small>{r.source}</small>
              </li>
            ))}
          </ul>
        </section>

        <section className="lp-section lp-wrap" aria-labelledby="catalog-title">
          <p className="lp-tag">Rencana drop pertama</p>
          <h2 id="catalog-title" className="lp-h2">
            Yang lagi gue siapin.
          </h2>
          <ol className="lp-catalog">
            {CATALOG.map((c, i) => (
              <li key={c.name}>
                <span className="lp-catalog__n">{String(i + 1).padStart(2, "0")}</span>
                <span className={`lp-catalog__type lp-catalog__type--${c.type.toLowerCase()}`}>{c.type}</span>
                <h3>{c.name}</h3>
                <p>{c.text}</p>
              </li>
            ))}
          </ol>
          <p className="lp-note">Urutannya masih bisa berubah. Pilihan lo di form waitlist ikut nentuin mana yang keluar duluan.</p>
        </section>

        <section className="lp-soft" aria-labelledby="faq-title">
          <div className="lp-wrap lp-faq">
            <h2 id="faq-title" className="lp-h2">
              Yang sering ditanyain.
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
              Drop pertama dikabarin ke waitlist <span className="lp-red-dark">duluan.</span>
            </h2>
            <WaitlistForm source="footer" tone="ink" />
          </div>
        </section>
      </main>

      <footer className="lp-foot lp-wrap">
        <p>produktif.ai · Muhammad Hanif · @hanifproduktif · Yogyakarta</p>
        <p>
          <a href="/carousel">Coba workflow carousel (beta)</a>
        </p>
      </footer>
    </div>
  );
}
