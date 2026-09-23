package com.example.passwordvault.crypto

import android.util.Base64
import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.PBEKeySpec
import javax.crypto.spec.SecretKeySpec

object CryptoEngine {
    private const val PBKDF2_ALGORITHM = "PBKDF2WithHmacSHA256"
    private const val AES_GCM_ALGORITHM = "AES/GCM/NoPadding"
    const val DEFAULT_ITERATIONS = 600000
    private const val KEY_LENGTH_BITS = 256
    private const val IV_LENGTH_BYTES = 12
    private const val TAG_LENGTH_BITS = 128

    class DecryptionException(message: String) : Exception(message)

    fun bytesToBase64(bytes: ByteArray): String {
        return Base64.encodeToString(bytes, Base64.NO_WRAP)
    }

    fun base64ToBytes(base64: String): ByteArray {
        return Base64.decode(base64, Base64.NO_WRAP)
    }

    fun generateSalt(length: Int = 16): ByteArray {
        val salt = ByteArray(length)
        SecureRandom().nextBytes(salt)
        return salt
    }

    fun deriveVaultKey(masterPassword: String, salt: ByteArray, iterations: Int = DEFAULT_ITERATIONS): SecretKeySpec {
        val spec = PBEKeySpec(masterPassword.toCharArray(), salt, iterations, KEY_LENGTH_BITS)
        val factory = SecretKeyFactory.getInstance(PBKDF2_ALGORITHM)
        val secret = factory.generateSecret(spec)
        return SecretKeySpec(secret.encoded, "AES")
    }

    fun encryptString(plaintext: String, key: SecretKeySpec): String {
        val cipher = Cipher.getInstance(AES_GCM_ALGORITHM)
        val iv = ByteArray(IV_LENGTH_BYTES)
        SecureRandom().nextBytes(iv)
        val gcmSpec = GCMParameterSpec(TAG_LENGTH_BITS, iv)
        
        cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec)
        val ciphertext = cipher.doFinal(plaintext.toByteArray(StandardCharsets.UTF_8))
        
        // Pack IV + Ciphertext
        val packed = ByteArray(iv.size + ciphertext.size)
        System.arraycopy(iv, 0, packed, 0, iv.size)
        System.arraycopy(ciphertext, 0, packed, iv.size, ciphertext.size)
        
        return bytesToBase64(packed)
    }

    fun decryptString(ciphertextBase64: String, key: SecretKeySpec): String {
        try {
            val packed = base64ToBytes(ciphertextBase64)
            if (packed.size < IV_LENGTH_BYTES + 16) {
                throw DecryptionException("Ciphertext payload is too short")
            }
            
            val iv = packed.copyOfRange(0, IV_LENGTH_BYTES)
            val ciphertext = packed.copyOfRange(IV_LENGTH_BYTES, packed.size)
            
            val cipher = Cipher.getInstance(AES_GCM_ALGORITHM)
            val gcmSpec = GCMParameterSpec(TAG_LENGTH_BITS, iv)
            cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec)
            
            val plaintextBytes = cipher.doFinal(ciphertext)
            return String(plaintextBytes, StandardCharsets.UTF_8)
        } catch (e: Exception) {
            throw DecryptionException("Decryption failed: ${e.message}")
        }
    }
}

