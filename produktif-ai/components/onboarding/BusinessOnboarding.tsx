"use client";

import { AnimatePresence, m, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Wordmark } from "@/components/site/Brand";
import { formatReplyBy, replyBy } from "@/lib/dates";
import { BIZ_BUDGETS, BIZ_PLATFORMS, CATEGORIES, FACES, WANTS } from "@/lib/waitlist-options";
import { ChoiceStep, Choices, EASE, FieldError, Kicker, post, readUtm } from "./Onboarding";

// v2 Get Started, for owners of an existing business. Same building blocks as
// v1's creator flow, different questions: WhatsApp only, and the first answer
// (what they sell) usually arrives from the landing page. Six steps; who makes
// their content now and when to start are left for the setup call.

type Answers = {
  cat: string;
  want: string;
  name: string;
  whatsapp: string;
  consent: boolean;
  optin: boolean;
  platform: string;
  handle: string;
  face: string;
  budget: string;
};
type Session = { lead_id: string; token: string };
type StepId = "cat" | "want" | "contact" | "account" | "face" | "budget";

const EMPTY: Answers = {
  cat: "",
  want: "",
  name: "",
  whatsapp: "",
  consent: false,
  optin: false,
  platform: "",
  handle: "",
  face: "",
  budget: "",
};
// New key: answers saved by the nine-step draft don't fit this shape.
const STORE = "pai-apply-biz2";
const STEPS: StepId[] = ["cat", "want", "contact", "account", "face", "budget"];
const CONTACT = STEPS.indexOf("contact");
const CHOICE: StepId[] = ["cat", "want", "account", "face", "budget"];
const FIELD_STEP: Record<string, StepId> = {
  cat: "cat",
  want: "want",
  name: "contact",
  whatsapp: "contact",
  consent: "contact",
  platform: "account",
  handle: "account",
  face: "face",
  budget: "budget",
};
// The official business number, if set. Digits only for wa.me links.
const WA = process.env.NEXT_PUBLIC_WA_NUMBER || "";
const WA_DIGITS = WA.replace(/\D/g, "");

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

