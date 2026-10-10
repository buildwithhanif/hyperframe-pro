"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ROLES, STARTS } from "@/lib/waitlist";

type Props = { source: "hero" | "footer"; tone?: "paper" | "ink" };
type FieldError = { field: "name" | "whatsapp" | "handle" | ""; message: string };

export default function WaitlistForm({ source, tone = "paper" }: Props) {
  const id = useId();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [saved, setSaved] = useState({ name: "", whatsapp: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<FieldError>({ field: "", message: "" });
  const companyRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // The form (and the focused button) disappears on success; move focus to the
  // receipt so keyboard and screen-reader users land on the confirmation.
  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    const sending = { name: name.trim(), whatsapp: whatsapp.trim() };
    setState("sending");
    setError({ field: "", message: "" });

    let res: Response;
    try {
      res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsapp, handle, role, start, source, company: companyRef.current?.value ?? "" }),
      });
    } catch {
      setError({ field: "", message: "Koneksinya putus. Cek internet lo, terus coba lagi." });
      setState("error");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError({ field: res.status === 400 ? (data.field ?? "") : "", message: data.error || "Gagal nyimpen. Coba sekali lagi." });
      setState("error");
      return;
    }
    setSaved(sending);
    setState("done");
  }

  if (state === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} className={`wl-done wl--${tone}`} role="status" aria-live="polite">
        <p className="wl-done__stamp">Tercatat</p>
        <dl className="wl-done__lines">
          <div>
            <dt>Nama</dt>
            <dd>{saved.name}</dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>{saved.whatsapp}</dd>
          </div>
          <div>
            <dt>Kabar</dt>
            <dd>pas batch pertama dibuka</dd>
          </div>
        </dl>
        <p className="wl-done__note">
          Sambil nunggu, contoh formatnya ada di{" "}
          <a href="https://www.instagram.com/hanifmuh_/" target="_blank" rel="noopener noreferrer">
            @hanifmuh_
          </a>
          .
        </p>
      </div>
    );
  }

  const err = (field: FieldError["field"]) => (state === "error" && error.field === field ? true : undefined);
  const busy = state === "sending";

  return (
    <form className={`wl wl--${tone}`} onSubmit={submit}>
      <div className="wl-fields">
        <div className="wl-input">
          <label htmlFor={`${id}-name`}>Nama</label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            required
            maxLength={80}
            value={name}
            readOnly={busy}
            aria-invalid={err("name")}
            aria-describedby={`${id}-err`}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="wl-input">
          <label htmlFor={`${id}-wa`}>WhatsApp</label>
          <input
            id={`${id}-wa`}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            required
            maxLength={24}
            value={whatsapp}
            readOnly={busy}
            aria-invalid={err("whatsapp")}
            aria-describedby={`${id}-err`}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </div>
        <div className="wl-input wl-input--wide">
          <label htmlFor={`${id}-handle`}>
            Akun IG atau TikTok <em>kalau ada</em>
          </label>
          <input
            id={`${id}-handle`}
            name="handle"
            autoComplete="off"
            placeholder="@akunlo"
            maxLength={31}
            value={handle}
            readOnly={busy}
            aria-invalid={err("handle")}
            aria-describedby={`${id}-err`}
            onChange={(e) => setHandle(e.target.value)}
          />
        </div>
      </div>

      <fieldset className="wl-group">
        <legend>Lo siapa?</legend>
        <div className="wl-chips">
          {ROLES.map((r) => (
            <label key={r.value} className="wl-chip">
              <input type="radio" name={`${id}-role`} value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="wl-group">
        <legend>Mau mulai kapan?</legend>
        <div className="wl-chips">
          {STARTS.map((s) => (
            <label key={s.value} className="wl-chip">
              <input type="radio" name={`${id}-start`} value={s.value} checked={start === s.value} onChange={() => setStart(s.value)} />
              <span>{s.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="wl-hp" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Perusahaan</label>
        <input id={`${id}-company`} ref={companyRef} type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="wl-submitrow">
        <button className="wl-submit wl-submit--block" type="submit" aria-disabled={busy}>
          {busy ? "Nyimpen..." : "Daftar waitlist"}
        </button>
        <p id={`${id}-err`} className="wl-error" role="alert">
          {state === "error" ? error.message : ""}
        </p>
      </div>
    </form>
  );
}
