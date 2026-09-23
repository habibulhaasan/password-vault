package com.example.passwordvault.models

data class EncryptedCredential(
    var id: String = "",
    val title: String = "",
    val encryptedUsername: String = "",
    val encryptedPassword: String = "",
    val websiteUrl: String? = null,
    val categoryId: String? = null
)

data class DecryptedCredential(
    val id: String,
    val title: String,
    val username: String,
    val password: String,
    val websiteUrl: String?,
    val categoryId: String?
)

