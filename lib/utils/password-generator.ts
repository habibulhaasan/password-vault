/**
 * Cryptographically secure password generator utility.
 *
 * Requirements:
 * - Never uses Math.random().
 * - Uses Web Crypto API (crypto.getRandomValues) with rejection sampling to eliminate modulo bias.
 * - Supports length, uppercase, lowercase, numbers, symbols, and ambiguous character filtering.
 * - Guarantees representation of all selected character sets.
 * - Shuffles result with a cryptographically secure Fisher-Yates shuffle.
 * - Calculates Shannon entropy in bits and evaluates password strength.
 */

export interface PasswordGeneratorOptions {
  /** Length of the generated password (8 - 64 recommended, clamped between 4 and 128) */
  length: number;
  /** Include uppercase letters A-Z */
  uppercase: boolean;
  /** Include lowercase letters a-z */
  lowercase: boolean;
  /** Include digits 0-9 */
  numbers: boolean;
  /** Include symbols !@#$%^&*()_+-=[]{}|;:,.<>? */
  symbols: boolean;
  /** Exclude ambiguous characters (i, l, 1, L, o, 0, O) */
  avoidAmbiguous?: boolean;
}

export interface PasswordStrength {
  /** Score from 0 to 4 */
  score: number;
  /** Calculated entropy in bits */
  entropyBits: number;
  /** Descriptive strength label */
  label: "Very Weak" | "Weak" | "Fair" | "Strong" | "Very Strong";
  /** Tailwind color classes for badges and progress meters */
  color: string;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS_CHARS = new Set(["i", "l", "1", "L", "o", "0", "O"]);

export const DEFAULT_GENERATOR_OPTIONS: PasswordGeneratorOptions = {
  length: 20,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: false,
};

/**
 * Generates an unbiased random integer in the range [0, max - 1]
 * using the Web Crypto API and rejection sampling.
 */
export function getSecureRandomInt(max: number): number {
  if (max <= 1) return 0;

  const cryptoObj = typeof window !== "undefined" ? window.crypto : globalThis.crypto;
  if (!cryptoObj || !cryptoObj.getRandomValues) {
    throw new Error("Web Crypto API is required for cryptographically secure random generation.");
  }

  const maxUint32 = 0xffffffff;
  const limit = maxUint32 - (maxUint32 % max);
  const buffer = new Uint32Array(1);

  let value: number;
  do {
    cryptoObj.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);

  return value % max;
}

/**
 * Fisher-Yates array shuffle utilizing cryptographically secure random integers.
 */
export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = getSecureRandomInt(i + 1);
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Generates a cryptographically secure random password based on the supplied options.
 */
export function generatePassword(options?: Partial<PasswordGeneratorOptions>): string {
  const opts: PasswordGeneratorOptions = {
    ...DEFAULT_GENERATOR_OPTIONS,
    ...options,
  };

  let upper = UPPERCASE;
  let lower = LOWERCASE;
  let nums = NUMBERS;
  let syms = SYMBOLS;

  if (opts.avoidAmbiguous) {
    upper = upper.split("").filter((c) => !AMBIGUOUS_CHARS.has(c)).join("");
    lower = lower.split("").filter((c) => !AMBIGUOUS_CHARS.has(c)).join("");
    nums = nums.split("").filter((c) => !AMBIGUOUS_CHARS.has(c)).join("");
    syms = syms.split("").filter((c) => !AMBIGUOUS_CHARS.has(c)).join("");
  }

  const activeSets: string[] = [];
  if (opts.uppercase && upper.length > 0) activeSets.push(upper);
  if (opts.lowercase && lower.length > 0) activeSets.push(lower);
  if (opts.numbers && nums.length > 0) activeSets.push(nums);
  if (opts.symbols && syms.length > 0) activeSets.push(syms);

  // Fallback if no sets selected: use standard alphanumeric
  if (activeSets.length === 0) {
    activeSets.push(lower, upper, nums);
  }

  const combinedPool = activeSets.join("");
  const targetLength = Math.max(4, Math.min(128, opts.length || 20));
  const characters: string[] = [];

  // Guarantee at least 1 character from each chosen character set
  for (const set of activeSets) {
    if (characters.length < targetLength) {
      const idx = getSecureRandomInt(set.length);
      characters.push(set[idx]);
    }
  }

  // Fill remaining characters uniformly from the combined pool
  while (characters.length < targetLength) {
    const idx = getSecureRandomInt(combinedPool.length);
    characters.push(combinedPool[idx]);
  }

  // Cryptographically shuffle the entire array to prevent predictable character positions
  return secureShuffle(characters).join("");
}

/**
 * Calculates theoretical entropy in bits: E = L * log2(N)
 */
export function calculatePasswordEntropy(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  let hasLower = false;
  let hasUpper = false;
  let hasDigit = false;
  let hasSymbol = false;

  for (const char of password) {
    if (/[a-z]/.test(char)) hasLower = true;
    else if (/[A-Z]/.test(char)) hasUpper = true;
    else if (/[0-9]/.test(char)) hasDigit = true;
    else hasSymbol = true;
  }

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 32;

  if (poolSize === 0) return 0;

  const entropy = password.length * Math.log2(poolSize);
  return Math.round(entropy);
}

/**
 * Evaluates password strength and assigns a score, label, and UI color.
 */
export function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length === 0) {
    return {
      score: 0,
      entropyBits: 0,
      label: "Very Weak",
      color: "bg-muted text-muted-foreground",
    };
  }

  const entropy = calculatePasswordEntropy(password);
  const length = password.length;

  if (length < 8 || entropy < 36) {
    return {
      score: 1,
      entropyBits: entropy,
      label: "Weak",
      color: "bg-destructive text-destructive",
    };
  }

  if (length < 12 || entropy < 60) {
    return {
      score: 2,
      entropyBits: entropy,
      label: "Fair",
      color: "bg-amber-500 text-amber-500",
    };
  }

  if (length < 16 || entropy < 85) {
    return {
      score: 3,
      entropyBits: entropy,
      label: "Strong",
      color: "bg-primary text-primary",
    };
  }

  return {
    score: 4,
    entropyBits: entropy,
    label: "Very Strong",
    color: "bg-emerald-500 text-emerald-500",
  };
}
