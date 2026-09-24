package com.example.passwordvault.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.launch

/**
 * Settings screen offering a dark‑mode toggle, logout and optional account deletion.
 * The dark‑mode state is kept locally for demo purposes – integrate with DataStore or
 * a theming ViewModel for persistence.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onLogout: () -> Unit,
    onAccountDeleted: () -> Unit = {}
) {
    // Simple dark‑mode toggle – replace with real persistence later.
    var isDarkMode by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    Scaffold(
        topBar = { TopAppBar(title = { Text("Settings") }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(innerPadding)
                .padding(16.dp)
        ) {
            // Dark mode switch
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Dark Mode", style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
                Switch(checked = isDarkMode, onCheckedChange = { isDarkMode = it })
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Logout button
            Button(
                onClick = {
                    scope.launch {
                        FirebaseAuth.getInstance().signOut()
                        onLogout()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Log out")
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Delete account button
            Button(
                onClick = {
                    scope.launch {
                        FirebaseAuth.getInstance().currentUser?.delete()
                            ?.addOnSuccessListener { onAccountDeleted() }
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Delete Account")
            }
        }
    }
}
