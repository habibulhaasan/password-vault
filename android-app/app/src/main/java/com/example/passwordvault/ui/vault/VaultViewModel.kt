package com.example.passwordvault.ui.vault

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.passwordvault.data.models.Credential
import com.example.passwordvault.data.repository.FireStoreRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.emptyFlow
import kotlinx.coroutines.launch

/**
 * ViewModel for the Vault screen.
 * Provides both the list of credentials and a richer UI state via [VaultState].
 */
class VaultViewModel : ViewModel() {
    // Existing credentials flow (kept for compatibility)
    val credentials: StateFlow<List<Credential>> = FireStoreRepository.getCredentials()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // New UI state handling
    private val _vaultState = MutableStateFlow<VaultState>(VaultState.Idle)
    val vaultState: StateFlow<VaultState> = _vaultState.asStateFlow()

    /**
     * Stub implementation to simulate vault initialization.
     * In a real app this would derive the encryption key and load decrypted credentials.
     */
    fun initializeVault(masterPassword: String, salt: String) {
        viewModelScope.launch {
            _vaultState.value = VaultState.DerivingKey
            delay(500) // simulate key derivation
            _vaultState.value = VaultState.Loading
            delay(500) // simulate loading data
            // For now, provide an empty list of decrypted credentials
            _vaultState.value = VaultState.Success(emptyList())
        }
    }

    /** Add or update a credential */
    fun addOrUpdate(credential: Credential) {
        viewModelScope.launch { FireStoreRepository.addOrUpdateCredential(credential) }
    }

    /** Delete a credential by its id */
    fun delete(id: String) {
        viewModelScope.launch { FireStoreRepository.deleteCredential(id) }
    }
}
