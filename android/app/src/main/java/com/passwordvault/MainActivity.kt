package com.passwordvault

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.graphics.Color
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.passwordvault.navigation.AuthDestination
import com.passwordvault.navigation.MainDestination
import com.passwordvault.presentation.auth.AuthScreens
import com.passwordvault.presentation.vault.MainScreens
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
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()

    NavHost(navController, startDestination = AuthDestination.Login.route) {
        composable(AuthDestination.Login.route) {
            AuthScreens.LoginScreen(
                onNavigateToRegister = { navController.navigate(AuthDestination.Register.route) },
                onNavigateToForgotPassword = { navController.navigate(AuthDestination.ForgotPassword.route) },
                onNavigateToGuest = { navController.navigate(AuthDestination.Guest.route) },
                onLoginSuccess = { navigateAfterLogin(navController, authViewModel) },
                viewModel = authViewModel
            )
        }
        composable(AuthDestination.Register.route) {
            AuthScreens.RegisterScreen(
                onNavigateToLogin = { navController.navigate(AuthDestination.Login.route) },
                onRegisterSuccess = { navigateAfterLogin(navController, authViewModel) },
                viewModel = authViewModel
            )
        }
        composable(AuthDestination.ForgotPassword.route) {
            AuthScreens.ForgotPasswordScreen(
                onNavigateToLogin = { navController.navigate(AuthDestination.Login.route) },
                viewModel = authViewModel
            )
        }
        composable(AuthDestination.Guest.route) {
            AuthScreens.GuestScreen(
                onGuestSetup = { navController.navigate(AuthDestination.VaultSetup.route + "?isGuest=true") },
                onGuestEnter = { navigateAfterLogin(navController, authViewModel) }
            )
        }
        composable(
            route = AuthDestination.VaultSetup.route,
            arguments = listOf(navArgument("isGuest") { type = androidx.navigation.NavType.BoolType; defaultValue = "false" })
        ) { backStackEntry ->
            val isGuest = backStackEntry.getBoolean("isGuest")
            AuthScreens.VaultSetupScreen(
                isGuest = isGuest,
                onSetupComplete = { navigateAfterLogin(navController, authViewModel) },
                viewModel = hiltViewModel()
            )
        }
        composable(AuthDestination.VaultUnlock.route) {
            AuthScreens.VaultUnlockScreen(
                onUnlockSuccess = { navigateAfterLogin(navController, authViewModel) },
                viewModel = hiltViewModel()
            )
        }
    }
}

private suspend fun navigateAfterLogin(
    navController: androidx.navigation.NavController,
    authViewModel: AuthViewModel
) {
    val user = authViewModel.user.value
    val vaultInitialized = authViewModel.vaultInitialized.value

    if (user != null) {
        if (vaultInitialized == true) {
            navController.navigate(AuthDestination.VaultUnlock.route) {
                popUpTo(navController.graph.startDestinationId) { inclusive = true }
            }
        } else {
            navController.navigate(AuthDestination.VaultSetup.route) {
                popUpTo(navController.graph.startDestinationId) { inclusive = true }
            }
        }
    } else {
        navController.navigate(AuthDestination.VaultSetup.route + "?isGuest=true") {
            popUpTo(navController.graph.startDestinationId) { inclusive = true }
        }
    }
}