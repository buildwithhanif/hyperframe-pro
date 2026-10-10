"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ROLES, STARTS } from "@/lib/waitlist";

type Props = { source: "hero" | "footer" };
type Field = "name" | "whatsapp" | "handle";
type Saved = { name: string; whatsapp: string };

const DONE_EVENT = "wl:done";

export default function WaitlistForm({ source }: Props) {
  const id = useId();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [handle, setHandle] = useState("");
  const [role, setRole] = useState("");
  const [start, setStart] = useState("");
  const [saved, setSaved] = useState<Saved>({ name: "", whatsapp: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [fieldError, setFieldError] = useState<{ field: Field; message: string } | null>(null);
  const [formError, setFormError] = useState("");
  const hpRef = useRef<HTMLInputElement>(null);
  const doneRef = useRef<HTMLDivElement>(null);
  const submittedHere = useRef(false);
  const inputs = { name: useRef<HTMLInputElement>(null), whatsapp: useRef<HTMLInputElement>(null), handle: useRef<HTMLInputElement>(null) };

  // Both forms on the page show the receipt once either one succeeds.
  useEffect(() => {
    function onDone(e: Event) {
      setSaved((e as CustomEvent<Saved>).detail);
      setState("done");
    }
    window.addEventListener(DONE_EVENT, onDone);
    return () => window.removeEventListener(DONE_EVENT, onDone);
  }, []);

  // Move focus to the receipt (only in the form that was submitted) or to the
  // field that needs fixing.
  useEffect(() => {
    if (state === "done" && submittedHere.current) doneRef.current?.focus();
    if (state === "error" && fieldError) inputs[fieldError.field].current?.focus();
  }, [state, fieldError]); // eslint-disable-line react-hooks/exhaustive-deps

  function edit(field: Field, setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      if (fieldError?.field === field) setFieldError(null);
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "sending") return;
    const sending = { name: name.trim(), whatsapp: whatsapp.trim() };
    setState("sending");
    setFieldError(null);
    setFormError("");

    let res: Response;
    try {
      res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, whatsapp, handle, role, start, source, company: hpRef.current?.value ?? "" }),
      });
    } catch {
      setFormError("Connection lost. Check your internet and try again.");
      setState("error");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const message = data.error || "We couldn't save that. Please try again.";
      if (res.status === 400 && ["name", "whatsapp", "handle"].includes(data.field)) {
        setFieldError({ field: data.field, message });
      } else {
        setFormError(message);
      }
      setState("error");
      return;
    }
    submittedHere.current = true;
    window.dispatchEvent(new CustomEvent<Saved>(DONE_EVENT, { detail: sending }));
  }

  if (state === "done") {
    return (
      <div ref={doneRef} tabIndex={-1} className="wl-card wl-done" role="status" aria-live="polite">
        <div className="wl-head">
          <span>Waitlist</span>
          <span>Confirmed</span>
        </div>
        <Receipt name={saved.name} whatsapp={saved.whatsapp} />
      </div>
    );
  }

  const busy = state === "sending";
  const errorFor = (field: Field) => (fieldError?.field === field ? fieldError.message : "");
  const fieldProps = (field: Field) => ({
    id: `${id}-${field}`,
    ref: inputs[field],
    readOnly: busy,
    "aria-invalid": errorFor(field) ? true : undefined,
    "aria-describedby": errorFor(field) ? `${id}-${field}-err` : undefined,
  });
  const errorLine = (field: Field) =>
    errorFor(field) ? (
      <p id={`${id}-${field}-err`} className="wl-error">
        {errorFor(field)}
      </p>
    ) : null;

  return (
    <form className="wl-card wl-form" onSubmit={submit}>
      <div className="wl-head">
        <span>Your details</span>
        <span>Free</span>
      </div>
      <div className="wl-fields">
        <div className="wl-field">
          <div className="wl-label">
            <label htmlFor={`${id}-name`}>Name</label>
            <span className="wl-meta">Required</span>
          </div>
          <input {...fieldProps("name")} name="name" autoComplete="name" required maxLength={80} value={name} onChange={edit("name", setName)} />
          {errorLine("name")}
        </div>
        <div className="wl-field">
          <div className="wl-label">
            <label htmlFor={`${id}-whatsapp`}>WhatsApp</label>
            <span className="wl-meta">Required</span>
          </div>
          <input
            {...fieldProps("whatsapp")}
            name="whatsapp"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0812 3456 7890"
            required
            maxLength={24}
            value={whatsapp}
            onChange={edit("whatsapp", setWhatsapp)}
          />
          {errorLine("whatsapp")}
        </div>
        <div className="wl-field wl-field--full">
          <div className="wl-label">
            <label htmlFor={`${id}-handle`}>Instagram or TikTok</label>
            <span className="wl-meta">Optional</span>
          </div>
          <input
            {...fieldProps("handle")}
            name="handle"
            autoComplete="off"
            placeholder="@yourhandle"
            maxLength={120}
            value={handle}
            onChange={edit("handle", setHandle)}
          />
          {errorLine("handle")}
        </div>

        <fieldset className="wl-field wl-field--full">
          <legend className="wl-label">
            <span>What do you do?</span>
            <span className="wl-meta">Optional</span>
          </legend>
          <div className="wl-opts">
            {ROLES.map((r) => (
              <label key={r.value} className="wl-opt">
                <input type="radio" name={`${id}-role`} value={r.value} checked={role === r.value} onChange={() => setRole(r.value)} />
                <span>{r.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="wl-field wl-field--full">
          <legend className="wl-label">
            <span>When do you want to start?</span>
            <span className="wl-meta">Optional</span>
          </legend>
          <div className="wl-opts">
            {STARTS.map((s) => (
              <label key={s.value} className="wl-opt">
                <input type="radio" name={`${id}-start`} value={s.value} checked={start === s.value} onChange={() => setStart(s.value)} />
                <span>{s.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="wl-hp" aria-hidden="true">
        <label htmlFor={`${id}-hp`}>Leave this empty</label>
        <input id={`${id}-hp`} ref={hpRef} type="text" name="hp_ref" tabIndex={-1} autoComplete="off" data-1p-ignore data-bwignore data-lpignore="true" />
      </div>

      <button className="lp-btn wl-submit" type="submit" aria-disabled={busy}>
        {busy ? "Saving…" : "Join the waitlist"}
        {!busy && <Arrow />}
      </button>
      <p className="wl-error" role="alert">
        {formError}
      </p>
      <p className="wl-fine">We only use your number to tell you when the first cohort opens.</p>
    </form>
  );
}

// Shared by the live confirmation and the static preview next to the form.
export function Receipt({ name, whatsapp }: Saved) {
  return (
    <>
      <p className="wl-ok">
        <i aria-hidden="true">
          <svg viewBox="0 0 16 16">
            <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </i>
        You&rsquo;re on the list.
      </p>
      <dl className="wl-kv">
        <div>
          <dt>Name</dt>
          <dd>{name}</dd>
        </div>
        <div>
          <dt>WhatsApp</dt>
          <dd>{whatsapp}</dd>
        </div>
      </dl>
      <p className="wl-note">You&rsquo;ll hear from us on WhatsApp.</p>
    </>
  );
}

export function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
