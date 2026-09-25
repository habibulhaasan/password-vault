package com.passwordvault.presentation.vault

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import com.passwordvault.R
import com.passwordvault.data.model.Credential.CredentialFormData
import com.passwordvault.data.model.Credential.DecryptedCredential
import com.passwordvault.navigation.MainDestination
import com.passwordvault.navigation.NavigationGraph
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                MainNavHost()
            }
        }
    }
}

@Composable
fun MainNavHost() {
    val navController = androidx.navigation.compose.rememberNavController()
    val vaultViewModel: VaultViewModel = hiltViewModel()

    androidx.navigation.compose.NavHost(navController, startDestination = MainDestination.Vault.route) {
        androidx.navigation.compose.composable(MainDestination.Vault.route) {
            VaultScreen(
                onAddCredential = { navController.navigate(MainDestination.CredentialForm.route) },
                onEditCredential = { credential: DecryptedCredential ->
                    navController.navigate("${MainDestination.CredentialForm.route}/$credential.id")
                },
                onCredentialClick = { credential: DecryptedCredential ->
                    navController.navigate("${MainDestination.CredentialDetail.route}/${credential.id}")
                },
                viewModel = vaultViewModel
            )
        }
        androidx.navigation.compose.composable(
            route = "${MainDestination.CredentialForm.route}?credentialId=${MainDestination.CredentialForm.credentialIdArg}",
            arguments = listOf(androidx.navigation.compose.navArgument(MainDestination.CredentialForm.credentialIdArg) { type = androidx.navigation.NavType.StringType; defaultValue = "" })
        ) { backStackEntry ->
            val credentialId = backStackEntry.getString(MainDestination.CredentialForm.credentialIdArg) ?: ""
            val isEditing = credentialId.isNotBlank()
            CredentialFormScreen(
                credentialId = if (isEditing) credentialId else null,
                onSave = { navController.popBackStack() },
                onCancel = { navController.popBackStack() },
                viewModel = vaultViewModel
            )
        }
        androidx.navigation.compose.composable(
            route = "${MainDestination.CredentialDetail.route}/${MainDestination.CredentialDetail.credentialIdArg}",
            arguments = listOf(androidx.navigation.compose.navArgument(MainDestination.CredentialDetail.credentialIdArg) { type = androidx.navigation.NavType.StringType })
        ) { backStackEntry ->
            val credentialId = backStackEntry.getString(MainDestination.CredentialDetail.credentialIdArg) ?: ""
            CredentialDetailScreen(
                credentialId = credentialId,
                onEdit = { credential: DecryptedCredential ->
                    navController.navigate("${MainDestination.CredentialForm.route}/$credential.id")
                },
                onDelete = { navController.popBackStack() },
                viewModel = vaultViewModel
            )
        }
        androidx.navigation.compose.composable(MainDestination.Categories.route) {
            CategoriesScreen(viewModel = hiltViewModel())
        }
        androidx.navigation.compose.composable(MainDestination.Tags.route) {
            TagsScreen(viewModel = hiltViewModel())
        }
        androidx.navigation.compose.composable(MainDestination.Generator.route) {
            GeneratorScreen(viewModel = hiltViewModel())
        }
        androidx.navigation.compose.composable(MainDestination.Settings.route) {
            SettingsScreen(viewModel = hiltViewModel())
        }
    }
}

