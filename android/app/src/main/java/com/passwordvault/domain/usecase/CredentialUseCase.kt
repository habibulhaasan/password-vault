package com.passwordvault.domain.usecase

import com.passwordvault.data.model.Credential
import com.passwordvault.data.repository.CredentialRepository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class CredentialUseCase @Inject constructor(
    private val credentialRepository: CredentialRepository
) {
    fun getAllCredentials(): Flow<List<Credential>> = credentialRepository.getAllCredentials()

    suspend fun getCredentialById(id: String): Credential? = credentialRepository.getCredentialById(id)

    suspend fun saveCredential(credential: Credential) = credentialRepository.saveCredential(credential)

    suspend fun deleteCredential(id: String) = credentialRepository.deleteCredential(id)

    suspend fun searchCredentials(query: String): List<Credential> = credentialRepository.searchCredentials(query)

    suspend fun getCredentialsByCategory(categoryId: String): List<Credential> = credentialRepository.getCredentialsByCategory(categoryId)

    suspend fun getCredentialsByTag(tagId: String): List<Credential> = credentialRepository.getCredentialsByTag(tagId)
}
