package com.example.passwordvault.ui.vault

import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import com.example.passwordvault.models.DecryptedCredential

sealed class VaultState {
    object Idle : VaultState()
    object DerivingKey : VaultState()
    object Loading : VaultState()
    data class Error(val message: String) : VaultState()
    data class Success(val credentials: List<DecryptedCredential>) : VaultState()
}
