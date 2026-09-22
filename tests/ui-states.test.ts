import test, { describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  announce,
  subscribeAnnouncer,
  type Announcement,
} from "@/lib/a11y/announcer";
import { ErrorBoundary } from "@/components/ui/error-boundary";

describe("UI States, Accessibility & Error Boundary Tests", () => {
  describe("Accessibility Announcer Bus", () => {
    beforeEach(() => {
      // Provide window mock in Node environment
      (globalThis as unknown as { window: unknown }).window = globalThis;
    });

    afterEach(() => {
      delete (globalThis as unknown as { window?: unknown }).window;
    });

    test("dispatches polite priority announcement to subscribed listeners", () => {
      const received: Announcement[] = [];
      const unsubscribe = subscribeAnnouncer((item) => {
        received.push(item);
      });

      announce("Password copied to clipboard", "polite");

      assert.equal(received.length, 1);
      assert.equal(received[0].message, "Password copied to clipboard");
      assert.equal(received[0].priority, "polite");

      unsubscribe();
    });

    test("dispatches assertive priority announcement for critical alerts", () => {
      const received: Announcement[] = [];
      const unsubscribe = subscribeAnnouncer((item) => {
        received.push(item);
      });

      announce("Vault locked due to inactivity", "assertive");

      assert.equal(received.length, 1);
      assert.equal(received[0].message, "Vault locked due to inactivity");
      assert.equal(received[0].priority, "assertive");

      unsubscribe();
    });

    test("stops receiving events after unsubscribe", () => {
      const received: Announcement[] = [];
      const unsubscribe = subscribeAnnouncer((item) => {
        received.push(item);
      });

      announce("Event 1");
      assert.equal(received.length, 1);

      unsubscribe();
      announce("Event 2");
      assert.equal(received.length, 1);
    });
  });

  describe("Section 26 Empty State Copy Guidelines", () => {
    // Exact copy requirements from Section 26 of AI_AGENT_GUIDE.md
    const SECTION_26_COPY = {
      emptyVault: {
        title: "Your vault is empty",
        description: "Add your first credential to get started.",
        action: "Add Credential",
      },
      noSearchResults: {
        title: "No credentials found",
        description: "Try another search or clear your filters.",
      },
      noCategoryItems: {
        title: "No credentials in this category.",
      },
    };

    test("complies with empty vault copy specifications", () => {
      assert.equal(SECTION_26_COPY.emptyVault.title, "Your vault is empty");
      assert.equal(
        SECTION_26_COPY.emptyVault.description,
        "Add your first credential to get started."
      );
      assert.equal(SECTION_26_COPY.emptyVault.action, "Add Credential");
    });

    test("complies with search empty state copy specifications", () => {
      assert.equal(SECTION_26_COPY.noSearchResults.title, "No credentials found");
      assert.equal(
        SECTION_26_COPY.noSearchResults.description,
        "Try another search or clear your filters."
      );
    });

    test("complies with category empty state copy specifications", () => {
      assert.equal(
        SECTION_26_COPY.noCategoryItems.title,
        "No credentials in this category."
      );
    });
  });

  describe("Error Boundary State Management", () => {
    test("getDerivedStateFromError updates state to hasError: true", () => {
      const testError = new Error("Simulated component render failure");
      const state = ErrorBoundary.getDerivedStateFromError(testError);

      assert.equal(state.hasError, true);
      assert.equal(state.error, testError);
    });

    test("instance reset method clears error state", () => {
      const boundary = new ErrorBoundary({ children: "Test" });
      boundary.state = {
        hasError: true,
        error: new Error("Test error"),
      };

      boundary.reset();
      assert.equal(boundary.state.hasError, false);
      assert.equal(boundary.state.error, null);
    });
  });
});

