package com.example.passwordvault.ui.vault

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.passwordvault.crypto.CryptoEngine
import com.example.passwordvault.models.DecryptedCredential
import com.example.passwordvault.models.EncryptedCredential
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.crypto.spec.SecretKeySpec

sealed class VaultState {
    object Idle : VaultState()
    object Loading : VaultState()
    data class Success(val credentials: List<DecryptedCredential>) : VaultState()
    data class Error(val message: String) : VaultState()
}

class VaultViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    
    private val _vaultState = MutableStateFlow<VaultState>(VaultState.Idle)
    val vaultState: StateFlow<VaultState> = _vaultState.asStateFlow()

    // Note: In a production app, the derived key is kept in memory securely,
    // potentially wrapped by the Android Keystore.
    private var vaultKey: SecretKeySpec? = null

    fun setMasterKey(masterPassword: String, saltBase64: String) {
        viewModelScope.launch {
            try {
                val saltBytes = CryptoEngine.base64ToBytes(saltBase64)
                vaultKey = CryptoEngine.deriveVaultKey(masterPassword, saltBytes)
            } catch (e: Exception) {
                _vaultState.value = VaultState.Error("Key derivation failed: ${e.message}")
            }
        }
    }

    fun loadCredentials() {
        val uid = auth.currentUser?.uid
        if (uid == null) {
            _vaultState.value = VaultState.Error("Not authenticated")
            return
        }
        val key = vaultKey
        if (key == null) {
            _vaultState.value = VaultState.Error("Vault key not initialized")
            return
        }

        viewModelScope.launch {
            _vaultState.value = VaultState.Loading
            try {
                // Fetch credentials from Firestore: /users/{uid}/credentials
                val snapshot = db.collection("users").document(uid)
                    .collection("credentials")
                    .get()
                    .await()
                    
                val decryptedList = mutableListOf<DecryptedCredential>()
                
                for (doc in snapshot.documents) {
                    val encrypted = doc.toObject(EncryptedCredential::class.java)
                    if (encrypted != null) {
                        try {
                            val decUser = CryptoEngine.decryptString(encrypted.encryptedUsername, key)
                            val decPass = CryptoEngine.decryptString(encrypted.encryptedPassword, key)
                            
                            decryptedList.add(
                                DecryptedCredential(
                                    id = doc.id,
                                    title = encrypted.title,
                                    username = decUser,
                                    password = decPass,
                                    websiteUrl = encrypted.websiteUrl,
                                    categoryId = encrypted.categoryId
                                )
                            )
                        } catch (e: Exception) {
                            // Skip corrupted or un-decryptable items
                            e.printStackTrace()
                        }
                    }
                }
                
                _vaultState.value = VaultState.Success(decryptedList)
            } catch (e: Exception) {
                _vaultState.value = VaultState.Error(e.message ?: "Failed to load vault")
            }
        }
    }
}

