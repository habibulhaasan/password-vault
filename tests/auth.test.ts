import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
} from "@/lib/validations/auth";
import { sanitizeErrorMessage } from "@/lib/utils/error-sanitizer";

describe("Authentication Validation & Security Tests", () => {
  describe("Registration Schema", () => {
    test("accepts valid registration payload", () => {
      const result = registerSchema.safeParse({
        email: "user@vault.io",
        password: "StrongMasterPassword123!",
        confirmPassword: "StrongMasterPassword123!",
      });
      assert.equal(result.success, true);
    });

    test("rejects invalid email address format", () => {
      const result = registerSchema.safeParse({
        email: "not-an-email",
        password: "StrongMasterPassword123!",
        confirmPassword: "StrongMasterPassword123!",
      });
      assert.equal(result.success, false);
      if (!result.success) {
        assert.match(result.error.issues[0].message, /valid email/i);
      }
    });

    test("rejects passwords shorter than 8 characters", () => {
      const result = registerSchema.safeParse({
        email: "user@vault.io",
        password: "short",
        confirmPassword: "short",
      });
      assert.equal(result.success, false);
      if (!result.success) {
        assert.match(result.error.issues[0].message, /at least 8 characters/i);
      }
    });

    test("rejects mismatched password and confirmPassword", () => {
      const result = registerSchema.safeParse({
        email: "user@vault.io",
        password: "StrongMasterPassword123!",
        confirmPassword: "DifferentPassword123!",
      });
      assert.equal(result.success, false);
      if (!result.success) {
        assert.match(result.error.issues[0].message, /passwords do not match/i);
      }
    });
  });

  describe("Login Schema", () => {
    test("accepts valid login payload", () => {
      const result = loginSchema.safeParse({
        email: "user@vault.io",
        password: "AnyPassword123",
      });
      assert.equal(result.success, true);
    });

    test("rejects empty password", () => {
      const result = loginSchema.safeParse({
        email: "user@vault.io",
        password: "",
      });
      assert.equal(result.success, false);
    });

    test("rejects invalid email syntax", () => {
      const result = loginSchema.safeParse({
        email: "invalid@",
        password: "Password123",
      });
      assert.equal(result.success, false);
    });
  });

  describe("Forgot Password Schema", () => {
    test("accepts valid email for recovery", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "recovery@vault.io",
      });
      assert.equal(result.success, true);
    });

    test("rejects empty email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "",
      });
      assert.equal(result.success, false);
    });
  });

  describe("Authentication Error Sanitization", () => {
    test("maps invalid credentials to clear human-readable message", () => {
      const res = sanitizeErrorMessage("Firebase: Error (auth/invalid-credential).");
      assert.equal(res, "Invalid email or password. Please verify your credentials.");
    });

    test("maps wrong password to clear human-readable message", () => {
      const res = sanitizeErrorMessage("Firebase: Error (auth/wrong-password).");
      assert.equal(res, "Invalid email or password. Please verify your credentials.");
    });

    test("maps user not found to friendly message", () => {
      const res = sanitizeErrorMessage("Firebase: Error (auth/user-not-found).");
      assert.equal(res, "No account exists with this email address.");
    });

    test("maps email already in use to clear message", () => {
      const res = sanitizeErrorMessage("Firebase: Error (auth/email-already-in-use).");
      assert.equal(res, "An account with this email address already exists.");
    });

    test("maps rate limiting / too many requests to backoff message", () => {
      const res = sanitizeErrorMessage("Firebase: Access to this account has been temporarily disabled (auth/too-many-requests).");
      assert.equal(res, "Too many unsuccessful attempts. Please wait a few moments before trying again.");
    });

    test("maps network request failed to connection message", () => {
      const res = sanitizeErrorMessage("Firebase: A network error has occurred (auth/network-request-failed).");
      assert.equal(res, "Network error. Please check your internet connection and try again.");
    });
  });
});

