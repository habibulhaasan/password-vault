/**
 * Screen reader live announcer utility.
 * Allows components and hooks to dispatch accessible announcements
 * without rendering visual UI elements or introducing external dependencies.
 */

export type AnnouncePriority = "polite" | "assertive";

export interface Announcement {
  id: number;
  message: string;
  priority: AnnouncePriority;
}

type AnnounceListener = (announcement: Announcement) => void;

let listeners: AnnounceListener[] = [];
let nextId = 1;

/**
 * Dispatches an accessible message to screen reader live regions.
 *
 * @param message The text announcement for assistive technologies
 * @param priority "polite" (default, waits for current speech to finish) or "assertive" (interrupts)
 */
export function announce(
  message: string,
  priority: AnnouncePriority = "polite"
): void {
  if (!message || typeof window === "undefined") return;

  const item: Announcement = {
    id: nextId++,
    message: message.trim(),
    priority,
  };

  listeners.forEach((listener) => {
    try {
      listener(item);
    } catch {
      // Prevent listener errors from breaking app flow
    }
  });
}

/**
 * Subscribes a listener to live announcements.
 * Returns an unsubscribe cleanup function.
 */
export function subscribeAnnouncer(listener: AnnounceListener): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

