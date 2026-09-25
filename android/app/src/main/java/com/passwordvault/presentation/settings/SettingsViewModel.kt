package com.passwordvault.presentation.settings

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.passwordvault.data.model.VaultSettings
import com.passwordvault.domain.usecase.VaultUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

/**
 * ViewModel for settings screen.
 */
class SettingsViewModel(
    private val vaultUseCase: VaultUseCase
) : ViewModel() {

    private val _autoLockMinutes = MutableStateFlow<Int>(15)
    val autoLockMinutes = _autoLockMinutes.distinctUntilChanged()

    private val _loading = MutableStateFlow(false)
    val loading = _loading.distinctUntilChanged()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.distinctUntilChanged()

    private val _success = MutableStateFlow<String?>(null)
    val success = _success.distinctUntilChanged()

    fun loadSettings(settings: VaultSettings?) {
        settings?.let { _autoLockMinutes.value = it.autoLockMinutes }
    }

    suspend fun updateAutoLockMinutes(minutes: Int) {
        _loading.value = true
        _error.value = null
        try {
            vaultUseCase.updateAutoLockMinutes(minutes)
            _autoLockMinutes.value = minutes
            _success.value = "Auto-lock updated"
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to update auto-lock"
        } finally {
            _loading.value = false
        }
    }

    suspend fun changeMasterPassword(
        currentPassword: String,
        newPassword: String,
        confirmPassword: String,
        currentVaultKey: javax.crypto.SecretKey
    ) {
        if (newPassword != confirmPassword) {
            _error.value = "New passwords don't match"
            return
        }
        if (newPassword.length < 8) {
            _error.value = "New password must be at least 8 characters"
            return
        }

        _loading.value = true
        _error.value = null
        _success.value = null
        try {
            vaultUseCase.changeMasterPassword(currentPassword, newPassword, currentVaultKey)
            _success.value = "Master password changed successfully"
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to change master password"
        } finally {
            _loading.value = false
        }
    }

    fun clearMessages() {
        _error.value = null
        _success.value = null
    }
}