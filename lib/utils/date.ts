import type { Timestamp } from "firebase/firestore";

/**
 * Calculates a human-readable string representing "days since last login"
 * dynamically from a Firestore Timestamp or JavaScript Date.
 *
 * Follows Section 8 of AI_AGENT_GUIDE.md:
 * - Never logged in -> "Never"
 * - Logged in today -> "Today"
 * - Logged in yesterday -> "Yesterday"
 * - Logged in N days ago -> "N days ago"
 */
export function formatDaysSinceLastLogin(
  dateInput?: Timestamp | Date | null
): string {
  if (!dateInput) return "Never";

  const date =
    typeof (dateInput as Timestamp).toDate === "function"
      ? (dateInput as Timestamp).toDate()
      : new Date(dateInput as Date);

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime();
  const dateStart = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();

  const diffMs = todayStart - dateStart;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 30) return `${diffDays} days ago`;
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return months <= 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diffDays / 365);
  return years <= 1 ? "1 year ago" : `${years} years ago`;
}
