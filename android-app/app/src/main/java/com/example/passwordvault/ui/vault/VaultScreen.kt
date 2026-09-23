package com.example.passwordvault.ui.vault

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.passwordvault.models.DecryptedCredential

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VaultScreen(
    vaultViewModel: VaultViewModel,
    onLogout: () -> Unit
) {
    val vaultState by vaultViewModel.vaultState.collectAsState()

    LaunchedEffect(Unit) {
        // Automatically load credentials when the screen starts
        vaultViewModel.loadCredentials()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Vault") },
                actions = {
                    TextButton(onClick = onLogout) {
                        Text("Logout")
                    }
                }
            )
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding).fillMaxSize()) {
            when (val state = vaultState) {
                is VaultState.Idle, is VaultState.Loading -> {
                    CircularProgressIndicator(modifier = Modifier.align(Alignment.Center))
                }
                is VaultState.Error -> {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                is VaultState.Success -> {
                    if (state.credentials.isEmpty()) {
                        Text("Your vault is empty.", modifier = Modifier.align(Alignment.Center))
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(state.credentials) { cred ->
                                CredentialCard(cred)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CredentialCard(credential: DecryptedCredential) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = credential.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = credential.username, style = MaterialTheme.typography.bodyMedium)
            // In a real app, we wouldn't show the password in plain text by default,
            // we'd have a copy button or a toggle visibility icon.
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "••••••••", style = MaterialTheme.typography.bodySmall)
        }
    }
}

