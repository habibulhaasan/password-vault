package com.passwordvault.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable

/**
 * Persisted Firestore model for encrypted credentials.
 * SENSITIVE FIELDS (username, password, notes) ARE ALWAYS ENCRYPTED CLIENT-SIDE.
 * Plaintext passwords and usernames MUST NEVER be saved to Firestore.
 */
@Serializable
@Parcelize
data class EncryptedCredential(
    val id: String = "",
    val title: String,

    // Ciphertext payloads (AES-GCM encoded as base64 with IV/salt)
    val encryptedUsername: String,
    val encryptedPassword: String,
    val encryptedNotes: String? = null,

    // Non-sensitive metadata queryable for filtering and organization
    val websiteUrl: String? = null,
    val logoUrl: String? = null,
    val categoryId: String? = null,
    val tags: List<String> = emptyList(),

    // Login tracking
    val lastLoginAt: java.util.Date? = null,

    // Audit timestamps
    val createdAt: java.util.Date = java.util.Date(),
    val updatedAt: java.util.Date = java.util.Date()
) : Parcelable

/**
 * Ephemeral in-memory representation of a decrypted credential.
 *
 * CAUTION: Contains sensitive plaintext values in memory.
 * Decrypted credentials must never be permanently saved in localStorage,
 * session cookies, or persisted in unencrypted stores.
 * When the vault locks, all decrypted instances must be purged from memory.
 */
@Serializable
data class DecryptedCredential(
    val id: String,
    val title: String,

    val username: String,
    val password: String,
    val notes: String? = null,

    val websiteUrl: String? = null,
    val logoUrl: String? = null,
    val categoryId: String? = null,
    val tags: List<String> = emptyList(),

    val lastLoginAt: java.util.Date? = null,
    val createdAt: java.util.Date = java.util.Date(),
    val updatedAt: java.util.Date = java.util.Date()
)

/**
 * Credential form input data before client-side encryption.
 */
@Serializable
data class CredentialFormData(
    val title: String,
    val username: String,
    val password: String,
    val notes: String? = null,
    val websiteUrl: String? = null,
    val logoUrl: String? = null,
    val categoryId: String? = null,
    val tags: List<String> = emptyList()
)

/**
 * DTO for creating a new credential in Firestore.
 */
@Serializable
data class CreateEncryptedCredentialDTO(
    val title: String,
    val encryptedUsername: String,
    val encryptedPassword: String,
    val encryptedNotes: String? = null,
    val websiteUrl: String? = null,
    val logoUrl: String? = null,
    val categoryId: String? = null,
    val tags: List<String> = emptyList(),
    val lastLoginAt: java.util.Date? = null,
    val createdAt: java.util.Date = java.util.Date(),
    val updatedAt: java.util.Date = java.util.Date()
)

/**
 * DTO for updating an existing credential in Firestore.
 */
@Serializable
data class UpdateEncryptedCredentialDTO(
    val title: String? = null,
    val encryptedUsername: String? = null,
    val encryptedPassword: String? = null,
    val encryptedNotes: String? = null,
    val websiteUrl: String? = null,
    val logoUrl: String? = null,
    val categoryId: String? = null,
    val tags: List<String>? = null,
    val lastLoginAt: java.util.Date? = null,
    val updatedAt: java.util.Date = java.util.Date()
)