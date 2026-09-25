package com.passwordvault.presentation.generator

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Slider
import androidx.compose.material3.Switch
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import com.passwordvault.R
import com.passwordvault.domain.usecase.PasswordGenerator
import com.passwordvault.presentation.generator.GeneratorViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

class GeneratorActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                GeneratorScreen(viewModel = hiltViewModel())
            }
        }
    }
}

@Composable
fun GeneratorScreen(viewModel: GeneratorViewModel) {
    val options by viewModel.options.collectAsState()
    val generatedPassword by viewModel.generatedPassword.collectAsState()
    val strength by viewModel.strength.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Password Generator") },
                navigationIcon = { IconButton(onClick = { /* Nav back */ }) { Icon(imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack, contentDescription = "Back") } },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer
                ),
                actions = {
                    IconButton(onClick = {
                        val context = androidx.compose.ui.platform.LocalContext.current
                        val clipboard = context.getSystemService(android.content.Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                        val clip = android.content.ClipData.newPlainText("Password Vault", generatedPassword)
                        clipboard.primaryClip = clip
                        // TODO: Show toast
                    }) {
                        Icon(imageVector = androidx.compose.material.icons.Icons.Default.ContentCopy, contentDescription = "Copy password")
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
            // Generated Password Display
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = androidx.compose.material3.CardDefaults.cardColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerHighest
                )
            ) {
                androidx.compose.foundation.layout.Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(text = "Generated Password", fontSize = 14.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = generatedPassword,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace,
                            maxLines = 2,
                            overflow = androidx.compose.ui.text.TextOverflow.Ellipsis,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            LinearProgressIndicator(
                                progress = strength.score / 4f,
                                modifier = Modifier.weight(1f).height(8.dp),
                                color = androidx.compose.material3.MaterialTheme.colorScheme.getColor(strength.color)
                            )
                            Text(text = strength.label, fontSize = 14.sp, fontWeight = FontWeight.Medium, color = androidx.compose.material3.MaterialTheme.colorScheme.getColor(strength.color))
                            Text(text = "${strength.entropyBits} bits", fontSize = 12.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
            }

            // Options
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                androidx.compose.material3.Text(text = "Options", fontSize = 16.sp, fontWeight = FontWeight.Medium, modifier = Modifier.fillMaxWidth())

                // Length
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Length: ${options.length}", fontSize = 16.sp)
                    }
                    Slider(
                        value = options.length.toFloat(),
                        onValueChange = { viewModel.updateLength(it.roundToInt()) },
                        valueRange = 4f..128f,
                        steps = 124,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Character sets
                OptionRow(
                    title = "Uppercase (A-Z)",
                    icon = androidx.compose.material.icons.Icons.Default.TextFields,
                    checked = options.uppercase,
                    onCheckedChange = { viewModel.toggleUppercase() }
                )
                OptionRow(
                    title = "Lowercase (a-z)",
                    icon = androidx.compose.material.icons.Icons.Default.TextFields,
                    checked = options.lowercase,
                    onCheckedChange = { viewModel.toggleLowercase() }
                )
                OptionRow(
                    title = "Numbers (0-9)",
                    icon = androidx.compose.material.icons.Icons.Default.Pin,
                    checked = options.numbers,
                    onCheckedChange = { viewModel.toggleNumbers() }
                )
                OptionRow(
                    title = "Symbols (!@#$...)",
                    icon = androidx.compose.material.icons.Icons.Default.Symbol,
                    checked = options.symbols,
                    onCheckedChange = { viewModel.toggleSymbols() }
                )
                OptionRow(
                    title = "Avoid Ambiguous (i, l, 1, o, O, 0)",
                    icon = androidx.compose.material.icons.Icons.Default.VisibilityOff,
                    checked = options.avoidAmbiguous,
                    onCheckedChange = { viewModel.toggleAvoidAmbiguous() }
                )

                // Regenerate button
                Button(
                    onClick = { viewModel.regenerate() },
                    modifier = Modifier.fillMaxWidth(),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.secondaryContainer
                    )
                ) {
                    Icon(imageVector = androidx.compose.material.icons.Icons.Default.Refresh, contentDescription = "Regenerate", modifier = Modifier.size(20.dp).padding(end = 8.dp))
                    Text("Generate New Password")
                }
            }
        }
    }
}

@Composable
fun OptionRow(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    checked: Boolean,
    onCheckedChange: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp, horizontal = 16.dp)
            .background(androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainer),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(imageVector = icon, contentDescription = "", tint = androidx.compose.material3.MaterialTheme.colorScheme.primary, modifier = Modifier.size(24.dp).padding(end = 12.dp))
            Text(text = title, fontSize = 16.sp)
        }
        Switch(
            checked = checked,
            onCheckedChange = { onCheckedChange() },
            colors = androidx.compose.material3.SwitchDefaults.colors(
                thumbColor = androidx.compose.material3.MaterialTheme.colorScheme.onPrimary,
                trackColor = androidx.compose.material3.MaterialTheme.colorScheme.primary
            )
        )
    }
}