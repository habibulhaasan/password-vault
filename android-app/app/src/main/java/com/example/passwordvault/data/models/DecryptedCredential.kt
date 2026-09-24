package com.example.passwordvault.data.models

/**
 * Placeholder data class representing a credential after decryption.
 * Fields can be expanded based on actual app requirements.
 */
 data class DecryptedCredential(
    val id: String,
    val title: String,
    val username: String,
    val password: String,
    val url: String? = null
)
