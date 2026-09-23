package com.example.passwordvault

import android.os.Bundle
import androidx.fragment.app.FragmentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import com.example.passwordvault.theme.PasswordVaultTheme
import com.example.passwordvault.ui.auth.AuthState
import com.example.passwordvault.ui.auth.AuthViewModel
import com.example.passwordvault.ui.auth.LoginScreen
import com.example.passwordvault.ui.vault.VaultScreen
import com.example.passwordvault.ui.vault.VaultViewModel

class MainActivity : FragmentActivity() {
    private val authViewModel: AuthViewModel by viewModels()
    private val vaultViewModel: VaultViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        setContent {
            PasswordVaultTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val authState by authViewModel.authState.collectAsState()

                    if (authState is AuthState.Authenticated) {
                        VaultScreen(
                            vaultViewModel = vaultViewModel,
                            onLogout = { authViewModel.logout() }
                        )
                    } else {
                        LoginScreen(
                            authViewModel = authViewModel,
                            onLoginSuccess = {
                                // Transition happens automatically due to state change
                            }
                        )
                    }
                }
            }
        }
    }
}
