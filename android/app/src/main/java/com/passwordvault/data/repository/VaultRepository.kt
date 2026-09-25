package com.passwordvault.data.repository

import com.passwordvault.data.model.VaultSettings
import com.passwordvault.data.model.VaultUser
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for vault settings and authentication.
 */
interface VaultRepository {

    /**
     * Current authentication state.
     */
    fun observeAuthState(): Flow<VaultUser?>

    /**
     * Signs in with email and password.
     */
    suspend fun signIn(email: String, password: String): VaultUser

    /**
     * Registers a new user with email and password.
     */
    suspend fun signUp(email: String, password: String): VaultUser

    /**
     * Sends password reset email.
     */
    suspend fun sendPasswordResetEmail(email: String)

    /**
     * Signs out the current user.
     */
    suspend fun signOut()

    /**
     * Checks if vault is initialized for current user.
     */
    suspend fun isVaultInitialized(): Boolean

    /**
     * Initializes vault with master password (first-time setup).
     */
    suspend fun setupVault(masterPassword: String, autoLockMinutes: Int): VaultSettings

    /**
     * Unlocks vault with master password.
     */
    suspend fun unlockVault(masterPassword: String): Boolean

    /**
     * Changes master password (re-encrypts all credentials).
     */
    suspend fun changeMasterPassword(currentPassword: String, newPassword: String)

    /**
     * Updates auto-lock minutes setting.
     */
    suspend fun updateAutoLockMinutes(minutes: Int)

    /**
     * Gets current vault settings.
     */
    suspend fun getVaultSettings(): VaultSettings?

    /**
     * Observes vault settings changes.
     */
    fun observeVaultSettings(): Flow<VaultSettings?>
}