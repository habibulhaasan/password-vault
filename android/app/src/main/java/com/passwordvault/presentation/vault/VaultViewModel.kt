package com.passwordvault.presentation.vault

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.passwordvault.crypto.VaultCrypto
import com.passwordvault.data.model.Credential.DecryptedCredential
import com.passwordvault.data.model.Credential.EncryptedCredential
import com.passwordvault.data.model.VaultSettings
import com.passwordvault.domain.usecase.CredentialUseCase
import com.passwordvault.domain.usecase.VaultUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import javax.crypto.SecretKey

/**
 * ViewModel for vault operations and credential management.
 */
class VaultViewModel(
    private val vaultUseCase: VaultUseCase,
    private val credentialUseCase: CredentialUseCase
) : ViewModel() {

    // Vault State
    private val _status = MutableStateFlow<VaultUseCase.VaultStatus>(VaultUseCase.VaultStatus.LOADING)
    val status = _status.distinctUntilChanged()

    private val _vaultKey = MutableStateFlow<SecretKey?>(null)
    val vaultKey = _vaultKey.distinctUntilChanged()

    private val _autoLockMinutes = MutableStateFlow<Int>(15)
    val autoLockMinutes = _autoLockMinutes.distinctUntilChanged()

    private val _vaultSettings = MutableStateFlow<VaultSettings?>(null)
    val vaultSettings = _vaultSettings.distinctUntilChanged()

    // Credentials
    private val _credentials = MutableStateFlow<List<DecryptedCredential>>(emptyList())
    val credentials = _credentials.distinctUntilChanged()

    private val _loading = MutableStateFlow(false)
    val loading = _loading.distinctUntilChanged()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.distinctUntilChanged()

    // Tags
    private val _tags = MutableStateFlow<List<TagWithCount>>(emptyList())
    val tags = _tags.distinctUntilChanged()

    init {
        observeVaultSettings()
        observeTags()
    }

    private fun observeVaultSettings() {
        viewModelScope.launch {
            vaultUseCase.observeVaultSettings()
                .collect { settings ->
                    _vaultSettings.value = settings
                    settings?.let {
                        _autoLockMinutes.value = it.autoLockMinutes
                        if (it.autoLockMinutes == 0) {
                            _status.value = VaultUseCase.VaultStatus.UNLOCKED
                        } else {
                            _status.value = VaultUseCase.VaultStatus.LOCKED
                        }
                    }
                }
        }
    }

    private fun observeTags() {
        viewModelScope.launch {
            credentialUseCase.observeTags()
                .collect { _tags.value = it }
        }
    }

    // Vault Operations

    /**
     * First-time vault setup.
     */
    suspend fun setupVault(masterPassword: String, autoLockMinutes: Int = 15) {
        _loading.value = true
        _error.value = null
        try {
            val key = vaultUseCase.setupVault(masterPassword, autoLockMinutes)
            _vaultKey.value = key
            _autoLockMinutes.value = autoLockMinutes
            _status.value = VaultUseCase.VaultStatus.UNLOCKED
            startCredentialListener(key)
        } catch (e: Exception) {
            _error.value = e.message ?: "Setup failed"
            _status.value = VaultUseCase.VaultStatus.UNINITIALIZED
        } finally {
            _loading.value = false
        }
    }

    /**
     * Unlocks existing vault with master password.
     */
    suspend fun unlockVault(masterPassword: String): Boolean {
        _loading.value = true
        _error.value = null
        return try {
            val key = vaultUseCase.unlockVault(masterPassword)
            key?.let {
                _vaultKey.value = it
                _status.value = VaultUseCase.VaultStatus.UNLOCKED
                startCredentialListener(it)
                true
            } ?: false
        } catch (e: Exception) {
            _error.value = e.message ?: "Unlock failed"
            false
        } finally {
            _loading.value = false
        }
    }

    /**
     * Locks the vault, purging the key from memory.
     */
    fun lockVault() {
        _vaultKey.value = null
        _credentials.value = emptyList()
        _status.value = VaultUseCase.VaultStatus.LOCKED
    }

    /**
     * Changes master password and re-encrypts all credentials.
     */
    suspend fun changeMasterPassword(currentPassword: String, newPassword: String) {
        _loading.value = true
        _error.value = null
        try {
            val currentKey = _vaultKey.value ?: throw IllegalStateException("Vault not unlocked")
            val newKey = vaultUseCase.changeMasterPassword(currentPassword, newPassword, currentKey)
            _vaultKey.value = newKey
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to change password"
            throw e
        } finally {
            _loading.value = false
        }
    }

    /**
     * Updates auto-lock minutes.
     */
    suspend fun updateAutoLockMinutes(minutes: Int) {
        _autoLockMinutes.value = minutes
        vaultUseCase.updateAutoLockMinutes(minutes)
    }

    // Credential Operations

    private fun startCredentialListener(vaultKey: SecretKey) {
        viewModelScope.launch {
            credentialUseCase.observeCredentials()
                .collect { encryptedList ->
                    val decrypted = encryptedList.mapNotNull { enc ->
                        try {
                            credentialUseCase.decryptCredential(enc, vaultKey)
                        } catch (e: Exception) {
                            null
                        }
                    }
                    _credentials.value = decrypted
                }
        }
    }

    suspend fun createCredential(formData: CredentialFormData) {
        val key = _vaultKey.value ?: throw IllegalStateException("Vault not unlocked")
        _loading.value = true
        try {
            credentialUseCase.createCredential(formData, key)
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to create credential"
            throw e
        } finally {
            _loading.value = false
        }
    }

    suspend fun updateCredential(id: String, formData: CredentialFormData) {
        val key = _vaultKey.value ?: throw IllegalStateException("Vault not unlocked")
        _loading.value = true
        try {
            credentialUseCase.updateCredential(id, formData, key)
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to update credential"
            throw e
        } finally {
            _loading.value = false
        }
    }

    suspend fun deleteCredential(id: String) {
        _loading.value = true
        try {
            credentialUseCase.deleteCredential(id)
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to delete credential"
            throw e
        } finally {
            _loading.value = false
        }
    }

    suspend fun markAsLoggedIn(id: String) {
        credentialUseCase.markAsLoggedIn(id)
    }

    // Tags
    fun suggestTags(query: String, currentTags: List<String>): List<String> {
        return credentialUseCase.suggestTags(query, currentTags, _tags.value)
    }

    suspend fun renameTag(oldTag: String, newTag: String) {
        credentialUseCase.renameTag(oldTag, newTag)
    }

    suspend fun deleteTag(tag: String) {
        credentialUseCase.deleteTag(tag)
    }

    // CredentialFormData is in data.model
    typealias CredentialFormData = com.passwordvault.data.model.Credential.CredentialFormData
    typealias TagWithCount = com.passwordvault.data.model.Tag.TagWithCount
}