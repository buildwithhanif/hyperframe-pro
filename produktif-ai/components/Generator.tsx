"use client";

import { useEffect, useRef, useState } from "react";
import type { Deck, Slide as SlideData } from "@/lib/schema";
import { Slide, SLIDE_H, SLIDE_W } from "./Slide";

type Result = { deck: Deck; handle: string; issues: string[]; demo: boolean };

const TESTS: { key: "wallet" | "villain" | "tomorrow" | "tag"; label: string }[] = [
  { key: "wallet", label: "Ngelindungin duit/data" },
  { key: "villain", label: "Ada pihak yang untung" },
  { key: "tomorrow", label: "Bisa dikerjain hari ini" },
  { key: "tag", label: "Ada orang buat dikirimin" },
];

const VERDICT_TEXT: Record<Deck["topic_check"]["verdict"], string> = {
  gas: "Topiknya kuat. Gas.",
  "perlu diasah": "Bisa jalan, tapi perlu diasah.",
  "ganti topik": "Topik ini kemungkinan sepi. Pertimbangin ganti.",
};

function slug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "carousel"
  );
}

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function renderPng(node: HTMLElement): Promise<Blob> {
  const { toBlob } = await import("html-to-image");
  await document.fonts.ready;
  const blob = await toBlob(node, { width: SLIDE_W, height: SLIDE_H, pixelRatio: 1, cacheBust: true });
  if (!blob) throw new Error("render failed");
  return blob;
}

function useScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(0.3);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / SLIDE_W);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return scale;
}

