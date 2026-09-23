"use client";

import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const safeMessage = sanitizeErrorMessage(error);

  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6 font-sans antialiased">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center space-y-5 shadow-2xl">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight">
              Application Fatal Error
            </h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {safeMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex h-9 items-center justify-center rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-200 cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
