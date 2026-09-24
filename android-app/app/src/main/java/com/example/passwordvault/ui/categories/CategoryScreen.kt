package com.example.passwordvault.ui.categories

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Delete
import com.example.passwordvault.data.models.Category
import com.example.passwordvault.ui.categories.CategoryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryScreen(
    onBack: () -> Unit,
    viewModel: CategoryViewModel = viewModel()
) {
    val categories by viewModel.categories.collectAsState(initial = emptyList())
    val showDialog = remember { mutableStateOf(false) }
    val editingCategory = remember { mutableStateOf<Category?>(null) }
    val nameState = remember { mutableStateOf("") }
    val colorState = remember { mutableStateOf("#FFFFFF") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Categories") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.Filled.ArrowBack, contentDescription = "Back") } }
            )
        },
        floatingActionButton = {
            FloatingActionButton(onClick = {
                editingCategory.value = null
                nameState.value = ""
                colorState.value = "#FFFFFF"
                showDialog.value = true
            }) {
                Icon(Icons.Filled.Add, contentDescription = "Add Category")
            }
        }
    ) { innerPadding ->
        LazyColumn(modifier = Modifier.fillMaxSize().padding(innerPadding)) {
            items(categories) { category ->
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(text = category.name)
                    Text(text = "Color: ${category.colorHex}")
                    IconButton(onClick = {
                        editingCategory.value = category
                        nameState.value = category.name
                        colorState.value = category.colorHex
                        showDialog.value = true
                    }) { Icon(Icons.Filled.Edit, contentDescription = "Edit") }
                    IconButton(onClick = { viewModel.deleteCategory(category.id) }) { Icon(Icons.Filled.Delete, contentDescription = "Delete") }
                }
            }
        }

        if (showDialog.value) {
            AlertDialog(
                onDismissRequest = { showDialog.value = false },
                title = { Text(if (editingCategory.value == null) "Add Category" else "Edit Category") },
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
                            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                        )
                    }
                },
                confirmButton = {
                    Button(onClick = {
                        if (editingCategory.value == null) {
                            viewModel.addCategory(
                                Category(
                                    id = java.util.UUID.randomUUID().toString(),
                                    name = nameState.value,
                                    colorHex = colorState.value
                                )
                            )
                        } else {
                            val updated = editingCategory.value!!.copy(
                                name = nameState.value,
                                colorHex = colorState.value
                            )
                            viewModel.updateCategory(updated)
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
