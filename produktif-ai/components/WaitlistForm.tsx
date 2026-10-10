"use client";

import { useEffect, useId, useRef, useState } from "react";
import { NEEDS, TOOLS } from "@/lib/waitlist";

type Props = { source: "hero" | "footer"; tone?: "paper" | "ink" };

export default function WaitlistForm({ source, tone = "paper" }: Props) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState("");
  const [tool, setTool] = useState("");
  const [needs, setNeeds] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [invalid, setInvalid] = useState(false);
  const companyRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  // The form (and the focused button) disappears on success; move focus to the
  // receipt so keyboard and screen-reader users land on the confirmation.
  useEffect(() => {
    if (state === "done") doneRef.current?.focus();
  }, [state]);

  function toggleNeed(value: string) {
    setNeeds((cur) => (cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    const sending = email.trim().toLowerCase();
    setState("sending");
    setError("");
    setInvalid(false);

    let res: Response;
    try {
      res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tool, needs, source, company: companyRef.current?.value ?? "" }),
      });
    } catch {
      setError("Koneksinya putus. Cek internet lo, terus coba lagi.");
      setState("error");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setInvalid(res.status === 400);
      setError(data.error || "Gagal nyimpen. Coba sekali lagi.");
      setState("error");
      return;
    }
    setSaved(sending);
    setState("done");
  }

  if (state === "done") {
    const [local, domain] = saved.split("@");
    return (
      <div ref={doneRef} tabIndex={-1} className={`wl-done wl--${tone}`} role="status" aria-live="polite">
        <p className="wl-done__stamp">Tercatat</p>
        <dl className="wl-done__lines">
          <div>
            <dt>Waitlist</dt>
            <dd>masuk</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>
              {local}
              <wbr />@{domain}
            </dd>
          </div>
          <div>
            <dt>Kabar</dt>
            <dd>pas drop pertama</dd>
          </div>
        </dl>
        <p className="wl-done__note">
          Sambil nunggu, konten gue tetep jalan tiap hari di{" "}
          <a href="https://www.instagram.com/hanifmuh_/" target="_blank" rel="noopener noreferrer">
            @hanifmuh_
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form className={`wl wl--${tone}`} onSubmit={submit}>
      <div className="wl-field">
        <div className="wl-row">
          <label htmlFor={`${id}-email`} className="sr-only">
            Email
          </label>
          <input
            id={`${id}-email`}
            className="wl-email"
            type="email"
            name="email"
            inputMode="email"
            autoComplete="email"
            placeholder="email lo"
            required
            maxLength={254}
            value={email}
            readOnly={state === "sending"}
            aria-invalid={invalid || undefined}
            aria-describedby={`${id}-err`}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="wl-submit" type="submit" aria-disabled={state === "sending"}>
            {state === "sending" ? "Nyimpen..." : "Masuk waitlist"}
          </button>
        </div>
        <p id={`${id}-err`} className="wl-error" role="alert">
          {state === "error" ? error : ""}
        </p>
      </div>

      <fieldset className="wl-group">
        <legend>Lo pake AI apa?</legend>
        <div className="wl-chips">
          {TOOLS.map((t) => (
            <label key={t.value} className="wl-chip">
              <input type="radio" name={`${id}-tool`} value={t.value} checked={tool === t.value} onChange={() => setTool(t.value)} />
              <span>{t.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="wl-group">
        <legend>
          Paling butuh buat apa? <em>boleh lebih dari satu</em>
        </legend>
        <div className="wl-chips">
          {NEEDS.map((n) => (
            <label key={n.value} className="wl-chip">
              <input type="checkbox" value={n.value} checked={needs.includes(n.value)} onChange={() => toggleNeed(n.value)} />
              <span>{n.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="wl-hp" aria-hidden="true">
        <label htmlFor={`${id}-company`}>Perusahaan</label>
        <input id={`${id}-company`} ref={companyRef} type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>
    </form>
  );
}
