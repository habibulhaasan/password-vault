import test, { describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";

describe("Security & Zero-Knowledge Invariant Tests", () => {
  describe("Secret & Token Scrubbing", () => {
    test("redacts Google/Firebase API keys from error outputs", () => {
      const leaked = "Error connecting to service with key AIzaSyD98abc1234567890abcdefghijklmno999.";
      const sanitized = sanitizeErrorMessage(leaked);
      assert.equal(sanitized.includes("AIzaSyD98abc"), false);
      assert.ok(sanitized.includes("[REDACTED_KEY]"));
    });

    test("redacts JWT tokens from error messages", () => {
      const jwt =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4ifQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      const leaked = `Failed to process authorization token: ${jwt}`;
      const sanitized = sanitizeErrorMessage(leaked);
      assert.equal(sanitized.includes("eyJhbGci"), false);
      assert.ok(sanitized.includes("[REDACTED_TOKEN]"));
    });

    test("redacts raw hexadecimal keys and hashes (32+ hex chars)", () => {
      const hexKey = "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
      const leaked = `Connection failure at token ${hexKey}`;
      const sanitized = sanitizeErrorMessage(leaked);
      assert.equal(sanitized.includes(hexKey), false);
      assert.ok(sanitized.includes("[REDACTED_DATA]"));
    });

    test("redacts stack traces and returns generic fallback", () => {
      const stackTrace =
        "Error: Invalid state\n    at Object.run (/Users/user/vault/util.ts:42:15)\n    at processTicksAndRejections";
      const sanitized = sanitizeErrorMessage(stackTrace);
      assert.equal(sanitized.includes("Object.run"), false);
      assert.equal(sanitized.includes("/Users/user"), false);
      assert.equal(sanitized, "An unexpected error occurred. Please try again.");
    });

    test("redacts Windows and Unix file paths", () => {
      const winPath = "C:\\Users\\habib\\Documents\\vault\\secret.ts:15";
      assert.equal(
        sanitizeErrorMessage(winPath),
        "An unexpected error occurred. Please try again."
      );
    });

    test("transforms Web Crypto OperationError to helpful non-leaking message", () => {
      const webCryptoErr = "OperationError: The operation failed for an operation-specific reason";
      const sanitized = sanitizeErrorMessage(webCryptoErr);
      assert.match(sanitized, /Failed to decrypt record/i);
      assert.match(sanitized, /master password/i);
    });
  });

  describe("Firestore Security Rules Static Inspection", () => {
    const rulesPath = path.resolve(process.cwd(), "firestore.rules");
    const rulesContent = fs.readFileSync(rulesPath, "utf-8");

    test("enforces default deny for unmatched documents", () => {
      assert.match(
        rulesContent,
        /match\s+\/\{document=\*\*\}\s*\{\s*allow\s+read,\s*write:\s*if\s+false;\s*\}/
      );
    });

    test("defines strict isOwner function matching request.auth.uid == userId", () => {
      assert.match(
        rulesContent,
        /function\s+isOwner\(userId\)\s*\{\s*return\s+isAuthenticated\(\)\s*&&\s*request\.auth\.uid\s*==\s*userId;\s*\}/
      );
    });

    test("restricts /users/{userId} hierarchy to authenticated owner only", () => {
      assert.match(rulesContent, /match\s+\/users\/\{userId\}\s*\{/);
      assert.match(rulesContent, /allow\s+read,\s*write:\s*if\s+isOwner\(userId\);/);
    });

    test("requires encrypted fields on credentials collection", () => {
      assert.match(rulesContent, /isNonEmptyString\(request\.resource\.data\.encryptedUsername,/);
      assert.match(rulesContent, /isNonEmptyString\(request\.resource\.data\.encryptedPassword,/);
    });

    test("prevents tampering with credential createdAt timestamp on update", () => {
      assert.match(
        rulesContent,
        /request\.resource\.data\.createdAt\s*==\s*resource\.data\.createdAt/
      );
    });
  });
});

