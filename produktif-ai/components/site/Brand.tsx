// The produktif.ai wordmark, set in the site face (Archivo, condensed and
// heavy) so the name and the headlines read as one voice.
export function Wordmark({ className, title = "produktif.ai" }: { className?: string; title?: string | null }) {
  return (
    <span className={`wm ${className ?? ""}`} {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
      produktif.ai
    </span>
  );
}
