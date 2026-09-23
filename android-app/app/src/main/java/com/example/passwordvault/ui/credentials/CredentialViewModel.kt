package com.example.passwordvault.ui.credentials

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

class CredentialViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    
    // In a production app, the key is passed from a centralized KeyManager or VaultViewModel
    fun saveCredential(
        decrypted: DecryptedCredential, 
        vaultKey: SecretKeySpec,
        onComplete: (Boolean) -> Unit
    ) {
        val uid = auth.currentUser?.uid
        if (uid == null) {
            onComplete(false)
            return
        }

        viewModelScope.launch {
            try {
                // Encrypt data before sending to Firestore
                val encUsername = CryptoEngine.encryptString(decrypted.username, vaultKey)
                val encPassword = CryptoEngine.encryptString(decrypted.password, vaultKey)

                val encryptedObj = EncryptedCredential(
                    title = decrypted.title,
                    encryptedUsername = encUsername,
                    encryptedPassword = encPassword,
                    websiteUrl = decrypted.websiteUrl,
                    categoryId = decrypted.categoryId
                )

                if (decrypted.id.isEmpty()) {
                    // Create new
                    db.collection("users").document(uid)
                        .collection("credentials").add(encryptedObj).await()
                } else {
                    // Update existing
                    db.collection("users").document(uid)
                        .collection("credentials").document(decrypted.id)
                        .set(encryptedObj).await()
                }
                onComplete(true)
            } catch (e: Exception) {
                e.printStackTrace()
                onComplete(false)
            }
        }
    }
}
