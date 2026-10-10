"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ROLES, STARTS } from "@/lib/waitlist";

type Props = { source: "hero" | "footer"; tone?: "paper" | "ink" };
type Field = "name" | "whatsapp" | "handle";
type Saved = { name: string; whatsapp: string };

const DONE_EVENT = "wl:done";

export default function WaitlistForm({ source, tone = "paper" }: Props) {
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
      <div ref={doneRef} tabIndex={-1} className={`wl-done wl--${tone}`} role="status" aria-live="polite">
        <p className="wl-done__stamp">You&rsquo;re on the list.</p>
        <dl className="wl-done__lines">
          <div>
            <dt>Name</dt>
            <dd>{saved.name}</dd>
          </div>
          <div>
            <dt>WhatsApp</dt>
            <dd>{saved.whatsapp}</dd>
          </div>
        </dl>
        <p className="wl-done__note">We&rsquo;ll reach out on WhatsApp when the first cohort opens.</p>
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
    <form className={`wl wl--${tone}`} onSubmit={submit}>
      <div className="wl-fields">
        <div className="wl-input">
          <label htmlFor={`${id}-name`}>Name</label>
          <input {...fieldProps("name")} name="name" autoComplete="name" required maxLength={80} value={name} onChange={edit("name", setName)} />
          {errorLine("name")}
        </div>
        <div className="wl-input">
          <label htmlFor={`${id}-whatsapp`}>WhatsApp</label>
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
        <div className="wl-input wl-input--wide">
          <label htmlFor={`${id}-handle`}>
            Instagram or TikTok <em>optional</em>
          </label>
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
      </div>

      <fieldset className="wl-group">
        <legend>What do you do?</legend>
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
        <legend>When do you want to start?</legend>
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
        <label htmlFor={`${id}-hp`}>Leave this empty</label>
        <input id={`${id}-hp`} ref={hpRef} type="text" name="hp_ref" tabIndex={-1} autoComplete="off" data-1p-ignore data-bwignore data-lpignore="true" />
      </div>

      <div className="wl-submitrow">
        <button className="wl-submit wl-submit--block" type="submit" aria-disabled={busy}>
          {busy ? "Saving…" : "Join the waitlist"}
        </button>
        <p className="wl-error" role="alert">
          {formError}
        </p>
        <p className="wl-fine">No payment to join. We&rsquo;ll contact you on WhatsApp when the first cohort opens.</p>
      </div>
    </form>
  );
}
