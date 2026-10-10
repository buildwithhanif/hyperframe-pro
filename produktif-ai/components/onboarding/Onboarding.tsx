"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { BUDGETS, FOLLOWERS, GOALS, LANGUAGES, PLATFORMS, POSTING, STARTS } from "@/lib/waitlist";

type Answers = {
  name: string;
  email: string;
  whatsapp: string;
  consent: boolean;
  niche: string;
  platform: string;
  handle: string;
  followers: string;
  posting: string;
  goal: string;
  language: string;
  start: string;
  budget: string;
};
type Session = { lead_id: string; token: string };
type Option = { value: string; label: string; hint?: string };

const EMPTY: Answers = {
  name: "",
  email: "",
  whatsapp: "",
  consent: false,
  niche: "",
  platform: "",
  handle: "",
  followers: "",
  posting: "",
  goal: "",
  language: "",
  start: "",
  budget: "",
};

const STORE = "pai-apply-v1";
const NICHE_IDEAS = ["Personal finance", "Tech and AI", "Health and fitness", "Beauty", "Food", "Parenting", "Business tips", "Education"];

type StepId =
  | "name"
  | "email"
  | "whatsapp"
  | "niche"
  | "platform"
  | "followers"
  | "posting"
  | "goal"
  | "language"
  | "start"
  | "budget";

const STEPS: StepId[] = ["name", "email", "whatsapp", "niche", "platform", "followers", "posting", "goal", "language", "start", "budget"];
const FIELD_STEP: Record<string, StepId> = {
  name: "name",
  email: "email",
  whatsapp: "whatsapp",
  consent: "whatsapp",
  niche: "niche",
  platform: "platform",
  handle: "platform",
  followers: "followers",
  posting: "posting",
  goal: "goal",
  language: "language",
  start: "start",
  budget: "budget",
};

const EASE = [0.22, 1, 0.36, 1] as const;

function readStore(): { answers: Answers; session: Session | null } {
  try {
    const raw = window.localStorage.getItem(STORE);
    if (!raw) return { answers: EMPTY, session: null };
    const data = JSON.parse(raw);
    return { answers: { ...EMPTY, ...(data.answers ?? {}) }, session: data.session ?? null };
  } catch {
    return { answers: EMPTY, session: null };
  }
}

function writeStore(answers: Answers, session: Session | null) {
  try {
    window.localStorage.setItem(STORE, JSON.stringify({ answers, session }));
  } catch {
    // Private mode or blocked storage: the flow still works, it just won't resume.
  }
}

function clearStore() {
  try {
    window.localStorage.removeItem(STORE);
  } catch {}
}

function readUtm() {
  const out = { utm_source: "", utm_medium: "", utm_campaign: "" };
  try {
    const params = new URLSearchParams(window.location.search);
    const saved = JSON.parse(window.sessionStorage.getItem("pai-utm") || "{}");
    for (const k of Object.keys(out) as (keyof typeof out)[]) out[k] = (params.get(k) || saved[k] || "").slice(0, 100);
  } catch {}
  return out;
}

