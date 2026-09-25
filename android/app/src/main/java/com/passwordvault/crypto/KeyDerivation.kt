package com.passwordvault.crypto

import android.util.Base64
import javax.crypto.SecretKey
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

/**
 * Key derivation utilities using PBKDF2-SHA256.
 * Mirrors the web app's crypto/key-derivation.ts implementation.
 */
object KeyDerivation {

    const val DEFAULT_PBKDF2_ITERATIONS = 600_000
    const val DEFAULT_SALT_LENGTH = 16 // 128 bits
    const val KEY_LENGTH_BITS = 256

    /**
     * Generates a cryptographically secure random salt.
     */
    fun generateSalt(length: Int = DEFAULT_SALT_LENGTH): ByteArray {
        val salt = ByteArray(length)
        java.security.SecureRandom().nextBytes(salt)
        return salt
    }

    /**
     * Converts a byte array to a standard Base64 string.
     */
    fun bytesToBase64(bytes: ByteArray): String {
        return Base64.encodeToString(bytes, Base64.NO_WRAP)
    }

    /**
     * Converts a Base64 string back to a byte array.
     */
    fun base64ToBytes(base64: String): ByteArray {
        return Base64.decode(base64, Base64.NO_WRAP)
    }

    /**
     * Serializes a salt to a Base64 string for storage.
     */
    fun saltToBase64(salt: ByteArray): String = bytesToBase64(salt)

    /**
     * Parses a stored Base64 salt back to a byte array.
     */
    fun base64ToSalt(base64: String): ByteArray = base64ToBytes(base64)

    /**
     * Derives a 256-bit AES-GCM SecretKey from a master password and salt using PBKDF2-SHA256.
     *
     * Security guarantees:
     * - 600,000 iterations (OWASP 2024 recommendation)
     * - 256-bit key length for AES-256
     * - Key is not directly extractable as raw bytes in production (use Android Keystore for hardware-backed)
     */
    fun deriveVaultKey(
        masterPassword: String,
        salt: ByteArray,
        iterations: Int = DEFAULT_PBKDF2_ITERATIONS
    ): SecretKey {
        require(masterPassword.isNotBlank()) { "Master password cannot be empty" }
        require(salt.isNotEmpty()) { "Salt cannot be empty" }

        val spec = PBEKeySpec(
            masterPassword.toCharArray(),
            salt,
            iterations,
            KEY_LENGTH_BITS
        )

        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val keyBytes = factory.generateSecret(spec).encoded
        return SecretKeySpec(keyBytes, "AES")
    }

    /**
     * Imports a raw 256-bit key as an AES SecretKey.
     * Used for restoring session keys from memory storage.
     */
    fun importRawKey(rawKeyBytes: ByteArray): SecretKey {
        require(rawKeyBytes.size == 32) { "Raw key must be 32 bytes (256 bits)" }
        return SecretKeySpec(rawKeyBytes, "AES")
    }

    /**
     * Exports a SecretKey to raw bytes (for session storage only).
     * WARNING: Only use for in-memory session persistence. Never persist to disk.
     */
    fun exportRawKey(key: SecretKey): ByteArray {
        return key.encoded.copyOf()
    }
}