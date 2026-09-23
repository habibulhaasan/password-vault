package com.example.passwordvault.ui.vault

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.passwordvault.models.DecryptedCredential

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VaultScreen(
    vaultViewModel: VaultViewModel,
    onLogout: () -> Unit,
    onAddCredential: () -> Unit,
    onViewCredential: (String) -> Unit,
    onNavigateToGenerator: () -> Unit,
    onNavigateToCategories: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    val vaultState by vaultViewModel.vaultState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Vault") },
                actions = {
                    IconButton(onClick = onNavigateToGenerator) {
                        Icon(Icons.Filled.Build, contentDescription = "Generator")
                    }
                    IconButton(onClick = onNavigateToCategories) {
                        Icon(Icons.Filled.List, contentDescription = "Categories")
                    }
                    IconButton(onClick = onNavigateToSettings) {
                        Icon(Icons.Filled.Settings, contentDescription = "Settings")
                    }
                    TextButton(onClick = onLogout) {
                        Text("Logout")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = onAddCredential) {
                Icon(Icons.Filled.Add, contentDescription = "Add Password")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding).fillMaxSize()) {
            
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                placeholder = { Text("Search passwords...") },
                leadingIcon = { Icon(Icons.Filled.Search, contentDescription = null) },
                singleLine = true
            )

            Box(modifier = Modifier.weight(1f).fillMaxSize()) {
                when (val state = vaultState) {
                    is VaultState.Idle -> {
                        Text("Waiting for initialization...", modifier = Modifier.align(Alignment.Center))
                    }
                    is VaultState.DerivingKey -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.align(Alignment.Center)) {
                            CircularProgressIndicator()
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Unlocking vault... (This may take a second)")
                        }
                    }
                    is VaultState.Loading -> {
                        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.align(Alignment.Center)) {
                            CircularProgressIndicator()
                            Spacer(modifier = Modifier.height(16.dp))
                            Text("Fetching credentials...")
                        }
                    }
                    is VaultState.Error -> {
                        Text(
                            text = state.message,
                            color = MaterialTheme.colorScheme.error,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    }
                    is VaultState.Success -> {
                        val filteredList = state.credentials.filter { 
                            it.title.contains(searchQuery, ignoreCase = true) || 
                            it.username.contains(searchQuery, ignoreCase = true) 
                        }

                        if (filteredList.isEmpty()) {
                            Text("No passwords found.", modifier = Modifier.align(Alignment.Center))
                        } else {
                            LazyColumn(
                                modifier = Modifier.fillMaxSize(),
                                contentPadding = PaddingValues(16.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                items(filteredList) { cred ->
                                    CredentialCard(cred, onClick = { onViewCredential(cred.id) })
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CredentialCard(credential: DecryptedCredential, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().clickable { onClick() },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = credential.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = credential.username, style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = "••••••••", style = MaterialTheme.typography.bodySmall)
        }
    }
}
