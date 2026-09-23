"use client";

/**
 * Accessible Skip to Content anchor.
 * Hidden visually by default, becomes visible when keyboard focus lands on it.
 * Shifts focus directly to #main-content, allowing keyboard users to bypass
 * repetitive navigation bars.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
    >
      Skip to main content
    </a>
  );
}
