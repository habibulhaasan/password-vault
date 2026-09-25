package com.passwordvault.presentation.tags

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import com.passwordvault.R
import com.passwordvault.data.model.Tag.TagWithCount
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class TagsActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                TagsScreen(viewModel = hiltViewModel())
            }
        }
    }
}

@Composable
fun TagsScreen(viewModel: VaultViewModel) {
    val tags by viewModel.tags.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    val renameTag by remember { mutableStateOf<TagWithCount?>(null) }
    val newTagName by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tags") },
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Stats
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                StatCard(title = "Total Tags", value = tags.size.toString(), icon = androidx.compose.material.icons.Icons.Default.Label)
                StatCard(title = "Tagged Items", value = viewModel.totalTaggedCredentials.toString(), icon = androidx.compose.material.icons.Icons.Default.Key)
            }

            error?.let {
                androidx.compose.material3.Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, modifier = Modifier.fillMaxWidth())
            }

            if (tags.isEmpty()) {
                androidx.compose.material3.Text(text = "No tags yet", fontSize = 16.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth().padding(16.dp))
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(tags) { tag ->
                        TagRow(
                            tag = tag,
                            onRename = {
                                renameTag.value = tag
                                newTagName.value = tag.name
                            },
                            onDelete = {
                                lifecycleScope.launch { viewModel.deleteTag(tag.name) }
                            }
                        )
                    }
                }
            }
        }
    }

    // Rename Dialog
    renameTag?.let { tag ->
        androidx.compose.material3.AlertDialog(
            onDismissRequest = { renameTag.value = null },
            title = { Text("Rename Tag") },
            text = {
                TextField(
                    value = newTagName,
                    onValueChange = { newTagName = it },
                    label = { Text("New Tag Name") },
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    singleLine = true
                )
            },
            confirmButton = {
                androidx.compose.material3.TextButton(onClick = {
                    if (newTagName.isNotBlank() && newTagName != tag.name) {
                        lifecycleScope.launch {
                            viewModel.renameTag(tag.name, newTagName.trim())
                            renameTag.value = null
                        }
                    }
                }) {
                    Text("Rename")
                }
            },
            dismissButton = {
                androidx.compose.material3.TextButton(onClick = { renameTag.value = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
fun TagRow(
    tag: TagWithCount,
    onRename: () -> Unit,
    onDelete: () -> Unit
) {
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
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = androidx.compose.material.icons.Icons.Default.Label, contentDescription = "Tag", tint = androidx.compose.material3.MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp).padding(end = 12.dp))
                    Column {
                        Text(text = tag.name, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                        Text(text = "${tag.count} credential${if (tag.count != 1) "s" else ""}", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }

                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(onClick = onRename) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Edit, contentDescription = "Rename")
                    }
                    IconButton(onClick = onDelete) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Delete, contentDescription = "Delete", tint = androidx.compose.material3.MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector) {
    Card(
        modifier = Modifier
            .weight(1f)
            .fillMaxWidth()
            .padding(8.dp)
    ) {
        androidx.compose.foundation.layout.Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Icon(imageVector = icon, contentDescription = "", tint = androidx.compose.material3.MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp))
                Text(text = value, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                Text(text = title, fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}