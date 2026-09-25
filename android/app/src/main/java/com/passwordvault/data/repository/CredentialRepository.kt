package com.passwordvault.data.repository

import com.passwordvault.data.model.Credential.CreateEncryptedCredentialDTO
import com.passwordvault.data.model.Credential.DecryptedCredential
import com.passwordvault.data.model.Credential.EncryptedCredential
import com.passwordvault.data.model.Credential.UpdateEncryptedCredentialDTO
import com.passwordvault.data.model.Tag.TagWithCount
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for credential operations.
 * All encryption/decryption happens in the domain layer.
 */
interface CredentialRepository {

    /**
     * Real-time stream of encrypted credentials for the current user.
     */
    fun observeCredentials(): Flow<List<EncryptedCredential>>

    /**
     * Creates a new encrypted credential.
     */
    suspend fun createCredential(dto: CreateEncryptedCredentialDTO): String

    /**
     * Updates an existing encrypted credential.
     */
    suspend fun updateCredential(id: String, dto: UpdateEncryptedCredentialDTO)

    /**
     * Deletes a credential.
     */
    suspend fun deleteCredential(id: String)

    /**
     * Gets a single encrypted credential by ID.
     */
    suspend fun getCredential(id: String): EncryptedCredential?

    /**
     * Marks a credential as logged in (updates lastLoginAt).
     */
    suspend fun markAsLoggedIn(id: String)

    /**
     * Aggregates tags and their usage counts across all credentials.
     */
    fun observeTags(): Flow<List<TagWithCount>>

    /**
     * Renames a tag globally across all credentials containing it.
     */
    suspend fun renameTag(oldTag: String, newTag: String)

    /**
     * Deletes a tag globally from all credentials containing it.
     */
    suspend fun deleteTag(tagToDelete: String)
}