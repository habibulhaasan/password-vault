package com.example.passwordvault.ui.generator

import androidx.compose.foundation.layout.*
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons

import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PasswordGeneratorScreen(
    viewModel: PasswordGeneratorViewModel = viewModel(),
    onCredentialSaved: (credentialId: String) -> Unit,
    onCancel: () -> Unit,
) {
    val password by viewModel.generatedPassword.collectAsState()
    val length by viewModel.length.collectAsState()
    val includeUpper by viewModel.includeUpper.collectAsState()
    val includeLower by viewModel.includeLower.collectAsState()
    val includeNumbers by viewModel.includeNumbers.collectAsState()
    val includeSymbols by viewModel.includeSymbols.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Password Generator") },
                navigationIcon = {
                    IconButton(onClick = onCancel) {
                        Icon(Icons.Filled.ArrowBack, contentDescription = "Cancel")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedTextField(
                value = viewModel.titleState.value,
                onValueChange = { viewModel.titleState.value = it },
                label = { Text("Title") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = viewModel.usernameState.value,
                onValueChange = { viewModel.usernameState.value = it },
                label = { Text("Username") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = viewModel.urlState.value,
                onValueChange = { viewModel.urlState.value = it },
                label = { Text("URL (optional)") },
                modifier = Modifier.fillMaxWidth()
            )
            OutlinedTextField(
                value = viewModel.notesState.value,
                onValueChange = { viewModel.notesState.value = it },
                label = { Text("Notes (optional)") },
                modifier = Modifier.fillMaxWidth()
            )

            Text("Length: $length")
            Slider(
                value = length.toFloat(),
                onValueChange = { viewModel.setLength(it.toInt()) },
                valueRange = 8f..32f,
                steps = 24,
                modifier = Modifier.fillMaxWidth()
            )

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Uppercase")
                Switch(checked = includeUpper, onCheckedChange = { viewModel.setIncludeUpper(it) })
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Lowercase")
                Switch(checked = includeLower, onCheckedChange = { viewModel.setIncludeLower(it) })
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Numbers")
                Switch(checked = includeNumbers, onCheckedChange = { viewModel.setIncludeNumbers(it) })
            }
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Symbols")
                Switch(checked = includeSymbols, onCheckedChange = { viewModel.setIncludeSymbols(it) })
            }

            OutlinedTextField(
                value = password,
                onValueChange = {},
                label = { Text("Generated Password") },
                readOnly = true,
                trailingIcon = {
                    IconButton(onClick = { viewModel.generatePassword() }) {
                        Icon(Icons.Filled.Refresh, contentDescription = "Generate")
                    }
                },
                modifier = Modifier.fillMaxWidth()
            )

            Row(
                horizontalArrangement = Arrangement.End,
                modifier = Modifier.fillMaxWidth()
            ) {
                TextButton(onClick = onCancel) { Text("Cancel") }
                Spacer(modifier = Modifier.width(8.dp))
                Button(onClick = {
                    viewModel.saveCredential(
                        title = viewModel.titleState.value,
                        username = viewModel.usernameState.value,
                        url = viewModel.urlState.value,
                        notes = viewModel.notesState.value
                    ) { credentialId ->
                        onCredentialSaved(credentialId)
                    }
                }) { Text("Save") }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PasswordGeneratorScreenPreview() {
    PasswordGeneratorScreen(
        viewModel = viewModel(),
        onCredentialSaved = {},
        onCancel = {}
    )
}

