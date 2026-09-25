package com.passwordvault.crypto

import android.util.Base64
import javax.crypto.Cipher
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

/**
 * AES-GCM encryption/decryption utilities.
 * Mirrors the web app's crypto/encryption.ts implementation.
 *
 * Format: Base64(IV || ciphertext || authTag)
 * - IV: 12 bytes (96 bits, NIST recommended for AES-GCM)
 * - Auth Tag: 16 bytes (128 bits, appended to ciphertext by Java)
 */
object Encryption {

    const val AES_GCM_IV_LENGTH = 12 // 96 bits
    const val AES_GCM_TAG_LENGTH = 16 // 128 bits
    const val MIN_CIPHERTEXT_LENGTH = AES_GCM_IV_LENGTH + AES_GCM_TAG_LENGTH + 1 // IV + tag + at least 1 byte data

    class DecryptionError(message: String = "Decryption failed. The key is invalid or the data has been corrupted.") :
        Exception(message)

    /**
     * Encrypts a plaintext UTF-8 string using AES-GCM with a fresh random 12-byte IV.
     *
     * Output format: Base64( [12-byte IV] + [ciphertext with appended 128-bit auth tag] )
     */
    fun encryptString(plaintext: String, key: SecretKey): String {
        val encodedText = plaintext.toByteArray(charsets.UTF_8)

        // Generate cryptographically secure random 12-byte IV
        // NEVER reuse IVs with the same key
        val iv = ByteArray(AES_GCM_IV_LENGTH)
        java.security.SecureRandom().nextBytes(iv)

        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = GCMParameterSpec(AES_GCM_TAG_LENGTH * 8, iv) // tag length in bits
        cipher.init(Cipher.ENCRYPT_MODE, key, spec)

        val ciphertext = cipher.doFinal(encodedText)

        // Pack IV (12 bytes) + Ciphertext (with appended auth tag)
        val packed = ByteArray(iv.size + ciphertext.size)
        System.arraycopy(iv, 0, packed, 0, iv.size)
        System.arraycopy(ciphertext, 0, packed, iv.size, ciphertext.size)

        return Base64.encodeToString(packed, Base64.NO_WRAP)
    }

    /**
     * Decrypts a Base64-encoded AES-GCM ciphertext payload.
     *
     * Expects format: Base64( [12-byte IV] + [ciphertext with 128-bit authentication tag] )
     * Throws DecryptionError if the key is incorrect or data was tampered with.
     */
    @Throws(DecryptionError::class)
    fun decryptString(ciphertextBase64: String, key: SecretKey): String {
        if (ciphertextBase64.isBlank()) {
            throw DecryptionError("Ciphertext payload is empty")
        }

        val packed: ByteArray
        try {
            packed = Base64.decode(ciphertextBase64, Base64.NO_WRAP)
        } catch (e: IllegalArgumentException) {
            throw DecryptionError("Malformed base64 ciphertext payload")
        }

        if (packed.size < MIN_CIPHERTEXT_LENGTH) {
            throw DecryptionError("Ciphertext payload is too short to be valid")
        }

        val iv = packed.copyOfRange(0, AES_GCM_IV_LENGTH)
        val ciphertext = packed.copyOfRange(AES_GCM_IV_LENGTH, packed.size)

        try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val spec = GCMParameterSpec(AES_GCM_TAG_LENGTH * 8, iv)
            cipher.init(Cipher.DECRYPT_MODE, key, spec)

            val decryptedBytes = cipher.doFinal(ciphertext)
            return String(decryptedBytes, charsets.UTF_8)
        } catch (e: javax.crypto.AEADBadTagException) {
            // Authentication tag verification failed - data tampered or wrong key
            throw DecryptionError()
        } catch (e: Exception) {
            throw DecryptionError("Decryption failed: ${e.message}")
        }
    }
}