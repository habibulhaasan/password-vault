package com.example.passwordvault.ui.main

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
// Removed navigation3 import
import com.example.passwordvault.data.DefaultDataRepository
import com.example.passwordvault.theme.PasswordVaultTheme

@Composable
fun MainScreen(
    onItemClick: (String) -> Unit,
    onAddClick: () -> Unit,
    onSettingsClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: MainScreenViewModel = viewModel { MainScreenViewModel(DefaultDataRepository()) },
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    when (state) {
        MainScreenUiState.Loading -> {
            // Show loading UI if needed
        }
        is MainScreenUiState.Success -> {
            // For now, pass placeholder data to internal MainScreen
            MainScreenContent(data = (state as MainScreenUiState.Success).data, modifier = modifier)
        }
        is MainScreenUiState.Error -> {
            Text("Error loading data: ${(state as MainScreenUiState.Error).throwable.message}")
        }
    }
    // Note: onAddClick and onSettingsClick can be used in a top bar elsewhere.
}

@Composable
internal fun MainScreenContent(data: List<String>, modifier: Modifier = Modifier) {
    Column(modifier) { data.forEach { Greeting(it) } }
}

@Composable
fun Greeting(name: String, modifier: Modifier = Modifier) {
    Text(text = "Hello $name!", modifier = modifier)
}

@Preview(showBackground = true)
@Composable
fun MainScreenPreview() {
    PasswordVaultTheme { MainScreenContent(data = listOf("Android")) }
}

@Preview(showBackground = true, widthDp = 340)
@Composable
fun MainScreenPortraitPreview() {
    PasswordVaultTheme { MainScreenContent(data = listOf("Android")) }
}
