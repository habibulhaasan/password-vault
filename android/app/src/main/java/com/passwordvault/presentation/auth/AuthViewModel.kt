package com.passwordvault.presentation.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.passwordvault.data.model.VaultUser
import com.passwordvault.data.repository.VaultRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

/**
 * ViewModel for authentication operations.
 */
class AuthViewModel(
    private val vaultRepository: VaultRepository
) : ViewModel() {

    private val _user = MutableStateFlow<VaultUser?>(null)
    val user = _user.distinctUntilChanged()

    private val _loading = MutableStateFlow(false)
    val loading = _loading.distinctUntilChanged()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.distinctUntilChanged()

    private val _vaultInitialized = MutableStateFlow<Boolean?>(null)
    val vaultInitialized = _vaultInitialized.distinctUntilChanged()

    init {
        observeAuthState()
    }

    private fun observeAuthState() {
        viewModelScope.launch {
            vaultRepository.observeAuthState()
                .collect { user ->
                    _user.value = user
                    user?.let {
                        checkVaultInitialized(it.uid)
                    } ?: run {
                        _vaultInitialized.value = false
                    }
                }
        }
    }

    private fun checkVaultInitialized(uid: String) {
        viewModelScope.launch {
            try {
                val initialized = vaultRepository.isVaultInitialized()
                _vaultInitialized.value = initialized
            } catch (e: Exception) {
                _vaultInitialized.value = false
            }
        }
    }

    suspend fun signIn(email: String, password: String): Boolean {
        _loading.value = true
        _error.value = null
        return try {
            vaultRepository.signIn(email, password)
            true
        } catch (e: Exception) {
            _error.value = when {
                e.message?.contains("wrong-password") == true -> "Invalid email or password"
                e.message?.contains("user-not-found") == true -> "No account found with this email"
                e.message?.contains("invalid-email") == true -> "Invalid email address"
                else -> "Sign in failed: ${e.message}"
            }
            false
        } finally {
            _loading.value = false
        }
    }

    suspend fun signUp(email: String, password: String): Boolean {
        _loading.value = true
        _error.value = null
        return try {
            vaultRepository.signUp(email, password)
            true
        } catch (e: Exception) {
            _error.value = when {
                e.message?.contains("email-already-in-use") == true -> "Email already in use"
                e.message?.contains("weak-password") == true -> "Password should be at least 6 characters"
                e.message?.contains("invalid-email") == true -> "Invalid email address"
                else -> "Registration failed: ${e.message}"
            }
            false
        } finally {
            _loading.value = false
        }
    }

    suspend fun sendPasswordReset(email: String): Boolean {
        _loading.value = true
        _error.value = null
        return try {
            vaultRepository.sendPasswordResetEmail(email)
            true
        } catch (e: Exception) {
            _error.value = "Failed to send reset email"
            false
        } finally {
            _loading.value = false
        }
    }

    suspend fun signOut() {
        vaultRepository.signOut()
    }

    fun continueAsGuest() {
        // Guest mode - no auth, local-only vault
        // Implementation depends on requirements
    }
}