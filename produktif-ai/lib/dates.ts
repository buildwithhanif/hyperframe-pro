// "You'll hear from us by …": two working days after a moment, counted in
// Jakarta time and skipping Saturdays and Sundays. Public holidays aren't
// handled, so the promise errs a day early around Lebaran.
export function replyBy(from: Date, workingDays = 2): Date {
  const JKT = 7 * 60 * 60 * 1000;
  const local = new Date(from.getTime() + JKT);
  const d = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()));
  let left = workingDays;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) left--;
  }
  return d;
}

// "Tuesday, 14 October"
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function formatReplyBy(d: Date): string {
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}
