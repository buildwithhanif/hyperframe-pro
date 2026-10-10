// Option lists and the consent sentence, with no imports, so the Get Started
// page can use them without pulling crypto or zod into the browser bundle.

// Values stay stable (they land in the sheet); labels are what people see.
export const PLATFORMS = [
  { value: "instagram", label: "Instagram" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube", label: "YouTube" },
  { value: "x", label: "X" },
  { value: "threads", label: "Threads" },
  { value: "other", label: "Other" },
] as const;

export const FOLLOWERS = [
  { value: "under-10k", label: "Under 10K" },
  { value: "10k-50k", label: "10K to 50K" },
  { value: "50k-250k", label: "50K to 250K" },
  { value: "250k-1m", label: "250K to 1M" },
  { value: "1m-plus", label: "1M or more" },
] as const;

export const POSTING = [
  { value: "rarely", label: "Rarely" },
  { value: "weekly", label: "1 to 2 a week" },
  { value: "most-days", label: "3 to 6 a week" },
  { value: "daily", label: "Every day" },
] as const;

export const GOALS = [
  { value: "time", label: "Get my time back" },
  { value: "reach", label: "Grow my reach" },
  { value: "sales", label: "Turn views into sales" },
  { value: "consistency", label: "Never miss a day" },
] as const;

export const LANGUAGES = [
  { value: "id", label: "Bahasa Indonesia" },
  { value: "en", label: "English" },
  { value: "both", label: "Both" },
] as const;

export const STARTS = [
  { value: "this-month", label: "This month" },
  { value: "1-3-months", label: "In 1 to 3 months" },
  { value: "looking", label: "Just looking" },
] as const;

export const BUDGETS = [
  { value: "yes", label: "Yes, that works" },
  { value: "not-yet", label: "Not right now" },
] as const;

// The consent sentence shown next to the checkbox. Stored with each signup so
// the sheet records exactly what the person agreed to.
export const CONSENT_TEXT =
  "I agree to the privacy policy, and to produktif.ai contacting me about my application and future cohorts by email, or by WhatsApp if I added a number. I can opt out anytime.";
