package com.passwordvault.presentation.settings

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import com.passwordvault.R
import com.passwordvault.data.model.VaultSettings
import com.passwordvault.domain.usecase.VaultUseCase
import com.passwordvault.presentation.settings.SettingsViewModel
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class SettingsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                SettingsScreen(viewModel = hiltViewModel())
            }
        }
    }
}

@Composable
fun SettingsScreen(viewModel: SettingsViewModel) {
    val vaultViewModel: VaultViewModel = hiltViewModel()

    val autoLockMinutes by viewModel.autoLockMinutes.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val success by viewModel.success.collectAsState()

    val vaultSettings by vaultViewModel.vaultSettings.collectAsState()

    val currentPassword by remember { mutableStateOf("") }
    val newPassword by remember { mutableStateOf("") }
    val confirmPassword by remember { mutableStateOf("") }
    val showChangePasswordDialog by remember { mutableStateOf(false) }
    val showCurrentPassword by remember { mutableStateOf(false) }
    val showNewPassword by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = { IconButton(onClick = { /* Nav back */ }) { Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack, contentDescription = "Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer
                )
            )
        }
    ) { padding ->
        androidx.compose.foundation.layout.Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            // Auto-lock
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                androidx.compose.foundation.layout.Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Auto-Lock", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                                Text(text = "Automatically lock vault after inactivity", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }

                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(text = if (autoLockMinutes == 0) "Never" else "$autoLockMinutes minutes", fontSize = 16.sp)
                            }
                            Slider(
                                value = autoLockMinutes.toFloat(),
                                onValueChange = {
                                    val newValue = it.roundToInt()
                                    if (newValue != autoLockMinutes) {
                                        lifecycleScope.launch { viewModel.updateAutoLockMinutes(newValue) }
                                    }
                                },
                                valueRange = 0f..60f,
                                steps = 60,
                                modifier = Modifier.fillMaxWidth()
                            )
                            if (autoLockMinutes == 0) {
                                Text(text = "Vault will stay unlocked until manually locked", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth())
                            }
                        }
                    }
                }
            }

            // Change Master Password
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                androidx.compose.foundation.layout.Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(text = "Change Master Password", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                                Text(text = "Update your master password and re-encrypt all credentials", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                            Button(onClick = { showChangePasswordDialog = true }) {
                                Text("Change")
                            }
                        }
                    }
                }
            }

            // Biometric Unlock
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                androidx.compose.foundation.layout.Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(text = "Biometric Unlock", fontSize = 16.sp, fontWeight = FontWeight.Medium)
                            Text(text = "Use fingerprint or face to unlock vault", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Switch(
                            checked = false, // TODO: Implement biometric setting
                            onCheckedChange = { /* TODO */ },
                            colors = androidx.compose.material3.SwitchDefaults.colors(
                                thumbColor = androidx.compose.material3.MaterialTheme.colorScheme.onPrimary,
                                trackColor = androidx.compose.material3.MaterialTheme.colorScheme.primary
                            )
                        )
                    }
                }
            }

            // Export/Import
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                androidx.compose.foundation.layout.Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(text = "Data", fontSize = 16.sp, fontWeight = FontWeight.Medium, modifier = Modifier.fillMaxWidth())
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            androidx.compose.material3.OutlinedButton(onClick = { /* TODO: Export */ }, modifier = Modifier.weight(1f)) {
                                Text("Export Vault")
                            }
                            androidx.compose.material3.OutlinedButton(onClick = { /* TODO: Import */ }, modifier = Modifier.weight(1f)) {
                                Text("Import Vault")
                            }
                        }
                    }
                }
            }

            // About
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                androidx.compose.foundation.layout.Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Lock, contentDescription = "", tint = androidx.compose.material3.MaterialTheme.colorScheme.primary, modifier = Modifier.size(48.dp))
                        Text(text = "Password Vault", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                        Text(text = "Version 1.0.0", fontSize = 14.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(text = "Zero-knowledge password manager", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
                    }
                }
            }

            // Messages
            error?.let {
                androidx.compose.material3.Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, modifier = Modifier.fillMaxWidth().padding(16.dp))
            }
            success?.let {
                androidx.compose.material3.Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.primary, fontSize = 12.sp, modifier = Modifier.fillMaxWidth().padding(16.dp))
            }
        }
    }

    // Change Password Dialog
    if (showChangePasswordDialog) {
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { showChangePasswordDialog = false },
            title = { Text("Change Master Password") },
            text = {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    TextField(
                        value = currentPassword,
                        onValueChange = { currentPassword = it },
                        label = { Text("Current Master Password") },
                        trailingIcon = {
                            IconButton(onClick = { showCurrentPassword = !showCurrentPassword }) {
                                Icon(
                                    imageVector = if (showCurrentPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                                    contentDescription = if (showCurrentPassword) "Hide" else "Show"
                                )
                            }
                        },
                        visualTransformation = if (showCurrentPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    TextField(
                        value = newPassword,
                        onValueChange = { newPassword = it },
                        label = { Text("New Master Password") },
                        trailingIcon = {
                            IconButton(onClick = { showNewPassword = !showNewPassword }) {
                                Icon(
                                    imageVector = if (showNewPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                                    contentDescription = if (showNewPassword) "Hide" else "Show"
                                )
                            }
                        },
                        visualTransformation = if (showNewPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    TextField(
                        value = confirmPassword,
                        onValueChange = { confirmPassword = it },
                        label = { Text("Confirm New Master Password") },
                        trailingIcon = {
                            IconButton(onClick = { showNewPassword = !showNewPassword }) {
                                Icon(
                                    imageVector = if (showNewPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                                    contentDescription = if (showNewPassword) "Hide" else "Show"
                                )
                            }
                        },
                        visualTransformation = if (showNewPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newPassword == confirmPassword && newPassword.length >= 8) {
                            val vaultKey = vaultViewModel.vaultKey.value
                            vaultKey?.let {
                                lifecycleScope.launch {
                                    viewModel.changeMasterPassword(currentPassword, newPassword, confirmPassword, it)
                                    showChangePasswordDialog = false
                                    currentPassword = ""
                                    newPassword = ""
                                    confirmPassword = ""
                                }
                            }
                        }
                    },
                    enabled = !loading && newPassword == confirmPassword && newPassword.length >= 8
                ) {
                    if (loading) androidx.compose.material3.ProgressIndicator() else Text("Change")
                }
            },
            dismissButton = {
                androidx.compose.material3.TextButton(onClick = {
                    showChangePasswordDialog = false
                    currentPassword = ""
                    newPassword = ""
                    confirmPassword = ""
                }) {
                    Text("Cancel")
                }
            }
        )
    }
}