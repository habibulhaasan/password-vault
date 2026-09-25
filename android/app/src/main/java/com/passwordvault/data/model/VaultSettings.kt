package com.passwordvault.data.model

import kotlinx.datetime.Instant
import kotlinx.serialization.Serializable

/**
 * Vault settings stored in Firestore.
 */
@Serializable
data class VaultSettings(
    val salt: String,              // Base64 encoded 16-byte salt
    val verificationToken: String, // Encrypted canary token
    val autoLockMinutes: Int = 15,
    val createdAt: Instant = Instant.now(),
    val updatedAt: Instant = Instant.now()
)

/**
 * User model from Firebase Auth.
 */
@Serializable
data class VaultUser(
    val uid: String,
    val email: String?,
    val displayName: String?,
    val photoUrl: String?
)