async function post(url: string, body: unknown): Promise<{ ok: boolean; status: number; data: Record<string, string> }> {
  const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

export default function Onboarding() {
  const uid = useId();
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [session, setSession] = useState<Session | null>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [done, setDone] = useState(false);
  const honeypot = useRef<HTMLInputElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // Restore progress, or pick up from the link in the confirmation email.
  useEffect(() => {
    const stored = readStore();
    let s = stored.session;
    try {
      const params = new URLSearchParams(window.location.search);
      const lead = params.get("lead");
      const t = params.get("t");
      if (lead && t && /^[0-9a-f-]{36}$/i.test(lead) && /^[a-f0-9]{64}$/.test(t)) s = { lead_id: lead, token: t };
    } catch {}
    setAnswers(stored.answers);
    setSession(s);
    if (s) setIndex(STEPS.indexOf("niche"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready && !done) writeStore(answers, session);
  }, [answers, session, ready, done]);

  const step = STEPS[index];
  const total = STEPS.length;

  // Move focus to the new question so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (!ready) return;
    const t = window.setTimeout(() => {
      const el = stage.current?.querySelector<HTMLElement>("[data-autofocus]") ?? stage.current?.querySelector<HTMLElement>("h1");
      el?.focus({ preventScroll: true });
    }, reduce ? 0 : 260);
    return () => window.clearTimeout(t);
  }, [index, ready, done, reduce]);

  const set = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setError((e) => (e?.field && FIELD_STEP[e.field] === FIELD_STEP[key as string] ? null : e));
  }, []);

  const go = useCallback((next: number) => {
    setDir(next > index ? 1 : -1);
    setError(null);
    setIndex(Math.max(0, Math.min(STEPS.length - 1, next)));
  }, [index]);

  const localCheck = (id: StepId, a: Answers): string | null => {
    switch (id) {
      case "name":
        return a.name.trim().length < 2 ? "Please enter your name." : null;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim()) ? null : "That email doesn't look right. Check for typos.";
      case "whatsapp":
        return a.consent ? null : "Please tick the box so we can contact you.";
      case "niche":
        return a.niche.trim().length < 2 ? "Tell us what you make videos about." : null;
      case "platform":
        return a.platform ? null : "Pick where you post most.";
      default:
        return (a as Record<string, unknown>)[id] ? null : "Pick one to continue.";
    }
  };

  async function submitSignup(): Promise<boolean> {
    const res = await post("/api/apply", {
      name: answers.name,
      email: answers.email,
      whatsapp: answers.whatsapp,
      consent: answers.consent,
      company: honeypot.current?.value ?? "",
      ...readUtm(),
    }).catch(() => null);
    if (!res) {
      setError({ message: "Connection lost. Check your internet and try again." });
      return false;
    }
    if (!res.ok) {
      const field = res.data.field;
      if (field && FIELD_STEP[field] && FIELD_STEP[field] !== step) go(STEPS.indexOf(FIELD_STEP[field]));
      setError({ field, message: res.data.error || "We couldn't save that. Please try again." });
      return false;
    }
    setSession({ lead_id: res.data.lead_id, token: res.data.token });
    return true;
  }

  async function submitProfile(final: Answers): Promise<boolean> {
    if (!session) {
      setError({ message: "Your session expired. Please start again." });
      return false;
    }
    const res = await post("/api/apply/profile", {
      ...session,
      niche: final.niche,
      platform: final.platform,
      handle: final.handle,
      followers: final.followers,
      posting: final.posting,
      goal: final.goal,
      language: final.language,
      start: final.start,
      budget: final.budget,
      company: honeypot.current?.value ?? "",
    }).catch(() => null);
    if (!res) {
      setError({ message: "Connection lost. Check your internet and try again." });
      return false;
    }
    if (!res.ok) {
      if (res.status === 403 || (res.status === 400 && !res.data.field && /session/i.test(res.data.error || ""))) {
        setSession(null);
        go(0);
        setError({ message: "Your session expired. Your answers are saved, so just confirm your details again." });
        return false;
      }
      const field = res.data.field;
      if (field && FIELD_STEP[field]) go(STEPS.indexOf(FIELD_STEP[field]));
      setError({ field, message: res.data.error || "We couldn't save that. Please try again." });
      return false;
    }
    return true;
  }

  async function next(override?: Partial<Answers>) {
    if (busy) return;
    const merged = { ...answers, ...override };
    if (override) setAnswers(merged);
    const problem = localCheck(step, merged);
    if (problem) {
      // The WhatsApp screen only blocks on the consent box.
      setError({ field: step === "whatsapp" ? "consent" : step, message: problem });
      return;
    }
    if (step === "whatsapp" && !session) {
      setBusy(true);
      const ok = await submitSignup();
      setBusy(false);
      if (!ok) return;
    }
    if (index === total - 1) {
      setBusy(true);
      const ok = await submitProfile(merged);
      setBusy(false);
      if (!ok) return;
      clearStore();
      setDone(true);
      return;
    }
    // Signed-up people never need to see the signup questions again.
    go(index + 1);
  }

  const back = () => {
    if (index === 0) return;
    if (session && index <= STEPS.indexOf("niche")) return;
    go(index - 1);
  };

  const canGoBack = index > 0 && !(session && index <= STEPS.indexOf("niche"));

  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ opacity: 0, y: reduce ? 0 : d * 28, filter: reduce ? "none" : "blur(6px)" }),
      center: { opacity: 1, y: 0, filter: "blur(0px)" },
      exit: (d: number) => ({ opacity: 0, y: reduce ? 0 : d * -20, filter: reduce ? "none" : "blur(4px)" }),
    }),
    [reduce],
  );

  if (!ready) return <div className="ob" aria-busy="true" />;

  return (
    <div className="ob">
      <header className="ob-top">
        <Link href="/" className="ob-brand" aria-label="produktif.ai home">
          <span className="ob-mark" aria-hidden="true" />
          <span>
            produktif<i>.</i>ai
          </span>
        </Link>
        {!done && (
          <p className="ob-count" aria-live="polite">
            <span className="sr">Question </span>
            {index + 1} <span aria-hidden="true">/</span>
            <span className="sr"> of</span> {total}
          </p>
        )}
        <Link href="/" className="ob-close">
          {done ? "Back to site" : "Save and exit"}
        </Link>
        <div className="ob-progress" aria-hidden="true">
          <motion.i initial={false} animate={{ scaleX: done ? 1 : (index + 1) / total }} transition={{ duration: reduce ? 0 : 0.5, ease: EASE }} />
        </div>
      </header>

      <main className="ob-main">
        <div className="ob-stage" ref={stage}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {done ? (
              <motion.section key="done" className="ob-step ob-done" variants={variants} custom={1} initial="enter" animate="center" exit="exit" transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}>
                <Done name={answers.name} email={answers.email} />
              </motion.section>
            ) : (
              <motion.form
                key={step}
                className="ob-step"
                variants={variants}
                custom={dir}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0 : 0.42, ease: EASE }}
                onSubmit={(e) => {
                  e.preventDefault();
                  next();
                }}
                noValidate
              >
                <StepBody
                  id={step}
                  uid={uid}
                  answers={answers}
                  set={set}
                  pick={(key, value) => next({ [key]: value } as Partial<Answers>)}
                  error={error}
                />
                <div className="ob-hp" aria-hidden="true">
                  <label htmlFor={`${uid}-hp`}>Leave this empty</label>
                  <input id={`${uid}-hp`} ref={honeypot} name="hp_ref" tabIndex={-1} autoComplete="off" data-1p-ignore data-lpignore="true" />
                </div>
                {error && !error.field && (
                  <p className="ob-error ob-error--form" role="alert">
                    {error.message}
                  </p>
                )}
                <div className="ob-actions">
                  {canGoBack ? (
                    <button type="button" className="ob-back" onClick={back}>
                      <svg viewBox="0 0 16 16" aria-hidden="true">
                        <path d="M13 8H3M7 4L3 8l4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {!isChoice(step) || step === "platform" ? (
                    <button type="submit" className="ob-next" aria-disabled={busy}>
                      {busy ? "Saving…" : index === total - 1 ? "Submit" : step === "whatsapp" ? "Join the list" : "Continue"}
                      {!busy && (
                        <svg viewBox="0 0 16 16" aria-hidden="true">
                          <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ) : (
                    <span className="ob-keyhint" aria-hidden="true">
                      {busy ? (
                        "Saving…"
                      ) : (
                        <>
                          <span className="ob-hint-touch">Tap an answer</span>
                          <span className="ob-hint-keys">Press a letter, or click</span>
                        </>
                      )}
                    </span>
                  )}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function isChoice(id: StepId) {
  return ["platform", "followers", "posting", "goal", "language", "start", "budget"].includes(id);
}

type BodyProps = {
  id: StepId;
  uid: string;
  answers: Answers;
  set: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  pick: (key: keyof Answers, value: string) => void;
  error: { field?: string; message: string } | null;
};

function FieldError({ show, id, message }: { show: boolean; id: string; message?: string }) {
  if (!show || !message) return null;
  return (
    <p id={id} className="ob-error" role="alert">
      {message}
    </p>
  );
}

function StepBody({ id, uid, answers, set, pick, error }: BodyProps) {
  const err = (f: string) => (error?.field && (error.field === f || FIELD_STEP[error.field] === id) ? error.message : undefined);
  const errId = `${uid}-${id}-err`;
  const first = answers.name.trim().split(/\s+/)[0];

  switch (id) {
    case "name":
      return (
        <>
          <Kicker>Takes about 2 minutes. Nothing to pay.</Kicker>
          <h1 tabIndex={-1}>
            <label htmlFor={`${uid}-name`}>First, what should we call you?</label>
          </h1>
          <input
            id={`${uid}-name`}
            className="ob-input"
            data-autofocus
            autoComplete="name"
            enterKeyHint="next"
            maxLength={80}
            placeholder="Your name"
            value={answers.name}
            onChange={(e) => set("name", e.target.value)}
            aria-invalid={err("name") ? true : undefined}
            aria-describedby={err("name") ? errId : undefined}
          />
          <FieldError show={!!err("name")} id={errId} message={err("name")} />
        </>
      );
    case "email":
      return (
        <>
          <Kicker>{first ? `Nice to meet you, ${first}.` : "Nice to meet you."}</Kicker>
          <h1 tabIndex={-1}>
            <label htmlFor={`${uid}-email`}>Where should we send your spot?</label>
          </h1>
          <input
            id={`${uid}-email`}
            className="ob-input"
            data-autofocus
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="next"
            maxLength={254}
            placeholder="you@example.com"
            value={answers.email}
            onChange={(e) => set("email", e.target.value)}
            aria-invalid={err("email") ? true : undefined}
            aria-describedby={err("email") ? errId : undefined}
          />
          <FieldError show={!!err("email")} id={errId} message={err("email")} />
        </>
      );
    case "whatsapp":
      return (
        <>
          <Kicker>Optional, but it's the fastest way we reply.</Kicker>
          <h1 tabIndex={-1}>
            <label htmlFor={`${uid}-wa`}>Your WhatsApp number?</label>
          </h1>
          <input
            id={`${uid}-wa`}
            className="ob-input"
            data-autofocus
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            enterKeyHint="done"
            maxLength={24}
            placeholder="+62 812 3456 7890"
            value={answers.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            aria-invalid={error?.field === "whatsapp" ? true : undefined}
            aria-describedby={error?.field === "whatsapp" ? errId : `${uid}-wa-help`}
          />
          <p id={`${uid}-wa-help`} className="ob-help">
            Outside Indonesia? Start with your country code.
          </p>
          <FieldError show={error?.field === "whatsapp"} id={errId} message={error?.message} />
          <label className="ob-consent">
            <input
              type="checkbox"
              checked={answers.consent}
              onChange={(e) => set("consent", e.target.checked)}
              aria-invalid={error?.field === "consent" ? true : undefined}
              aria-describedby={error?.field === "consent" ? `${uid}-consent-err` : undefined}
            />
            {/* Mirrors CONSENT_TEXT, which is what the sheet records. */}
            <span>
              I agree to the{" "}
              <Link href="/privacy" target="_blank">
                privacy policy
              </Link>{" "}
              and to be contacted about produktif.ai by email or WhatsApp.
            </span>
          </label>
          <FieldError show={error?.field === "consent"} id={`${uid}-consent-err`} message={error?.message} />
        </>
      );
    case "niche":
      return (
        <>
          <Kicker>You're on the list. Now the fun part.</Kicker>
          <h1 tabIndex={-1}>
            <label htmlFor={`${uid}-niche`}>What do your videos teach or talk about?</label>
          </h1>
          <input
            id={`${uid}-niche`}
            className="ob-input"
            data-autofocus
            enterKeyHint="next"
            maxLength={80}
            placeholder="e.g. Money tips for first jobbers"
            value={answers.niche}
            onChange={(e) => set("niche", e.target.value)}
            aria-invalid={err("niche") ? true : undefined}
            aria-describedby={err("niche") ? errId : undefined}
          />
          <div className="ob-ideas" aria-label="Ideas">
            {NICHE_IDEAS.map((n) => (
              <button
                key={n}
                type="button"
                className="ob-idea"
                aria-pressed={answers.niche === n}
                onClick={() => {
                  set("niche", n);
                  // Back to the field, so Enter continues.
                  document.getElementById(`${uid}-niche`)?.focus();
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <FieldError show={!!err("niche")} id={errId} message={err("niche")} />
        </>
      );
    case "platform":
      return (
        <>
          <Kicker>We'll study your best posts before writing anything.</Kicker>
          <h1 tabIndex={-1} id={`${uid}-platform-q`}>
            Where do you post most?
          </h1>
          <Choices
            name={`${uid}-platform`}
            labelledBy={`${uid}-platform-q`}
            options={[...PLATFORMS]}
            value={answers.platform}
            onPick={(v) => set("platform", v)}
          />
          <label className="ob-sub" htmlFor={`${uid}-handle`}>
            Your handle <span>(optional)</span>
          </label>
          <input
            id={`${uid}-handle`}
            className="ob-input ob-input--sm"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={120}
            placeholder="@yourhandle"
            value={answers.handle}
            onChange={(e) => set("handle", e.target.value)}
            aria-invalid={error?.field === "handle" ? true : undefined}
            aria-describedby={error?.field === "handle" ? errId : undefined}
          />
          <FieldError show={!!err("platform")} id={errId} message={err("platform")} />
        </>
      );
    case "followers":
      return (
        <ChoiceStep uid={uid} kicker="Any size works. It helps us plan your topics." q="How big is your audience there?" options={[...FOLLOWERS]} value={answers.followers} onPick={(v) => pick("followers", v)} error={err("followers")} />
      );
    case "posting":
      return (
        <ChoiceStep uid={uid} kicker="No judgment. That's why you're here." q="How often do you post right now?" options={[...POSTING]} value={answers.posting} onPick={(v) => pick("posting", v)} error={err("posting")} />
      );
    case "goal":
      return (
        <ChoiceStep uid={uid} kicker="Pick the one that matters most." q="What do you want from this?" options={[...GOALS]} value={answers.goal} onPick={(v) => pick("goal", v)} error={err("goal")} />
      );
    case "language":
      return (
        <ChoiceStep uid={uid} kicker="You can change this every month." q="Which language should your videos speak?" options={[...LANGUAGES]} value={answers.language} onPick={(v) => pick("language", v)} error={err("language")} />
      );
    case "start":
      return (
        <ChoiceStep uid={uid} kicker="The first cohort is small." q="When would you like to start?" options={[...STARTS]} value={answers.start} onPick={(v) => pick("start", v)} error={err("start")} />
      );
    case "budget":
      return (
        <ChoiceStep
          uid={uid}
          kicker="Rp 4,000,000 a month for 60 videos. Month to month."
          q="Does the founding price work for you?"
          options={[...BUDGETS]}
          value={answers.budget}
          onPick={(v) => pick("budget", v)}
          error={err("budget")}
        />
      );
  }
}

function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="ob-kicker">{children}</p>;
}

function ChoiceStep(props: { uid: string; kicker: string; q: string; options: Option[]; value: string; onPick: (v: string) => void; error?: string }) {
  const qid = `${props.uid}-q`;
  const { options, onPick } = props;
  // A, B, C… pick an answer, like the letters on the cards.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      const i = e.key.toUpperCase().charCodeAt(0) - 65;
      if (e.key.length === 1 && i >= 0 && i < options.length) {
        e.preventDefault();
        onPick(options[i].value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [options, onPick]);
  return (
    <>
      <Kicker>{props.kicker}</Kicker>
      <h1 tabIndex={-1} id={qid}>
        {props.q}
      </h1>
      <Choices name={`${props.uid}-choice`} labelledBy={qid} options={props.options} value={props.value} onPick={props.onPick} autoFocus />
      <FieldError show={!!props.error} id={`${props.uid}-err`} message={props.error} />
    </>
  );
}

function Choices(props: { name: string; labelledBy: string; options: Option[]; value: string; onPick: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div className="ob-choices" role="radiogroup" aria-labelledby={props.labelledBy}>
      {props.options.map((o, i) => {
        const checked = props.value === o.value;
        return (
          <label key={o.value} className={`ob-choice${checked ? " is-on" : ""}`}>
            <input
              type="radio"
              name={props.name}
              value={o.value}
              checked={checked}
              data-autofocus={props.autoFocus && (checked || (!props.value && i === 0)) ? "" : undefined}
              onChange={() => props.onPick(o.value)}
              onClick={() => checked && props.onPick(o.value)}
            />
            <span className="ob-key" aria-hidden="true">
              {String.fromCharCode(65 + i)}
            </span>
            <span className="ob-label">{o.label}</span>
            <svg className="ob-tick" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </label>
        );
      })}
    </div>
  );
}

function Done({ name, email }: { name: string; email: string }) {
  const first = name.trim().split(/\s+/)[0];
  return (
    <div className="ob-done-inner" role="status">
      <div className="ob-done-badge" aria-hidden="true">
        <svg viewBox="0 0 16 16">
          <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h1 tabIndex={-1}>{first ? `You're on the list, ${first}.` : "You're on the list."}</h1>
      <p className="ob-done-lead">We read every profile by hand and reply within 2 working days.</p>
      <ol className="ob-next-steps">
        <li>
          <b>Check your inbox.</b> A confirmation is on its way{email ? ` to ${email}` : ""}.
        </li>
        <li>
          <b>We review your profile.</b> If it's a fit, we'll message you by email or WhatsApp.
        </li>
        <li>
          <b>We show you how it works.</b> A short call if you want one, then your AI persona.
        </li>
      </ol>
      <Link href="/" className="ob-next ob-next--ghost">
        Back to produktif.ai
      </Link>
    </div>
  );
}