// `home` is the landing page the visitor came from (/v2 or /v3): the logo and
// "finish later" go back there, and the sheet records it as `page`.
export default function BusinessOnboarding({ home = "/v2" }: { home?: "/v2" | "/v3" }) {
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
  const kbKeep = useRef<HTMLInputElement>(null);

  // Restore progress, take the category tapped on the landing page, or pick
  // up from the link in the confirmation email.
  useEffect(() => {
    const stored = readStore();
    let s = stored.session;
    const a = { ...stored.answers };
    let start = 0;
    try {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("cat");
      if (cat && CATEGORIES.some((c) => c.value === cat)) a.cat = cat;
      const lead = params.get("lead");
      const t = params.get("t");
      if (lead && t && /^[0-9a-f-]{36}$/i.test(lead) && /^[a-f0-9]{64}$/.test(t)) s = { lead_id: lead, token: t };
    } catch {}
    if (s) start = STEPS.indexOf("account");
    else if (a.cat) start = a.want ? CONTACT : 1;
    setAnswers(a);
    setSession(s);
    setIndex(start);
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
    const t = window.setTimeout(
      () => {
        const el = stage.current?.querySelector<HTMLElement>("[data-autofocus]") ?? stage.current?.querySelector<HTMLElement>("h1");
        el?.focus({ preventScroll: true });
      },
      reduce ? 0 : 260,
    );
    return () => window.clearTimeout(t);
  }, [index, ready, done, reduce]);

  const set = useCallback(<K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((a) => ({ ...a, [key]: value }));
    setError((e) => (e?.field && FIELD_STEP[e.field] === FIELD_STEP[key as string] ? null : e));
  }, []);

  const refocus = () => stage.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus({ preventScroll: true });

  const go = useCallback(
    (next: number) => {
      setDir(next > index ? 1 : -1);
      setError(null);
      setIndex(Math.max(0, Math.min(STEPS.length - 1, next)));
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    },
    [index],
  );

  const localCheck = (id: StepId, a: Answers): { field: string; message: string } | null => {
    switch (id) {
      case "contact":
        if (a.name.trim().length < 2) return { field: "name", message: "Please enter your name." };
        if (a.whatsapp.replace(/\D/g, "").length < 8) return { field: "whatsapp", message: "Add your WhatsApp number so we can reply." };
        if (!a.consent) return { field: "consent", message: "Please tick the box so we can message you." };
        return null;
      case "account":
        return a.platform ? null : { field: "platform", message: "Pick your main account." };
      default:
        return (a as Record<string, unknown>)[id] ? null : { field: id, message: "Pick one to continue." };
    }
  };

  async function submitSignup(a: Answers): Promise<boolean> {
    const res = await post("/api/apply", {
      variant: "v2",
      page: home.slice(1),
      cat: a.cat,
      name: a.name,
      whatsapp: a.whatsapp,
      consent: a.consent,
      optin: a.optin,
      company: honeypot.current?.value ?? "",
      ...readUtm(),
    }).catch(() => null);
    if (!res) {
      setError({ message: "Connection lost. Your answers are saved on this device. Try again." });
      return false;
    }
    if (!res.ok) {
      const field = res.data.field;
      if (field && FIELD_STEP[field] && FIELD_STEP[field] !== step) go(STEPS.indexOf(FIELD_STEP[field]));
      setError({ field, message: res.data.error || "We couldn’t save that. Please try again." });
      return false;
    }
    setSession({ lead_id: res.data.lead_id ?? "", token: res.data.token ?? "" });
    return true;
  }

  async function submitProfile(a: Answers): Promise<boolean> {
    if (!session) {
      setError({ message: "Your session expired. Please start again." });
      return false;
    }
    const res = await post("/api/apply/profile", {
      variant: "v2",
      lead_id: session.lead_id,
      token: session.token,
      cat: a.cat,
      want: a.want,
      platform: a.platform,
      handle: a.handle,
      face: a.face,
      budget: a.budget,
      company: honeypot.current?.value ?? "",
    }).catch(() => null);
    if (!res) {
      setError({ message: "Connection lost. Your answers are saved on this device. Try again." });
      return false;
    }
    if (!res.ok) {
      if (res.status === 403 || (res.status === 400 && !res.data.field && /session/i.test(res.data.error || ""))) {
        setSession(null);
        go(CONTACT);
        setError({ message: "Your session expired. Confirm your details and you’ll pick up where you left off." });
        return false;
      }
      const field = res.data.field;
      if (field && FIELD_STEP[field]) go(STEPS.indexOf(FIELD_STEP[field]));
      setError({ field, message: res.data.error || "We couldn’t save that. Please try again." });
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
      setError(problem);
      if (problem.field === "consent") {
        document.querySelector<HTMLInputElement>(".ob-consent input")?.focus({ preventScroll: true });
        requestAnimationFrame(() =>
          document.querySelector(".ob-consent")?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }),
        );
      } else refocus();
      return;
    }
    if (step === "contact" && !session) {
      setBusy(true);
      const ok = await submitSignup(merged);
      setBusy(false);
      if (!ok) return refocus();
    }
    if (index === total - 1) {
      setBusy(true);
      const ok = await submitProfile(merged);
      setBusy(false);
      if (!ok) return refocus();
      clearStore();
      setDone(true);
      return;
    }
    go(index + 1);
  }

  // Once signed up, nobody needs to see the contact step again.
  const canGoBack = index > 0 && !(session && index <= STEPS.indexOf("account"));
  const back = () => {
    if (canGoBack) go(index - 1);
  };

  const variants = useMemo(
    () => ({
      enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 16 }),
      center: { opacity: 1, x: 0, transition: { duration: reduce ? 0 : 0.24, ease: EASE } },
      exit: (d: number) => ({
        opacity: 0,
        x: reduce ? 0 : d * -16,
        transition: { duration: reduce ? 0 : 0.17, ease: [0.5, 0, 0.75, 0] as const },
      }),
    }),
    [reduce],
  );

  const pick = (key: keyof Answers, value: string, advance = true) => {
    set(key, value as never);
    // Arrow keys only move the selection; Enter or Continue moves on.
    if (!advance) return;
    window.setTimeout(() => next({ [key]: value } as Partial<Answers>), reduce ? 0 : 220);
  };
  const err = (f: string) => (error?.field && (error.field === f || FIELD_STEP[error.field] === step) ? error.message : undefined);
  const first = answers.name.trim().split(/\s+/)[0];
  const catLabel = CATEGORIES.find((c) => c.value === answers.cat)?.label;

  function body() {
    switch (step) {
      case "cat":
        return (
          <ChoiceStep
            uid={uid}
            kicker="Takes about 2 minutes. Nothing to pay."
            q="What do you sell?"
            options={[...CATEGORIES]}
            value={answers.cat}
            onPick={(v, a) => pick("cat", v, a)}
            error={err("cat")}
          />
        );
      case "want":
        return (
          <ChoiceStep
            uid={uid}
            kicker={
              catLabel
                ? `${catLabel}. We can’t promise any of these; it tells us what to plan for.`
                : "We can’t promise any of these; it tells us what to plan for."
            }
            q="What do you want more of?"
            options={[...WANTS]}
            value={answers.want}
            onPick={(v, a) => pick("want", v, a)}
            error={err("want")}
          />
        );
      case "contact":
        return (
          <>
            <Kicker>Expect a WhatsApp message within 2 working days.</Kicker>
            <h1 tabIndex={-1}>Where should we send your reply?</h1>
            <label className="ob-sub" htmlFor={`${uid}-name`}>
              Your name
            </label>
            <input
              id={`${uid}-name`}
              className="ob-input ob-input--sm"
              data-autofocus
              autoComplete="name"
              enterKeyHint="next"
              maxLength={80}
              value={answers.name}
              onChange={(e) => set("name", e.target.value)}
              aria-invalid={err("name") && error?.field === "name" ? true : undefined}
            />
            <label className="ob-sub" htmlFor={`${uid}-wa`}>
              WhatsApp number
            </label>
            <input
              id={`${uid}-wa`}
              className="ob-input ob-input--sm"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              enterKeyHint="done"
              maxLength={24}
              placeholder="0812 3456 7890"
              value={answers.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              aria-invalid={error?.field === "whatsapp" ? true : undefined}
              aria-describedby={`${uid}-wa-help`}
            />
            <p id={`${uid}-wa-help`} className="ob-help">
              We only use it for this application. Outside Indonesia? Start with your country code.
              {WA && (
                <>
                  {" "}
                  We only message from <span className="ob-nowrap">{WA}</span>, and we never ask for OTP codes or passwords.
                </>
              )}
            </p>
            <FieldError
              show={!!error && ["name", "whatsapp"].includes(error.field ?? "")}
              id={`${uid}-contact-err`}
              message={error?.message}
            />
            <label className="ob-consent">
              <input
                type="checkbox"
                checked={answers.consent}
                onChange={(e) => set("consent", e.target.checked)}
                aria-invalid={error?.field === "consent" ? true : undefined}
                aria-describedby={error?.field === "consent" ? `${uid}-consent-err` : undefined}
              />
              {/* Mirrors CONSENT_TEXT_V2, which is what the sheet records. */}
              <span>
                I agree to the{" "}
                <Link href="/privacy" target="_blank">
                  privacy policy
                </Link>{" "}
                and to produktif.ai messaging me on WhatsApp about this application.
              </span>
            </label>
            <FieldError show={error?.field === "consent"} id={`${uid}-consent-err`} message={error?.message} />
            <label className="ob-consent ob-consent--opt">
              <input type="checkbox" checked={answers.optin} onChange={(e) => set("optin", e.target.checked)} />
              {/* Mirrors OPTIN_TEXT_V2. Optional. */}
              <span>Also message me when a new group of businesses opens. I can stop anytime. (Optional)</span>
            </label>
          </>
        );
      case "account":
        return (
          <>
            <Kicker>{`Got it${first ? `, ${first}` : ""}. A few quick taps so we can check the fit.`}</Kicker>
            <h1 tabIndex={-1} id={`${uid}-account-q`}>
              Your business&rsquo;s main account?
            </h1>
            <Choices
              compact
              name={`${uid}-platform`}
              labelledBy={`${uid}-account-q`}
              options={[...BIZ_PLATFORMS]}
              value={answers.platform}
              onPick={(v) => set("platform", v)}
              autoFocus
            />
            <label className="ob-sub" htmlFor={`${uid}-handle`}>
              Its @handle <span>(optional)</span>
            </label>
            <input
              id={`${uid}-handle`}
              className="ob-input ob-input--sm"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={120}
              placeholder="@yourbusiness"
              value={answers.handle}
              onChange={(e) => set("handle", e.target.value)}
              aria-invalid={error?.field === "handle" ? true : undefined}
              aria-describedby={`${uid}-handle-help`}
            />
            <p id={`${uid}-handle-help`} className="ob-help">
              Paste the profile link if that&rsquo;s easier. We look at it before we reply.
            </p>
            <FieldError show={!!err("platform")} id={`${uid}-account-err`} message={err("platform")} />
          </>
        );
      case "face":
        return (
          <ChoiceStep
            uid={uid}
            kicker="Each video opens and closes with an AI version of one real person."
            q="Who will be the face of your videos?"
            lead="It has to be you, or someone on your team who agrees in writing and passes an ID check. Nothing to upload today."
            options={[...FACES]}
            value={answers.face}
            onPick={(v, a) => pick("face", v, a)}
            error={err("face")}
          />
        );
      case "budget":
        return (
          <ChoiceStep
            uid={uid}
            kicker="Last one."
            q="Does Rp 4,000,000 a month work for you?"
            lead="That’s the founding rate for 60 finished videos a month. Month to month, no tool subscriptions."
            note={
              answers.budget === "test-first"
                ? "Fair. If we pick you, your test clip comes before any monthly bill, and the deposit comes back if it isn’t right."
                : answers.budget === "not-yet"
                  ? "That’s fine. We’ll still reply to your application."
                  : undefined
            }
            options={[...BIZ_BUDGETS]}
            value={answers.budget}
            onPick={(v, a) => pick("budget", v, a)}
            error={err("budget")}
          />
        );
    }
  }

  const showSubmit = !CHOICE.includes(step) || step === "account" || !!answers[step as keyof Answers];

  return (
    <div className="ob">
      <header className="ob-top">
        <Link href={home} className="ob-brand" aria-label="produktif.ai home">
          <Wordmark title={null} className="ob-wm" />
        </Link>
        {!done && (
          <p className="ob-count" aria-live="polite">
            Step {index + 1} of {total}
          </p>
        )}
        {/* Nothing is saved on our side before the contact step, so "finish
            later" only appears once it would be true. */}
        {(done || index > CONTACT) && (
          <Link href={home} className="ob-close">
            {done ? (
              "Back to site"
            ) : (
              <>
                <span className="ob-close-more">Save and finish later</span>
                <span className="ob-close-less">Finish later</span>
              </>
            )}
          </Link>
        )}
        <div className="ob-progress" aria-hidden="true">
          <m.i
            initial={false}
            animate={{ scaleX: done ? 1 : (index + 1) / total }}
            transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
          />
        </div>
      </header>

      <input ref={kbKeep} className="ob-kb" aria-hidden="true" tabIndex={-1} readOnly />
      <main className="ob-main">
        <div className="ob-stage" ref={stage}>
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            {done ? (
              <m.section
                key="done"
                className="ob-step ob-done"
                variants={variants}
                custom={1}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: reduce ? 0 : 0.45, ease: EASE }}
              >
                <Done
                  name={answers.name}
                  cat={catLabel ?? ""}
                  warm={answers.budget === "yes" || answers.budget === "test-first"}
                  optin={answers.optin}
                />
              </m.section>
            ) : (
              <m.form
                key={step}
                className="ob-step"
                variants={variants}
                custom={dir}
                initial="enter"
                animate="center"
                exit="exit"
                onSubmit={(e) => {
                  e.preventDefault();
                  const after = STEPS[index + 1];
                  if (after && !CHOICE.includes(after) && !localCheck(step, answers)) kbKeep.current?.focus({ preventScroll: true });
                  next();
                }}
                noValidate
              >
                {body()}
                <div className="ob-hp" aria-hidden="true">
                  <label htmlFor={`${uid}-hp`}>Leave this empty</label>
                  <input
                    id={`${uid}-hp`}
                    ref={honeypot}
                    name="hp_ref"
                    tabIndex={-1}
                    autoComplete="off"
                    data-1p-ignore
                    data-lpignore="true"
                  />
                </div>
                {error && !error.field && (
                  <p className="ob-error ob-error--form" role="alert">
                    {error.message}
                  </p>
                )}
                <div className="ob-actions">
                  {canGoBack ? (
                    <button type="button" className="ob-back" onClick={back}>
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {showSubmit ? (
                    <button type="submit" className="ob-next" aria-disabled={busy}>
                      {busy ? "Saving…" : index === total - 1 ? "Send" : step === "contact" ? "Send my application" : "Continue"}
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
              </m.form>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Done({ name, cat, warm, optin }: { name: string; cat: string; warm: boolean; optin: boolean }) {
  const first = name.trim().split(/\s+/)[0];
  const by = <span className="ob-nowrap">{formatReplyBy(replyBy(new Date()))}</span>;
  const hello = `Hi, I just applied. Name: ${name.trim()}.${cat ? ` I sell: ${cat}.` : ""}`;
  return (
    <div className="ob-done-inner" role="status">
      <h1 tabIndex={-1} className="ob-pop" aria-label={first ? `Application sent, ${first}.` : "Application sent."}>
        {(first ? ["Application", "sent,", `${first}.`] : ["Application", "sent."]).map((w, i, all) => (
          <span
            key={i}
            aria-hidden="true"
            className={first && i === all.length - 1 ? "w box" : "w"}
            style={{ animationDelay: `${0.15 + i * 0.24}s` }}
          >
            {w}
          </span>
        ))}
      </h1>
      <p className="ob-done-lead">
        {warm ? (
          <>We read every application ourselves. You&rsquo;ll hear from us on WhatsApp by {by}.</>
        ) : (
          <>
            Thanks for the honest answer. You&rsquo;ll still hear from us by {by}
            {optin ? ", and again when a new group opens" : ""}. No pressure.
          </>
        )}
      </p>
      {WA_DIGITS && (
        <div className="ob-done-wa">
          <a className="ob-next" href={`https://wa.me/${WA_DIGITS}?text=${encodeURIComponent(hello)}`} target="_blank" rel="noopener">
            Say hi on WhatsApp now
          </a>
          <p className="ob-help">
            Save this number, <span className="ob-nowrap">{WA}</span>. It&rsquo;s the only one we message from.
          </p>
        </div>
      )}
      <ol className="ob-next-steps">
        {!WA_DIGITS && (
          <li>
            <span>
              <b>Watch your WhatsApp.</b> That&rsquo;s where we&rsquo;ll reply.
            </span>
          </li>
        )}
        <li>
          <span>
            <b>Money only after we pick you.</b> We never ask for payment before that, and always with a PDF invoice.
          </span>
        </li>
        {warm && (
          <li>
            <span>
              <b>If we pick you:</b> a short setup call. Then you sign the agreement and pay a Rp 1,000,000 refundable deposit. About 7 days
              after you send your photos and voice recording, you get a test clip of you. Not right? We redo it once, or say no and the
              deposit comes back.
            </span>
          </li>
        )}
      </ol>
    </div>
  );
}
