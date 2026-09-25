package com.passwordvault.presentation.vault

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import com.passwordvault.R
import com.passwordvault.navigation.AuthDestination
import com.passwordvault.presentation.auth.AuthViewModel
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class VaultActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                VaultScreensNavHost()
            }
        }
    }
}

@Composable
fun VaultScreensNavHost() {
    val navController = androidx.navigation.compose.rememberNavController()
    val vaultViewModel: VaultViewModel = hiltViewModel()

    androidx.navigation.compose.NavHost(navController, startDestination = AuthDestination.VaultSetup.route) {
        androidx.navigation.compose.composable(
            route = AuthDestination.VaultSetup.route,
            arguments = listOf(androidx.navigation.compose.navArgument("isGuest") { type = androidx.navigation.NavType.BoolType; defaultValue = "false" })
        ) { backStackEntry ->
            val isGuest = backStackEntry.getBoolean("isGuest")
            VaultSetupScreen(
                isGuest = isGuest,
                onSetupComplete = { navController.navigate(AuthDestination.VaultUnlock.route) { popUpTo(navController.graph.startDestinationId) { inclusive = true } } },
                viewModel = vaultViewModel
            )
        }
        androidx.navigation.compose.composable(AuthDestination.VaultUnlock.route) {
            VaultUnlockScreen(
                onUnlockSuccess = { navController.navigate(AuthDestination.VaultUnlock.route) { popUpTo(navController.graph.startDestinationId) { inclusive = true } } },
                viewModel = vaultViewModel
            )
        }
    }
}

@Composable
fun VaultSetupScreen(
    isGuest: Boolean,
    onSetupComplete: () -> Unit,
    viewModel: VaultViewModel
) {
    val masterPassword by remember { mutableStateOf("") }
    val confirmPassword by remember { mutableStateOf("") }
    val autoLockMinutes by remember { mutableStateOf(15) }
    val showPassword by remember { mutableStateOf(false) }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    AuthLayout(
        title = if (isGuest) "Create Guest Vault" else "Setup Your Vault",
        subtitle = "Create a master password to encrypt your data. This password cannot be recovered if forgotten."
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            TextField(
                value = masterPassword,
                onValueChange = { masterPassword = it },
                label = { Text("Master Password") },
                isError = error != null,
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Next),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            TextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = { Text("Confirm Master Password") },
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Next),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            (masterPassword != confirmPassword && confirmPassword.isNotBlank()).let { mismatch ->
                if (mismatch) {
                    Text(text = "Passwords don't match", color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                }
            }

            androidx.compose.material3.Text(text = "Auto-lock after", fontSize = 14.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
            androidx.compose.material3.Slider(
                value = autoLockMinutes.toFloat(),
                onValueChange = { autoLockMinutes = it.roundToInt() },
                valueRange = 0f..60f,
                steps = 60,
                modifier = Modifier.fillMaxWidth()
            )
            androidx.compose.material3.Text(text = if (autoLockMinutes == 0) "Never" else "$autoLockMinutes minutes", fontSize = 14.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())

            error?.let {
                Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            Button(
                onClick = {
                    if (masterPassword == confirmPassword && masterPassword.length >= 8) {
                        lifecycleScope.launch {
                            viewModel.setupVault(masterPassword, autoLockMinutes)
                            onSetupComplete()
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading && masterPassword.isNotBlank() && masterPassword == confirmPassword && masterPassword.length >= 8
            ) {
                if (loading) androidx.compose.material3.ProgressIndicator() else Text("Create Vault")
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(16.dp))

            androidx.compose.material3.Text(
                text = "⚠️ This password cannot be recovered. Store it securely.",
                fontSize = 12.sp,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun VaultUnlockScreen(
    onUnlockSuccess: () -> Unit,
    viewModel: VaultViewModel
) {
    val masterPassword by remember { mutableStateOf("") }
    val showPassword by remember { mutableStateOf(false) }
    val useBiometric by remember { mutableStateOf(false) }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val status by viewModel.status.collectAsState()

    AuthLayout(
        title = "Unlock Vault",
        subtitle = "Enter your master password to access your credentials"
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Lock icon with status
            Card(
                modifier = Modifier.size(100.dp),
                colors = androidx.compose.material3.CardDefaults.cardColors(
                    containerColor = when (status) {
                        VaultViewModel.VaultStatus.UNLOCKED -> androidx.compose.material3.MaterialTheme.colorScheme.secondaryContainer
                        else -> androidx.compose.material3.MaterialTheme.colorScheme.primaryContainer
                    }
                ),
                shape = androidx.compose.foundation.shape.RoundedCornerShape(50.dp)
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (status == VaultViewModel.VaultStatus.UNLOCKED)
                            androidx.compose.material.icons.Icons.Default.LockOpen
                        else
                            androidx.compose.material.icons.Icons.Default.Lock,
                        contentDescription = "Vault status",
                        tint = when (status) {
                            VaultViewModel.VaultStatus.UNLOCKED -> androidx.compose.material3.MaterialTheme.colorScheme.secondary
                            else -> androidx.compose.material3.MaterialTheme.colorScheme.primary
                        },
                        modifier = Modifier.size(48.dp)
                    )
                }
            }

            TextField(
                value = masterPassword,
                onValueChange = { masterPassword = it },
                label = { Text("Master Password") },
                isError = error != null,
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Done),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            error?.let {
                Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            // Biometric unlock button
            androidx.compose.material3.OutlinedButton(
                onClick = {
                    // TODO: Implement biometric unlock
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading
            ) {
                Icon(imageVector = androidx.compose.material.icons.Icons.Default.Fingerprint, contentDescription = "Fingerprint", modifier = Modifier.size(20.dp).padding(end = 8.dp))
                Text("Unlock with Biometric")
            }

            Button(
                onClick = {
                    lifecycleScope.launch {
                        val success = viewModel.unlockVault(masterPassword)
                        if (success) onUnlockSuccess()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading && masterPassword.isNotBlank()
            ) {
                if (loading) androidx.compose.material3.ProgressIndicator() else Text("Unlock Vault")
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(16.dp))

            androidx.compose.material3.TextButton(onClick = { /* TODO: Forgot master password flow */ }) {
                Text("Forgot Master Password?")
            }
        }
    }
}