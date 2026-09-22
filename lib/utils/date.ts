import type { Timestamp } from "firebase/firestore";

/**
 * Filter options for Last-Login recency conforming to Section 11 of AI_AGENT_GUIDE.md.
 */
export type LastLoginFilter =
  | "all"
  | "today"
  | "7days"
  | "30days"
  | "over30days"
  | "never";

export const LAST_LOGIN_FILTER_LABELS: Record<LastLoginFilter, string> = {
  all: "All Logins",
  today: "Today",
  "7days": "Within 7 days",
  "30days": "Within 30 days",
  over30days: "More than 30 days",
  never: "Never logged in",
};

/**
 * Calculates raw integer day difference between today and the login date.
 * Returns null if no date is provided.
 */
export function getDaysSinceLastLogin(
  dateInput?: Timestamp | Date | null
): number | null {
  if (!dateInput) return null;

  const date =
    typeof (dateInput as Timestamp).toDate === "function"
      ? (dateInput as Timestamp).toDate()
      : new Date(dateInput as Date);

  if (isNaN(date.getTime())) return null;

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
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calculates a human-readable string representing "days since last login"
 * dynamically from a Firestore Timestamp or JavaScript Date.
 *
 * Follows Section 8 of AI_AGENT_GUIDE.md:
 * - Never logged in -> "Never logged in" (or "Never" if compact)
 * - Logged in today -> "Today"
 * - Logged in yesterday -> "1 day ago"
 * - Logged in N days ago -> "N days ago"
 */
export function formatDaysSinceLastLogin(
  dateInput?: Timestamp | Date | null,
  compact: boolean = false
): string {
  const days = getDaysSinceLastLogin(dateInput);

  if (days === null) {
    return compact ? "Never" : "Never logged in";
  }

  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months <= 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(days / 365);
  return years <= 1 ? "1 year ago" : `${years} years ago`;
}

/**
 * Evaluates whether a credential's login date matches the active LastLoginFilter.
 */
export function matchesLastLoginFilter(
  dateInput: Timestamp | Date | null | undefined,
  filter: LastLoginFilter
): boolean {
  if (filter === "all") return true;

  const days = getDaysSinceLastLogin(dateInput);

  if (filter === "never") {
    return days === null;
  }

  if (days === null) {
    return false;
  }

  switch (filter) {
    case "today":
      return days === 0;
    case "7days":
      return days <= 7;
    case "30days":
      return days <= 30;
    case "over30days":
      return days > 30;
    default:
      return true;
  }
}
