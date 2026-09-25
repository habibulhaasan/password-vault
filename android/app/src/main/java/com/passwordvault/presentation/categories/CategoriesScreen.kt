package com.passwordvault.presentation.categories

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
import com.passwordvault.data.model.Category
import com.passwordvault.data.model.Category.CategoryFormData
import com.passwordvault.navigation.MainDestination
import com.passwordvault.presentation.categories.CategoryViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class CategoriesActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                CategoriesScreen(viewModel = hiltViewModel())
            }
        }
    }
}

@Composable
fun CategoriesScreen(viewModel: CategoryViewModel) {
    val showAddDialog by remember { mutableStateOf(false) }
    val newCategoryLabel by remember { mutableStateOf("") }
    val newCategoryIcon by remember { mutableStateOf("folder") }
    val editingCategory by remember { mutableStateOf<Category?>(null) }
    val editLabel by remember { mutableStateOf("") }
    val editIcon by remember { mutableStateOf("folder") }

    val categories by viewModel.categories.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    val systemCategories = categories.filter { !it.isCustom }
    val customCategories = categories.filter { it.isCustom }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Categories") },
                navigationIcon = { IconButton(onClick = { /* Nav back */ }) { Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack, contentDescription = "Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer
                ),
                actions = {
                    IconButton(onClick = {
                        newCategoryLabel = ""
                        newCategoryIcon = "folder"
                        showAddDialog = true
                    }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Add, contentDescription = "Add category")
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
            error?.let {
                androidx.compose.material3.Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, modifier = Modifier.fillMaxWidth())
            }

            // System Categories
            androidx.compose.material3.Text(text = "System Categories", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth())
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(systemCategories) { category ->
                    CategoryRow(
                        category = category,
                        isSystem = true,
                        onEdit = { cat ->
                            editingCategory = cat
                            editLabel = cat.label
                            editIcon = cat.icon
                        },
                        onDelete = { /* System categories can't be deleted, only hidden */ },
                        viewModel = viewModel
                    )
                }
            }

            // Custom Categories
            if (customCategories.isNotEmpty()) {
                androidx.compose.material3.Text(text = "Custom Categories", fontSize = 16.sp, fontWeight = FontWeight.Medium, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth())
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(customCategories) { category ->
                        CategoryRow(
                            category = category,
                            isSystem = false,
                            onEdit = { cat ->
                                editingCategory = cat
                                editLabel = cat.label
                                editIcon = cat.icon
                            },
                            onDelete = { viewModel.deleteCategory(cat.id) },
                            viewModel = viewModel
                        )
                    }
                }
            } else {
                androidx.compose.material3.Text(text = "No custom categories yet", fontSize = 14.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.fillMaxWidth().padding(16.dp))
            }
        }
    }

    // Add Category Dialog
    if (showAddDialog) {
        CategoryDialog(
            title = "Add Category",
            label = newCategoryLabel,
            onLabelChange = { newCategoryLabel = it },
            icon = newCategoryIcon,
            onIconChange = { newCategoryIcon = it },
            onConfirm = {
                if (newCategoryLabel.isNotBlank()) {
                    lifecycleScope.launch {
                        viewModel.createCategory(CategoryFormData(newCategoryLabel.trim(), newCategoryIcon))
                        showAddDialog = false
                    }
                }
            },
            onDismiss = { showAddDialog = false }
        )
    }

    // Edit Category Dialog
    editingCategory?.let { cat ->
        CategoryDialog(
            title = "Edit Category",
            label = editLabel,
            onLabelChange = { editLabel = it },
            icon = editIcon,
            onIconChange = { editIcon = it },
            onConfirm = {
                if (editLabel.isNotBlank()) {
                    lifecycleScope.launch {
                        viewModel.updateCategory(cat.id, CategoryFormData(editLabel.trim(), editIcon))
                        editingCategory = null
                    }
                }
            },
            onDismiss = { editingCategory = null }
        )
    }
}

