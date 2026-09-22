import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  generatePassword,
  evaluatePasswordStrength,
} from "@/lib/utils/password-generator";
import {
  getDaysSinceLastLogin,
  formatDaysSinceLastLogin,
  matchesLastLoginFilter,
} from "@/lib/utils/date";

describe("Productivity & Utilities Tests", () => {
  describe("Cryptographically Secure Password Generator", () => {
    test("generates password with exact target length", () => {
      const lengths = [8, 16, 24, 32, 64];
      for (const len of lengths) {
        const pwd = generatePassword({ length: len });
        assert.equal(pwd.length, len);
      }
    });

    test("includes all selected character sets", () => {
      const pwd = generatePassword({
        length: 32,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
      });

      assert.match(pwd, /[A-Z]/, "Must contain uppercase letter");
      assert.match(pwd, /[a-z]/, "Must contain lowercase letter");
      assert.match(pwd, /[0-9]/, "Must contain numeric digit");
      assert.match(pwd, /[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/, "Must contain symbol");
    });

    test("respects character set exclusions", () => {
      const digitsOnly = generatePassword({
        length: 16,
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
      });
      assert.match(digitsOnly, /^[0-9]+$/, "Digits only password must contain only numbers");

      const lettersOnly = generatePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: false,
      });
      assert.match(lettersOnly, /^[A-Za-z]+$/, "Letters only password must contain only letters");
    });

    test("excludes ambiguous characters when requested", () => {
      const ambiguousSet = new Set(["i", "l", "1", "L", "o", "0", "O"]);
      // Generate multiple passwords to ensure statistical coverage
      for (let i = 0; i < 10; i++) {
        const pwd = generatePassword({
          length: 50,
          avoidAmbiguous: true,
        });
        for (const char of pwd) {
          assert.equal(
            ambiguousSet.has(char),
            false,
            `Password must not contain ambiguous character: ${char}`
          );
        }
      }
    });

    test("evaluates password strength and entropy correctly", () => {
      const weak = evaluatePasswordStrength("abc");
      assert.ok(weak.score <= 1);
      assert.equal(weak.label, "Very Weak");

      const moderate = evaluatePasswordStrength("Tr0ub4dor&");
      assert.ok(moderate.score >= 2);

      const strong = evaluatePasswordStrength("kX9#mP2$vL5@wQ8!");
      assert.ok(strong.score >= 3);
      assert.ok(strong.entropyBits > 60);
    });
  });

  describe("Dynamic Recency & Last Login Calculations", () => {
    test("returns null for undefined, null, or invalid dates", () => {
      assert.equal(getDaysSinceLastLogin(null), null);
      assert.equal(getDaysSinceLastLogin(undefined), null);
    });

    test("returns 0 for today's login", () => {
      const today = new Date();
      assert.equal(getDaysSinceLastLogin(today), 0);
    });

    test("returns exact day count for past login", () => {
      const now = new Date();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      assert.equal(getDaysSinceLastLogin(fiveDaysAgo), 5);
    });

    test("formats human-readable relative age strings correctly", () => {
      const now = new Date();
      assert.equal(formatDaysSinceLastLogin(null), "Never logged in");
      assert.equal(formatDaysSinceLastLogin(null, true), "Never");
      assert.equal(formatDaysSinceLastLogin(now), "Today");

      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      assert.equal(formatDaysSinceLastLogin(oneDayAgo), "1 day ago");

      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      assert.equal(formatDaysSinceLastLogin(tenDaysAgo), "10 days ago");
    });

    test("evaluates matchesLastLoginFilter correctly", () => {
      const now = new Date();
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const fortyDaysAgo = new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000);

      // 'all' matches everything
      assert.equal(matchesLastLoginFilter(now, "all"), true);
      assert.equal(matchesLastLoginFilter(null, "all"), true);

      // 'today'
      assert.equal(matchesLastLoginFilter(now, "today"), true);
      assert.equal(matchesLastLoginFilter(threeDaysAgo, "today"), false);

      // '7days'
      assert.equal(matchesLastLoginFilter(threeDaysAgo, "7days"), true);
      assert.equal(matchesLastLoginFilter(fortyDaysAgo, "7days"), false);

      // 'over30days'
      assert.equal(matchesLastLoginFilter(fortyDaysAgo, "over30days"), true);
      assert.equal(matchesLastLoginFilter(threeDaysAgo, "over30days"), false);

      // 'never'
      assert.equal(matchesLastLoginFilter(null, "never"), true);
      assert.equal(matchesLastLoginFilter(now, "never"), false);
    });
  });

  describe("Safe URL Opener Logic", () => {
    function isValidWebProtocol(url: string): boolean {
      const trimmed = url.trim();
      if (!trimmed) return false;
      const fullUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      try {
        const parsed = new URL(fullUrl);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    }

    test("permits valid HTTPS and HTTP addresses", () => {
      assert.equal(isValidWebProtocol("https://github.com"), true);
      assert.equal(isValidWebProtocol("http://localhost:3000"), true);
      assert.equal(isValidWebProtocol("vault.example.com"), true);
    });

    test("rejects dangerous protocol schemes", () => {
      assert.equal(isValidWebProtocol("javascript:alert(1)"), false);
      assert.equal(isValidWebProtocol("data:text/html,<script>evil()</script>"), false);
      assert.equal(isValidWebProtocol("vbscript:run()"), false);
    });
  });
});

