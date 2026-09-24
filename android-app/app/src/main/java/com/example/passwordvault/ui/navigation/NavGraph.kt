package com.example.passwordvault.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.passwordvault.ui.auth.AuthViewModel
import com.example.passwordvault.ui.auth.LoginScreen
import com.example.passwordvault.ui.categories.CategoriesScreen
import com.example.passwordvault.ui.credentials.CredentialDetailScreen
import com.example.passwordvault.ui.credentials.EditCredentialScreen
import com.example.passwordvault.ui.generator.GeneratorScreen
import com.example.passwordvault.ui.settings.SettingsScreen
import com.example.passwordvault.ui.vault.VaultScreen
import com.example.passwordvault.ui.vault.VaultViewModel

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Vault : Screen("vault")
    object CredentialDetail : Screen("credential_detail/{id}") {
        fun createRoute(id: String) = "credential_detail/$id"
    }
    object EditCredential : Screen("edit_credential/{id}") {
        fun createRoute(id: String?) = id?.let { "edit_credential/$it" } ?: "edit_credential/new"
    }
    object Generator : Screen("generator")
    object Categories : Screen("categories")
    object Settings : Screen("settings")
}

@Composable
fun AppNavGraph(
    navController: NavHostController = rememberNavController(),
    authViewModel: AuthViewModel,
    vaultViewModel: VaultViewModel,
    startDestination: String = Screen.Login.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                authViewModel = authViewModel,
                vaultViewModel = vaultViewModel,
                onLoginSuccess = { /* Automatically handled by State */ }
            )
        }
        
        composable(Screen.Vault.route) {
            VaultScreen(
                vaultViewModel = vaultViewModel,
                onLogout = { 
                    authViewModel.logout()
                },
                onAddCredential = {
                    navController.navigate(Screen.EditCredential.createRoute(null))
                },
                onViewCredential = { id ->
                    navController.navigate(Screen.CredentialDetail.createRoute(id))
                },
                onNavigateToGenerator = { navController.navigate(Screen.Generator.route) },
                onNavigateToCategories = { navController.navigate(Screen.Categories.route) },
                onNavigateToSettings = { navController.navigate(Screen.Settings.route) }
            )
        }

        composable(Screen.CredentialDetail.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id") ?: ""
            CredentialDetailScreen(
                credentialId = id,
                onBack = { navController.popBackStack() },
                onEdit = { navController.navigate(Screen.EditCredential.createRoute(id)) }
            )
        }

        composable(Screen.EditCredential.route) { backStackEntry ->
            val id = backStackEntry.arguments?.getString("id")
            val isNew = id == "new"
            EditCredentialScreen(
                credentialId = if (isNew) null else id,
                onBack = { navController.popBackStack() },
                onSaveSuccess = { navController.popBackStack() }
            )
        }

        composable(Screen.Generator.route) {
            GeneratorScreen()
        }

        composable(Screen.Categories.route) {
            CategoriesScreen()
        }

        composable(Screen.Settings.route) {
            SettingsScreen(onLogout = { authViewModel.logout() })
        }
    }
}
