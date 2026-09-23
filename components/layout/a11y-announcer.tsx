"use client";

import { useEffect, useState } from "react";
import { subscribeAnnouncer, type Announcement } from "@/lib/a11y/announcer";

/**
 * Screen reader live region announcer.
 * Renders visually hidden regions with role="status" and role="alert"
 * for accessibility compliant announcements (WCAG 2.1 AA 4.1.3).
 */
export function A11yAnnouncer() {
  const [politeText, setPoliteText] = useState("");
  const [assertiveText, setAssertiveText] = useState("");

  useEffect(() => {
    return subscribeAnnouncer((announcement: Announcement) => {
      if (announcement.priority === "assertive") {
        setAssertiveText("");
        setTimeout(() => setAssertiveText(announcement.message), 50);
      } else {
        setPoliteText("");
        setTimeout(() => setPoliteText(announcement.message), 50);
      }
    });
  }, []);

  return (
    <div className="sr-only" aria-hidden="false">
      {/* Polite live region for standard notifications */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {politeText}
      </div>

      {/* Assertive live region for critical alerts */}
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {assertiveText}
      </div>
    </div>
  );
}
