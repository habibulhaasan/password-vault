package com.example.passwordvault.ui.generator

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun GeneratorScreen() {
    var length by remember { mutableStateOf(16f) }
    var useUppercase by remember { mutableStateOf(true) }
    var useNumbers by remember { mutableStateOf(true) }
    var useSymbols by remember { mutableStateOf(true) }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Password Generator", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))
        
        Text("Length: $length.toInt()")
        Slider(
            value = length,
            onValueChange = { length = it },
            valueRange = 8f..64f
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Uppercase (A-Z)")
            Switch(checked = useUppercase, onCheckedChange = { useUppercase = it })
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Numbers (0-9)")
            Switch(checked = useNumbers, onCheckedChange = { useNumbers = it })
        }
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("Symbols (!@#)")
            Switch(checked = useSymbols, onCheckedChange = { useSymbols = it })
        }
        
        Spacer(modifier = Modifier.height(32.dp))
        Button(onClick = { /* Generate and copy */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Generate Password")
        }
    }
}