@Composable
fun VaultScreen(
    onAddCredential: () -> Unit,
    onEditCredential: (DecryptedCredential) -> Unit,
    onCredentialClick: (DecryptedCredential) -> Unit,
    viewModel: VaultViewModel
) {
    val searchQuery by remember { mutableStateOf("") }
    val selectedCategoryId by remember { mutableStateOf<String?>(null) }
    val selectedTags by remember { mutableStateOf<Set<String>>(emptySet()) }

    val credentials by viewModel.credentials.collectAsState()
    val loading by viewModel.loading.collectAsState()
    val status by viewModel.status.collectAsState()
    val categories by remember { mutableStateOf<List<com.passwordvault.data.model.Category>>(emptyList()) }

    val filteredCredentials = credentials.filter { cred ->
        val matchesSearch = searchQuery.isBlank() ||
            cred.title.lowercase().contains(searchQuery.lowercase()) ||
            cred.username.lowercase().contains(searchQuery.lowercase()) ||
            cred.websiteUrl?.lowercase().contains(searchQuery.lowercase()) == true
        val matchesCategory = selectedCategoryId == null || cred.categoryId == selectedCategoryId
        val matchesTags = selectedTags.isEmpty() || selectedTags.all { it in cred.tags }
        matchesSearch && matchesCategory && matchesTags
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Password Vault") },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer
                ),
                actions = {
                    IconButton(onClick = { viewModel.lockVault() }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Lock, contentDescription = "Lock Vault")
                    }
                }
            )
        },
        floatingActionButton = {
            androidx.compose.material3.FloatingActionButton(
                onClick = onAddCredential,
                containerColor = androidx.compose.material3.MaterialTheme.colorScheme.primary
            ) {
                Icon(imageVector = androidx.compose.material.icons.Icons.Default.Add, contentDescription = "Add credential")
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Search bar
                TextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    label = { Text("Search credentials...") },
                    leadingIcon = { Icon(imageVector = androidx.compose.material.icons.Icons.Default.Search, contentDescription = "Search") },
                    trailingIcon = {
                        if (searchQuery.isNotBlank()) {
                            IconButton(onClick = { searchQuery = "" }) {
                                Icon(imageVector = androidx.compose.material.icons.Icons.Default.Close, contentDescription = "Clear search")
                            }
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                )

                // Filter chips (categories + tags)
                // TODO: Implement filter chips row

                // Credential list
                when {
                    status == VaultViewModel.VaultStatus.LOCKED -> {
                        LockedState(onUnlockClick = { /* Navigate to unlock */ })
                    }
                    loading -> {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            androidx.compose.material3.CircularProgressIndicator()
                        }
                    }
                    filteredCredentials.isEmpty() -> {
                        EmptyState(
                            icon = androidx.compose.material.icons.Icons.Default.Lock,
                            title = "No credentials yet",
                            subtitle = "Tap + to add your first credential",
                            actionText = "Add Credential",
                            onAction = onAddCredential
                        )
                    }
                    else -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                            contentPadding = androidx.compose.foundation.layout.PaddingValues(bottom = 80.dp)
                        ) {
                            items(filteredCredentials) { credential ->
                                CredentialCard(
                                    credential = credential,
                                    onClick = { onCredentialClick(credential) },
                                    onEdit = { onEditCredential(credential) },
                                    onCopyUsername = { copyToClipboard(credential.username) },
                                    onCopyPassword = { copyToClipboard(credential.password) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun LockedState(onUnlockClick: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = androidx.compose.material.icons.Icons.Default.Lock,
                contentDescription = "Locked",
                tint = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(64.dp)
            )
            Text(text = "Vault Locked", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text(text = "Tap to unlock", color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
            Button(onClick = onUnlockClick) {
                Text("Unlock Vault")
            }
        }
    }
}

@Composable
fun EmptyState(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String,
    actionText: String,
    onAction: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = "",
                tint = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(64.dp)
            )
            Text(text = title, fontSize = 20.sp, fontWeight = FontWeight.Medium)
            Text(text = subtitle, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
            Button(onClick = onAction) {
                Text(actionText)
            }
        }
    }
}

@Composable
fun CredentialCard(
    credential: DecryptedCredential,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onCopyUsername: () -> Unit,
    onCopyPassword: () -> Unit
) {
    val category = com.passwordvault.data.model.SystemCategories.getById(credential.categoryId ?: "")
    val categoryIcon = category?.icon ?: "folder"
    val categoryLabel = category?.label ?: "Other"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .fillMaxHeight(),
        onClick = onClick
    ) {
        androidx.compose.foundation.layout.Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = getCategoryIcon(categoryIcon),
                            contentDescription = categoryLabel,
                            tint = androidx.compose.material3.MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(20.dp).padding(end = 8.dp)
                        )
                        Text(text = credential.title, fontSize = 16.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = androidx.compose.ui.text.TextOverflow.Ellipsis)
                    }

                    // Action menu
                    androidx.compose.material3.Menu(
                        onDismissRequest = {},
                        anchor = androidx.compose.material3.MenuAnchor(remember { androidx.compose.material3.MenuAnchor() })
                    ) {
                        androidx.compose.material3.MenuItem(
                            onClick = { onCopyUsername() },
                            text = { Text("Copy Username") },
                            leadingIcon = { Icon(imageVector = androidx.compose.material.icons.Icons.Default.ContentCopy, contentDescription = "Copy") }
                        )
                        androidx.compose.material3.MenuItem(
                            onClick = { onCopyPassword() },
                            text = { Text("Copy Password") },
                            leadingIcon = { Icon(imageVector = androidx.compose.material.icons.Icons.Default.Key, contentDescription = "Copy") }
                        )
                        androidx.compose.material3.MenuItem(
                            onClick = { onEdit() },
                            text = { Text("Edit") },
                            leadingIcon = { Icon(imageVector = androidx.compose.material.icons.Icons.Default.Edit, contentDescription = "Edit") }
                        )
                    } anchor: (androidx.compose.material3.MenuAnchor) -> {
                        IconButton(onClick = { anchor.open() }) {
                            Icon(imageVector = androidx.compose.material.icons.Icons.Default.MoreVert, contentDescription = "More options")
                        }
                    }
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(8.dp)
                ) {
                    Text(text = credential.username, fontSize = 14.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, maxLines = 1, overflow = androidx.compose.ui.text.TextOverflow.Ellipsis, modifier = Modifier.weight(1f))
                    Text(text = "••••••••", fontSize = 14.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace)
                }

                // Tags row
                if (credential.tags.isNotEmpty()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        credential.tags.take(3).forEach { tag ->
                            androidx.compose.material3.Chip(
                                onClick = {},
                                colors = androidx.compose.material3.ChipDefaults.chipColors(
                                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.secondaryContainer
                                )
                            ) {
                                Text(text = tag, fontSize = 11.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSecondaryContainer)
                            }
                        }
                        if (credential.tags.size > 3) {
                            androidx.compose.material3.Chip(
                                colors = androidx.compose.material3.ChipDefaults.chipColors(
                                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerHighest
                                )
                            ) {
                                Text(text = "+${credential.tags.size - 3}", fontSize = 11.sp)
                            }
                        }
                    }
                }

                // Website URL
                credential.websiteUrl?.let { url ->
                    Text(text = url, fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.primary, maxLines = 1, overflow = androidx.compose.ui.text.TextOverflow.Ellipsis, modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
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

private fun copyToClipboard(text: String) {
    val context = androidx.compose.ui.platform.LocalContext.current
    val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
    val clip = android.content.ClipData.newPlainText("Password Vault", text)
    clipboard.primaryClip = clip
    // TODO: Show toast "Copied to clipboard"
}