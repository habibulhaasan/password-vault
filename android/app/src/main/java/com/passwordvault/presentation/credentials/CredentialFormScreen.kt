package com.passwordvault.presentation.credentials

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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import com.passwordvault.R
import com.passwordvault.data.model.Credential.CredentialFormData
import com.passwordvault.data.model.Category
import com.passwordvault.navigation.MainDestination
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class CredentialFormActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                CredentialFormScreen(
                    credentialId = intent.getStringExtra("credentialId"),
                    onSave = { finish() },
                    onCancel = { finish() },
                    viewModel = hiltViewModel()
                )
            }
        }
    }
}

@Composable
fun CredentialFormScreen(
    credentialId: String?,
    onSave: () -> Unit,
    onCancel: () -> Unit,
    viewModel: VaultViewModel
) {
    val isEditing = credentialId != null
    val categories = remember { mutableStateOf<List<Category>>(emptyList()) }

    val title by remember { mutableStateOf("") }
    val username by remember { mutableStateOf("") }
    val password by remember { mutableStateOf("") }
    val notes by remember { mutableStateOf("") }
    val websiteUrl by remember { mutableStateOf("") }
    val selectedCategoryId by remember { mutableStateOf<String?>(null) }
    val tags by remember { mutableStateOf<Set<String>>(emptySet()) }
    val tagInput by remember { mutableStateOf("") }
    val showPassword by remember { mutableStateOf(false) }
    val showGenerator by remember { mutableStateOf(false) }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val suggestedTags by remember { mutableStateOf<List<String>>(emptyList()) }

    // Load existing credential if editing
    androidx.compose.runtime.LaunchedEffect(credentialId) {
        if (isEditing) {
            // TODO: Load credential data
        }
    }

    val suggestedTagsList = suggestedTags

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(if (isEditing) "Edit Credential" else "Add Credential") },
                navigationIcon = { IconButton(onClick = onCancel) { Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack, contentDescription = "Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer
                ),
                actions = {
                    if (isEditing) {
                        IconButton(onClick = { /* TODO: Delete */ }) {
                            Icon(imageVector = androidx.compose.material.icons.Icons.Default.Delete, contentDescription = "Delete")
                        }
                    }
                }
            )
        }
    ) { padding ->
        androidx.compose.foundation.layout.Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Title
            TextField(
                value = title,
                onValueChange = { title = it },
                label = { Text("Title *") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Username
            TextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Password with generator
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
                ) {
                    TextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text("Password") },
                        trailingIcon = {
                            IconButton(onClick = { showPassword = !showPassword }) {
                                Icon(
                                    imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                                    contentDescription = if (showPassword) "Hide password" else "Show password"
                                )
                            }
                        },
                        visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    androidx.compose.material3.OutlinedButton(onClick = { showGenerator = true }) {
                        Text("Generate")
                    }
                }

                // Password strength indicator
                if (password.isNotBlank()) {
                    val strength = com.passwordvault.domain.usecase.PasswordGenerator.getStrength(password)
                    androidx.compose.material3.LinearProgressIndicator(
                        progress = strength.score / 4f,
                        color = androidx.compose.material3.MaterialTheme.colorScheme.getColor(strength.color)
                    )
                    Text(text = strength.label, fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }

            // Notes
            TextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("Notes") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3,
                maxLines = 5
            )

            // Website URL
            TextField(
                value = websiteUrl,
                onValueChange = { websiteUrl = it },
                label = { Text("Website URL") },
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Url,
                    imeAction = androidx.compose.ui.text.input.ImeAction.Next
                ),
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Category dropdown
            // TODO: Implement category dropdown

            // Tags
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
                ) {
                    TextField(
                        value = tagInput,
                        onValueChange = { tagInput = it },
                        label = { Text("Add tag") },
                        modifier = Modifier.weight(1f),
                        singleLine = true
                    )
                    Button(onClick = {
                        if (tagInput.isNotBlank()) {
                            tags.value = tags.value + tagInput.trim()
                            tagInput = ""
                        }
                    }) {
                        Text("Add")
                    }
                }

                // Tag chips
                if (tags.value.isNotEmpty()) {
                    androidx.compose.foundation.layout.FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        tags.value.forEach { tag ->
                            androidx.compose.material3.Chip(
                                onClick = { tags.value = tags.value - tag },
                                colors = androidx.compose.material3.ChipDefaults.chipColors(
                                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.secondaryContainer
                                )
                            ) {
                                Text(text = tag, fontSize = 12.sp)
                                androidx.compose.material.icons.Icons.Default.Close.let { icon ->
                                    Icon(imageVector = icon, contentDescription = "Remove", modifier = Modifier.size(16.dp).padding(start = 4.dp))
                                }
                            }
                        }
                    }
                }

                // Suggestions
                if (suggestedTagsList.isNotEmpty() && tagInput.isNotBlank()) {
                    androidx.compose.foundation.layout.FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        suggestedTagsList.forEach { suggestion ->
                            androidx.compose.material3.FilterChip(
                                selected = tags.value.contains(suggestion),
                                onClick = { tags.value = tags.value + suggestion },
                                label = { Text(suggestion) }
                            )
                        }
                    }
                }
            }

            error?.let {
                Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                androidx.compose.material3.OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) {
                    Text("Cancel")
                }
                Button(
                    onClick = {
                        if (title.isNotBlank()) {
                            val formData = CredentialFormData(
                                title = title,
                                username = username,
                                password = password,
                                notes = notes.ifBlank { null },
                                websiteUrl = websiteUrl.ifBlank { null },
                                categoryId = selectedCategoryId,
                                tags = tags.value.toList()
                            )
                            lifecycleScope.launch {
                                if (isEditing) {
                                    viewModel.updateCredential(credentialId!!, formData)
                                } else {
                                    viewModel.createCredential(formData)
                                }
                                onSave()
                            }
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !loading && title.isNotBlank()
                ) {
                    if (loading) androidx.compose.material3.ProgressIndicator() else Text(if (isEditing) "Save" else "Add")
                }
            }
        }
    }
}

private fun String.ifBlank(default: String?): String? = if (isBlank()) default else this