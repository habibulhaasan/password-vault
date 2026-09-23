package com.example.passwordvault.ui.settings

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SettingsScreen() {
    var biometricEnabled by remember { mutableStateOf(false) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Settings", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Enable Fingerprint/Biometrics")
            Switch(checked = biometricEnabled, onCheckedChange = { biometricEnabled = it })
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = { /* Handle change master password */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Change Master Password")
        }
    }
}