@Composable
fun CategoryRow(
    category: Category,
    isSystem: Boolean,
    onEdit: (Category) -> Unit,
    onDelete: () -> Unit,
    viewModel: CategoryViewModel
) {
    val icon = getCategoryIcon(category.icon)

    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = { onEdit(category) }
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
                    Icon(imageVector = icon, contentDescription = category.label, tint = androidx.compose.material3.MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp).padding(end = 12.dp))
                    Column {
                        Text(text = category.label, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                        if (isSystem) {
                            Text(text = "System", fontSize = 11.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        } else {
                            Text(text = "Custom", fontSize = 11.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.primary)
                        }
                    }
                }

                if (!isSystem) {
                    IconButton(onClick = { onDelete() }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Delete, contentDescription = "Delete", tint = androidx.compose.material3.MaterialTheme.colorScheme.error)
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryDialog(
    title: String,
    label: String,
    onLabelChange: (String) -> Unit,
    icon: String,
    onIconChange: (String) -> Unit,
    onConfirm: () -> Unit,
    onDismiss: () -> Unit
) {
    val icons = listOf(
        "folder", "key", "shield", "lock", "star", "bookmark", "archive", "file",
        "cloud", "server", "smartphone", "mail", "credit-card", "database",
        "globe", "briefcase", "landmark", "users", "shopping-cart", "graduation-cap",
        "code", "building-2", "heart", "gamepad", "more"
    )

    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title) },
        text = {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                TextField(
                    value = label,
                    onValueChange = onLabelChange,
                    label = { Text("Category Name") },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true
                )
                androidx.compose.material3.Text(text = "Icon", fontSize = 14.sp, fontWeight = FontWeight.Medium, modifier = Modifier.fillMaxWidth())
                androidx.compose.foundation.lazy.LazyRow(
                    modifier = Modifier.fillMaxWidth().height(60.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(icons) { iconName ->
                        val selected = iconName == icon
                        androidx.compose.material3.Chip(
                            onClick = { onIconChange(iconName) },
                            selected = selected,
                            colors = androidx.compose.material3.ChipDefaults.chipColors(
                                containerColor = if (selected) androidx.compose.material3.MaterialTheme.colorScheme.primaryContainer else androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerHighest
                            )
                        ) {
                            Icon(imageVector = getCategoryIcon(iconName), contentDescription = iconName, tint = if (selected) androidx.compose.material3.MaterialTheme.colorScheme.onPrimaryContainer else androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.size(24.dp).padding(8.dp))
                        }
                    }
                }
            }
        },
        confirmButton = {
            androidx.compose.material3.TextButton(onClick = onConfirm) {
                Text("Save")
            }
        },
        dismissButton = {
            androidx.compose.material3.TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

private fun getCategoryIcon(iconName: String): androidx.compose.ui.graphics.vector.ImageVector {
    return when (iconName) {
        "globe" -> androidx.compose.material.icons.Icons.Default.Public
        "briefcase" -> androidx.compose.material.icons.Icons.Default.Work
        "landmark" -> androidx.compose.material.icons.Icons.Default.AccountBalance
        "users" -> androidx.compose.material.icons.Icons.Default.Group
        "shopping-cart" -> androidx.compose.material.icons.Icons.Default.ShoppingCart
        "graduation-cap" -> androidx.compose.material.icons.Icons.Default.School
        "code" -> androidx.compose.material.icons.Icons.Default.Code
        "building-2" -> androidx.compose.material.icons.Icons.Default.Domain
        "heart" -> androidx.compose.material.icons.Icons.Default.Favorite
        "gamepad" -> androidx.compose.material.icons.Icons.Default.SportsEsports
        "more" -> androidx.compose.material.icons.Icons.Default.MoreHoriz
        "folder" -> androidx.compose.material.icons.Icons.Default.Folder
        "key" -> androidx.compose.material.icons.Icons.Default.Key
        "shield" -> androidx.compose.material.icons.Icons.Default.Shield
        "lock" -> androidx.compose.material.icons.Icons.Default.Lock
        "star" -> androidx.compose.material.icons.Icons.Default.Star
        "bookmark" -> androidx.compose.material.icons.Icons.Default.Bookmark
        "archive" -> androidx.compose.material.icons.Icons.Default.Archive
        "file" -> androidx.compose.material.icons.Icons.Default.Description
        "cloud" -> androidx.compose.material.icons.Icons.Default.Cloud
        "server" -> androidx.compose.material.icons.Icons.Default.Dns
        "smartphone" -> androidx.compose.material.icons.Icons.Default.PhoneAndroid
        "mail" -> androidx.compose.material.icons.Icons.Default.Mail
        "credit-card" -> androidx.compose.material.icons.Icons.Default.CreditCard
        "database" -> androidx.compose.material.icons.Icons.Default.Storage
        else -> androidx.compose.material.icons.Icons.Default.Folder
    }
}