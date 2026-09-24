package com.example.passwordvault.ui.tags

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.passwordvault.data.models.Tag
import com.example.passwordvault.ui.tags.TagViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TagScreen(
    onBack: () -> Unit,
    viewModel: TagViewModel = viewModel()
) {
    val tags by viewModel.tags.collectAsState(initial = emptyList())
    val showDialog = remember { mutableStateOf(false) }
    val editingTag = remember { mutableStateOf<Tag?>(null) }
    val nameState = remember { mutableStateOf("") }
    val colorState = remember { mutableStateOf("#FFFFFF") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Tags") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Default.ArrowBack, contentDescription = "Back") } }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                editingTag.value = null
                nameState.value = ""
                colorState.value = "#FFFFFF"
                showDialog.value = true
            }) {
                Icon(Icons.Default.Add, contentDescription = "Add Tag")
            }
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            items(tags) { tag ->
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = tag.name)
                    Text(text = "Color: ${tag.colorHex}")
                    Row {
                        IconButton(onClick = {
                            editingTag.value = tag
                            nameState.value = tag.name
                            colorState.value = tag.colorHex
                            showDialog.value = true
                        }) {
                            Icon(Icons.Default.Edit, contentDescription = "Edit")
                        }
                        IconButton(onClick = { viewModel.deleteTag(tag.id) }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete")
                        }
                    }
                }
            }
        }

        if (showDialog.value) {
            AlertDialog(
                onDismissRequest = { showDialog.value = false },
                title = { Text(if (editingTag.value == null) "Add Tag" else "Edit Tag") },
                text = {
                    Column {
                        OutlinedTextField(
                            value = nameState.value,
                            onValueChange = { nameState.value = it },
                            label = { Text("Name") },
                            modifier = Modifier.fillMaxWidth()
                        )
                        OutlinedTextField(
                            value = colorState.value,
                            onValueChange = { colorState.value = it },
                            label = { Text("Color Hex") },
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 8.dp)
                        )
                    }
                },
                confirmButton = {
                    Button(onClick = {
                        if (editingTag.value == null) {
                            viewModel.addTag(
                                Tag(
                                    id = java.util.UUID.randomUUID().toString(),
                                    name = nameState.value,
                                    colorHex = colorState.value
                                )
                            )
                        } else {
                            val updated = editingTag.value!!.copy(
                                name = nameState.value,
                                colorHex = colorState.value
                            )
                            viewModel.updateTag(updated)
                        }
                        showDialog.value = false
                    }) { Text("Save") }
                },
                dismissButton = {
                    Button(onClick = { showDialog.value = false }) { Text("Cancel") }
                }
            )
        }
    }
}