function SlidePreview(props: {
  slide: SlideData;
  index: number;
  total: number;
  handle: string;
  nodeRef: (el: HTMLDivElement | null) => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const scale = useScale(boxRef);
  return (
    <div ref={boxRef} className="preview" style={{ height: SLIDE_H * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: SLIDE_W, height: SLIDE_H }}>
        <Slide ref={props.nodeRef} slide={props.slide} index={props.index} total={props.total} handle={props.handle} />
      </div>
    </div>
  );
}

export default function Generator() {
  const [mode, setMode] = useState<"topic" | "thread">("topic");
  const [input, setInput] = useState("");
  const [receipts, setReceipts] = useState("");
  const [slideCount, setSlideCount] = useState(8);
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [editing, setEditing] = useState<number | null>(null);
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState(false);
  const slideNodes = useRef<(HTMLDivElement | null)[]>([]);
  const resultRef = useRef<HTMLDivElement>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setEditing(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, input, receipts, slideCount, handle }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal generate. Coba lagi.");
      setResult(data as Result);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal generate. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function updateSlide(i: number, patch: Partial<SlideData>) {
    setResult((r) => {
      if (!r) return r;
      const slides = r.deck.slides.map((s, j) => (j === i ? { ...s, ...patch } : s));
      return { ...r, deck: { ...r.deck, slides } };
    });
  }

  function updateCaption(caption: string) {
    setResult((r) => (r ? { ...r, deck: { ...r.deck, caption } } : r));
  }

  async function downloadOne(i: number) {
    const node = slideNodes.current[i];
    if (!node || !result) return;
    setBusy(`slide-${i}`);
    try {
      const blob = await renderPng(node);
      downloadBlob(blob, `${slug(result.deck.slides[0].title)}-${String(i + 1).padStart(2, "0")}.png`);
    } catch {
      setError("Gagal bikin gambar. Coba lagi.");
    } finally {
      setBusy("");
    }
  }

  async function downloadAll() {
    if (!result) return;
    setBusy("zip");
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const base = slug(result.deck.slides[0].title);
      for (let i = 0; i < result.deck.slides.length; i++) {
        const node = slideNodes.current[i];
        if (node) zip.file(`${base}-${String(i + 1).padStart(2, "0")}.png`, await renderPng(node));
      }
      zip.file("caption.txt", result.deck.caption);
      downloadBlob(await zip.generateAsync({ type: "blob" }), `${base}.zip`);
    } catch {
      setError("Gagal bikin ZIP. Coba lagi.");
    } finally {
      setBusy("");
    }
  }

  async function copyCaption() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.deck.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Browser nolak akses clipboard. Copy manual dari kotak caption.");
    }
  }

  const deck = result?.deck;
  const passed = deck ? TESTS.filter((t) => deck.topic_check[t.key].pass).length : 0;

  return (
    <div className="gen">
      <form className="card form" onSubmit={generate}>
        <div className="tabs" role="tablist" aria-label="Sumber konten">
          <button type="button" role="tab" aria-selected={mode === "topic"} className={mode === "topic" ? "tab tab--on" : "tab"} onClick={() => setMode("topic")}>
            Dari topik
          </button>
          <button type="button" role="tab" aria-selected={mode === "thread"} className={mode === "thread" ? "tab tab--on" : "tab"} onClick={() => setMode("thread")}>
            Dari thread viral
          </button>
        </div>

        <label className="field">
          <span>{mode === "topic" ? "Topik" : "Tempel thread-nya"}</span>
          <textarea
            name="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={mode === "topic" ? 3 : 8}
            maxLength={6000}
            required
            placeholder={
              mode === "topic"
                ? "Contoh: modus transfer nyasar yang ujungnya jadi utang pinjol"
                : "Tempel teks thread X/Threads yang lagi rame. Naskahnya ditulis ulang pakai kata-kata baru."
            }
          />
        </label>

        <label className="field">
          <span>
            Pengalaman atau angka lo <em>(opsional)</em>
          </span>
          <textarea
            name="receipts"
            value={receipts}
            onChange={(e) => setReceipts(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Contoh: bulan lalu ada Rp 1,5 juta masuk ke rekening gue, 10 menit kemudian ada yang nelpon."
          />
          <small>AI cuma boleh pakai angka dan cerita pribadi dari sini. Kosongin kalau nggak ada.</small>
        </label>

        <div className="row">
          <label className="field">
            <span>Jumlah slide</span>
            <select name="slideCount" value={slideCount} onChange={(e) => setSlideCount(Number(e.target.value))}>
              {[5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <option key={n} value={n}>
                  {n} slide
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Handle di slide</span>
            <input name="handle" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="@akunlo" maxLength={31} />
          </label>
        </div>

        <button className="btn btn--gold" type="submit" disabled={loading || input.trim().length < 3}>
          {loading ? "Lagi nulis carousel lo..." : "Bikin carousel"}
        </button>
        <p className="status" role="status" aria-live="polite">
          {loading ? "Tunggu sebentar, jangan tutup tab ini." : ""}
        </p>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
      </form>

      {result && deck ? (
        <div className="result" ref={resultRef}>
          {result.demo ? <p className="note">Mode demo: yang tampil ini contoh deck bawaan. AI-nya belum dipanggil.</p> : null}

          <section className="card check" aria-label="Skor topik">
            <div className="check__head">
              <strong className="check__score">{passed}/4</strong>
              <div>
                <h3>{VERDICT_TEXT[deck.topic_check.verdict]}</h3>
                <p>{deck.topic_check.suggestion}</p>
              </div>
            </div>
            <ul className="check__list">
              {TESTS.map((t) => {
                const test = deck.topic_check[t.key];
                return (
                  <li key={t.key} className={test.pass ? "ok" : "no"}>
                    <span className="check__mark">{test.pass ? "Lolos" : "Lemah"}</span>
                    <span>
                      <b>{t.label}.</b> {test.why}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {deck.fact_check.length || result.issues.length ? (
            <section className="card warn" aria-label="Cek sebelum posting">
              <h3>Cek dulu sebelum posting</h3>
              <ul>
                {deck.fact_check.map((f, i) => (
                  <li key={`f${i}`}>{f}</li>
                ))}
                {result.issues.map((f, i) => (
                  <li key={`i${i}`}>{f}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="actions">
            <button className="btn btn--gold" onClick={downloadAll} disabled={busy !== ""}>
              {busy === "zip" ? "Lagi nyiapin ZIP..." : `Download ${deck.slides.length} slide (ZIP)`}
            </button>
          </div>

          <div className="slides">
            {deck.slides.map((s, i) => (
              <figure className="slide-card" key={i}>
                <SlidePreview
                  slide={s}
                  index={i}
                  total={deck.slides.length}
                  handle={result.handle}
                  nodeRef={(el) => {
                    slideNodes.current[i] = el;
                  }}
                />
                <figcaption className="slide-card__bar">
                  <button className="btn btn--ghost" onClick={() => setEditing(editing === i ? null : i)} aria-expanded={editing === i}>
                    {editing === i ? "Tutup" : "Edit"}
                  </button>
                  <button className="btn btn--ghost" onClick={() => downloadOne(i)} disabled={busy !== ""}>
                    {busy === `slide-${i}` ? "..." : "PNG"}
                  </button>
                </figcaption>
                {editing === i ? (
                  <div className="edit">
                    <label className="field">
                      <span>Label kecil</span>
                      <input value={s.kicker} onChange={(e) => updateSlide(i, { kicker: e.target.value })} />
                    </label>
                    <label className="field">
                      <span>Judul</span>
                      <textarea rows={3} value={s.title} onChange={(e) => updateSlide(i, { title: e.target.value })} />
                    </label>
                    <label className="field">
                      <span>Kata emas (harus ada di judul)</span>
                      <input value={s.anchor} onChange={(e) => updateSlide(i, { anchor: e.target.value })} />
                    </label>
                    <label className="field">
                      <span>Isi</span>
                      <textarea rows={4} value={s.body} onChange={(e) => updateSlide(i, { body: e.target.value })} />
                    </label>
                  </div>
                ) : null}
              </figure>
            ))}
          </div>

          <section className="card caption" aria-label="Caption">
            <div className="caption__head">
              <h3>Caption</h3>
              <button className="btn btn--ghost" onClick={copyCaption}>
                {copied ? "Kecopy" : "Copy"}
              </button>
            </div>
            <textarea rows={11} value={deck.caption} onChange={(e) => updateCaption(e.target.value)} aria-label="Caption" />
          </section>
        </div>
      ) : null}
    </div>
  );
}
