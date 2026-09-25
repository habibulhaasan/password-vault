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
import com.passwordvault.data.model.Credential.DecryptedCredential
import com.passwordvault.navigation.MainDestination
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class CredentialDetailActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                CredentialDetailScreen(
                    credentialId = intent.getStringExtra("credentialId") ?: "",
                    onEdit = { finish() },
                    onDelete = { finish() },
                    viewModel = hiltViewModel()
                )
            }
        }
    }
}

@Composable
fun CredentialDetailScreen(
    credentialId: String,
    onEdit: (DecryptedCredential) -> Unit,
    onDelete: () -> Unit,
    viewModel: VaultViewModel
) {
    val credentials by viewModel.credentials.collectAsState()
    val credential = credentials.find { it.id == credentialId }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(credential?.title ?? "Credential") },
                navigationIcon = { IconButton(onClick = { /* Nav back */ }) { Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack, contentDescription = "Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer
                ),
                actions = {
                    IconButton(onClick = { /* TODO: Copy password */ }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Key, contentDescription = "Copy password")
                    }
                    IconButton(onClick = { /* TODO: Edit */ }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.Edit, contentDescription = "Edit")
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
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            credential?.let { cred ->
                // Title & Category
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val category = com.passwordvault.data.model.SystemCategories.getById(cred.categoryId ?: "")
                    val categoryIcon = category?.icon ?: "folder"
                    val categoryLabel = category?.label ?: "Other"

                    Icon(
                        imageVector = getCategoryIcon(categoryIcon),
                        contentDescription = categoryLabel,
                        tint = androidx.compose.material3.MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(28.dp).padding(end = 12.dp)
                    )
                    Text(text = cred.title, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                }

                // Fields
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    DetailField(
                        label = "Username",
                        value = cred.username,
                        icon = androidx.compose.material.icons.Icons.Default.Person,
                        onCopy = { copyToClipboard(cred.username) }
                    )
                    DetailField(
                        label = "Password",
                        value = "••••••••",
                        icon = androidx.compose.material.icons.Icons.Default.Key,
                        isPassword = true,
                        onCopy = { copyToClipboard(cred.password) },
                        onReveal = { /* TODO: Show password in dialog */ }
                    )
                    cred.notes?.let { notes ->
                        DetailField(
                            label = "Notes",
                            value = notes,
                            icon = androidx.compose.material.icons.Icons.Default.Note,
                            onCopy = { copyToClipboard(notes) }
                        )
                    }
                    cred.websiteUrl?.let { url ->
                        DetailField(
                            label = "Website",
                            value = url,
                            icon = androidx.compose.material.icons.Icons.Default.Public,
                            onCopy = { copyToClipboard(url) },
                            onClick = { /* TODO: Open in browser */ }
                        )
                    }
                }

                // Tags
                if (cred.tags.isNotEmpty()) {
                    androidx.compose.material3.Text(text = "Tags", fontSize = 16.sp, fontWeight = FontWeight.Medium, modifier = Modifier.fillMaxWidth())
                    androidx.compose.foundation.layout.FlowRow(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        cred.tags.forEach { tag ->
                            androidx.compose.material3.Chip(
                                colors = androidx.compose.material3.ChipDefaults.chipColors(
                                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.secondaryContainer
                                )
                            ) {
                                Text(text = tag, fontSize = 12.sp)
                            }
                        }
                    }
                }

                // Timestamps
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(text = "Created: ${formatDate(cred.createdAt)}", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                    Text(text = "Updated: ${formatDate(cred.updatedAt)}", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                    cred.lastLoginAt?.let {
                        Text(text = "Last login: ${formatDate(it)}", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
fun DetailField(
    label: String,
    value: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    isPassword: Boolean = false,
    onCopy: () -> Unit,
    onReveal: (() -> Unit)? = null,
    onClick: (() -> Unit)? = null
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        onClick = onClick
    ) {
        androidx.compose.foundation.layout.Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = icon, contentDescription = label, tint = androidx.compose.material3.MaterialTheme.colorScheme.primary, modifier = Modifier.size(20.dp).padding(end = 8.dp))
                        Text(text = label, fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    androidx.compose.material3.TextButton(onClick = onCopy) {
                        Text("Copy")
                    }
                }
                Text(
                    text = value,
                    fontSize = 16.sp,
                    fontFamily = if (isPassword) androidx.compose.ui.text.font.FontFamily.Monospace else androidx.compose.ui.text.font.FontFamily.Default,
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}

private fun formatDate(instant: kotlinx.datetime.Instant): String {
    return java.text.SimpleDateFormat("MMM d, yyyy HH:mm", java.util.Locale.getDefault())
        .format(java.util.Date(instant.toEpochMilliseconds()))
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
    // TODO: Show toast
}