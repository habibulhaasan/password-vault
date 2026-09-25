package com.passwordvault.crypto

import com.passwordvault.crypto.Encryption.DecryptionError

/**
 * Vault-specific cryptographic operations.
 * Mirrors the web app's crypto/vault.ts implementation.
 */
object VaultCrypto {

    const val VAULT_CANARY_TOKEN = "PASSWORD_VAULT_CANARY_VERIFICATION_V1"

    /**
     * Encrypted credential payload (sensitive fields only).
     */
    data class EncryptedCredentialPayload(
        val encryptedUsername: String,
        val encryptedPassword: String,
        val encryptedNotes: String?
    )

    /**
     * Decrypted credential payload (sensitive fields only).
     * EPHEMERAL - Never persist to disk!
     */
    data class DecryptedCredentialPayload(
        val username: String,
        val password: String,
        val notes: String?
    )

    /**
     * Generates an encrypted canary token to store in the user's vault settings.
     * Used during vault unlock to immediately verify whether the provided master password is correct.
     */
    fun createVaultVerificationToken(key: SecretKey): String {
        return Encryption.encryptString(VAULT_CANARY_TOKEN, key)
    }

    /**
     * Verifies whether a derived SecretKey can decrypt the vault's verification token.
     * Returns true if the key is valid, false otherwise.
     */
    fun verifyVaultKey(verificationToken: String, key: SecretKey): Boolean {
        return try {
            val decrypted = Encryption.decryptString(verificationToken, key)
            decrypted == VAULT_CANARY_TOKEN
        } catch (e: DecryptionError) {
            false
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Encrypts the sensitive fields of a credential form input.
     * Plaintext passwords and notes are converted to AES-GCM ciphertexts.
     */
    fun encryptCredentialFields(input: DecryptedCredentialPayload, key: SecretKey): EncryptedCredentialPayload {
        val encryptedUsername = Encryption.encryptString(input.username, key)
        val encryptedPassword = Encryption.encryptString(input.password, key)

        val encryptedNotes = input.notes?.let { notes ->
            if (notes.trim().isNotEmpty()) {
                Encryption.encryptString(notes, key)
            } else null
        }

        return EncryptedCredentialPayload(
            encryptedUsername = encryptedUsername,
            encryptedPassword = encryptedPassword,
            encryptedNotes = encryptedNotes
        )
    }

    /**
     * Decrypts the sensitive ciphertext fields of an EncryptedCredential.
     * Produces ephemeral in-memory plaintext fields.
     */
    @Throws(DecryptionError::class)
    fun decryptCredentialFields(
        encryptedUsername: String,
        encryptedPassword: String,
        encryptedNotes: String?,
        key: SecretKey
    ): DecryptedCredentialPayload {
        val username = Encryption.decryptString(encryptedUsername, key)
        val password = Encryption.decryptString(encryptedPassword, key)

        val notes = encryptedNotes?.let { Encryption.decryptString(it, key) }

        return DecryptedCredentialPayload(
            username = username,
            password = password,
            notes = notes
        )
    }
}