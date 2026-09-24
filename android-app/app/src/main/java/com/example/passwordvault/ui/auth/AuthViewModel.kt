package com.example.passwordvault.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await

sealed class AuthState {
    object Idle : AuthState()
    object Loading : AuthState()
    data class Authenticated(val uid: String, val salt: String?) : AuthState()
    data class Error(val message: String) : AuthState()
}

class AuthViewModel : ViewModel() {
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()
    
    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState: StateFlow<AuthState> = _authState.asStateFlow()
    
    init {
        if (auth.currentUser != null) {
            auth.signOut()
        }
    }

    fun login(email: String, masterPassword: String, onSaltFetched: (String) -> Unit) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val result = auth.signInWithEmailAndPassword(email, masterPassword).await()
                val user = result.user
                
                if (user != null) {
                    val settingsDoc = db.collection("users").document(user.uid)
                        .collection("settings").document("vault")
                        .get().await()
                        
                    val salt = settingsDoc.getString("salt")
                    if (salt != null) {
                        // Pass the salt back to the UI BEFORE changing state
                        onSaltFetched(salt)
                        _authState.value = AuthState.Authenticated(user.uid, salt)
                    } else {
                        _authState.value = AuthState.Error("Vault not initialized on web yet.")
                        auth.signOut()
                    }
                } else {
                    _authState.value = AuthState.Error("Login failed")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "An unknown error occurred")
            }
        }
    }

    fun sendPasswordReset(email: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            try {
                FirebaseAuth.getInstance().sendPasswordResetEmail(email).await()
                onResult(true, null)
            } catch (e: Exception) {
                onResult(false, e.message)
            }
}
}

    fun register(email: String, password: String, onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            try {
                // Simple registration using Firebase Auth; replace with real logic as needed
                FirebaseAuth.getInstance().createUserWithEmailAndPassword(email, password).await()
                onResult(true, null)
            } catch (e: Exception) {
                onResult(false, e.message)
            }
        }
    }

    fun logout() {
        viewModelScope.launch {
            auth.signOut()
            _authState.value = AuthState.Idle
        }
    }
}
