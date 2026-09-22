/**
 * Safe error sanitization utility
 * Ensures zero leakage of encryption keys, tokens, ciphertexts, salts, or stack traces
 * in accordance with AI_AGENT_GUIDE.md Section 27.
 */

// Regex patterns to identify potential secrets or sensitive data
const BASE64_OR_HEX_SECRET_REGEX = /\b[A-Fa-f0-9]{32,}\b|\b[A-Za-z0-9+/=]{44,}\b/g;
const FIREBASE_API_KEY_REGEX = /AIza[0-9A-Za-z-_]{35}/g;
const JWT_TOKEN_REGEX = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

/**
 * Sanitizes any raw error into a human-readable, safe, non-sensitive string.
 */
export function sanitizeErrorMessage(
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  let rawMessage = "";

  if (typeof error === "string") {
    rawMessage = error;
  } else if (error instanceof Error) {
    rawMessage = error.message;
  } else if (typeof error === "object" && error !== null && "message" in error) {
    rawMessage = String((error as { message: unknown }).message);
  } else {
    return fallbackMessage;
  }

  // Handle known Web Crypto exceptions
  if (
    rawMessage.includes("OperationError") ||
    rawMessage.toLowerCase().includes("tag mismatch") ||
    rawMessage.toLowerCase().includes("cipher") ||
    rawMessage.toLowerCase().includes("decrypt")
  ) {
    return "Failed to decrypt record. Please ensure your vault is unlocked with the correct master password.";
  }

  // Handle known Firebase auth error codes
  if (rawMessage.includes("auth/invalid-credential") || rawMessage.includes("auth/wrong-password")) {
    return "Invalid email or password. Please verify your credentials.";
  }
  if (rawMessage.includes("auth/user-not-found")) {
    return "No account exists with this email address.";
  }
  if (rawMessage.includes("auth/email-already-in-use")) {
    return "An account with this email address already exists.";
  }
  if (rawMessage.includes("auth/too-many-requests")) {
    return "Too many unsuccessful attempts. Please wait a few moments before trying again.";
  }
  if (rawMessage.includes("auth/network-request-failed") || rawMessage.toLowerCase().includes("network error")) {
    return "Network error. Please check your internet connection and try again.";
  }
  if (rawMessage.includes("permission-denied")) {
    return "Access denied. You do not have permission to perform this action.";
  }
  if (rawMessage.includes("unavailable")) {
    return "Service temporarily unavailable. Please try again shortly.";
  }

  // Scrub any accidental secret patterns (hex keys, base64 payloads, api keys, JWTs)
  const sanitized = rawMessage
    .replace(FIREBASE_API_KEY_REGEX, "[REDACTED_KEY]")
    .replace(JWT_TOKEN_REGEX, "[REDACTED_TOKEN]")
    .replace(BASE64_OR_HEX_SECRET_REGEX, "[REDACTED_DATA]");

  // Prevent file system path or stack trace leakage in UI
  if (sanitized.includes("    at ") || sanitized.includes("\n") || sanitized.includes("\\") || sanitized.includes("/Users/")) {
    return fallbackMessage;
  }

  // If sanitized string became too empty or awkward, return fallback
  if (sanitized.trim().length === 0 || sanitized.length > 200) {
    return fallbackMessage;
  }

  return sanitized;
}

