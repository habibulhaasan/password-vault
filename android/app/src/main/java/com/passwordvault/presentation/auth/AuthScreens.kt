package com.passwordvault.presentation.auth

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
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TextFieldDefaults
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navArgument
import androidx.navigation.compose.rememberNavController
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.passwordvault.R
import com.passwordvault.data.model.VaultUser
import com.passwordvault.navigation.AuthDestination
import com.passwordvault.navigation.NavigationGraph
import com.passwordvault.presentation.auth.AuthViewModel
import com.passwordvault.presentation.vault.VaultViewModel
import com.passwordvault.ui.theme.Theme
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
class AuthActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            Theme {
                AuthNavHost()
            }
        }
    }
}

@Composable
fun AuthNavHost() {
    val navController = rememberNavController()
    val authViewModel: AuthViewModel = hiltViewModel()
    val vaultViewModel: VaultViewModel = hiltViewModel()

    NavHost(navController, startDestination = AuthDestination.Login.route) {
        composable(AuthDestination.Login.route) {
            LoginScreen(
                onNavigateToRegister = { navController.navigate(AuthDestination.Register.route) },
                onNavigateToForgotPassword = { navController.navigate(AuthDestination.ForgotPassword.route) },
                onNavigateToGuest = { navController.navigate(AuthDestination.Guest.route) },
                onLoginSuccess = { navigateAfterLogin(navController, authViewModel, vaultViewModel) },
                viewModel = authViewModel
            )
        }
        composable(AuthDestination.Register.route) {
            RegisterScreen(
                onNavigateToLogin = { navController.navigate(AuthDestination.Login.route) },
                onRegisterSuccess = { navigateAfterLogin(navController, authViewModel, vaultViewModel) },
                viewModel = authViewModel
            )
        }
        composable(AuthDestination.ForgotPassword.route) {
            ForgotPasswordScreen(
                onNavigateToLogin = { navController.navigate(AuthDestination.Login.route) },
                viewModel = authViewModel
            )
        }
        composable(AuthDestination.Guest.route) {
            GuestScreen(
                onGuestSetup = { navController.navigate(AuthDestination.VaultSetup.route) },
                onGuestEnter = { navigateAfterLogin(navController, authViewModel, vaultViewModel) }
            )
        }
        composable(
            route = AuthDestination.VaultSetup.route,
            arguments = listOf(navArgument("isGuest") { type = NavigationGraph.NavType.BoolType; defaultValue = "false" })
        ) { backStackEntry ->
            val isGuest = backStackEntry.getBoolean("isGuest")
            VaultSetupScreen(
                isGuest = isGuest,
                onSetupComplete = { navigateAfterLogin(navController, authViewModel, vaultViewModel) },
                viewModel = vaultViewModel
            )
        }
        composable(AuthDestination.VaultUnlock.route) {
            VaultUnlockScreen(
                onUnlockSuccess = { navigateAfterLogin(navController, authViewModel, vaultViewModel) },
                viewModel = vaultViewModel
            )
        }
    }
}

private suspend fun navigateAfterLogin(
    navController: androidx.navigation.NavController,
    authViewModel: AuthViewModel,
    vaultViewModel: VaultViewModel
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
        // Guest mode - always go to setup
        navController.navigate(AuthDestination.VaultSetup.route + "?isGuest=true") {
            popUpTo(navController.graph.startDestinationId) { inclusive = true }
        }
    }
}

@Composable
fun LoginScreen(
    onNavigateToRegister: () -> Unit,
    onNavigateToForgotPassword: () -> Unit,
    onNavigateToGuest: () -> Unit,
    onLoginSuccess: () -> Unit,
    viewModel: AuthViewModel
) {
    val email by remember { mutableStateOf("") }
    val password by remember { mutableStateOf("") }
    val showPassword by remember { mutableStateOf(false) }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    AuthLayout(
        title = "Welcome Back",
        subtitle = "Sign in to access your vault",
        showGuestButton = true,
        onGuestClick = onNavigateToGuest
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            TextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Email,
                    imeAction = androidx.compose.ui.text.input.ImeAction.Next
                ),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            TextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                isError = error != null,
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Done),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            error?.let {
                Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            Button(
                onClick = {
                    lifecycleScope.launch { viewModel.signIn(email, password) }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading && email.isNotBlank() && password.isNotBlank()
            ) {
                if (loading) androidx.compose.material3.ProgressIndicator() else Text("Sign In")
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(8.dp))

            androidx.compose.material3.TextButton(onClick = onNavigateToForgotPassword) {
                Text("Forgot Password?")
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(16.dp))

            androidx.compose.material3.TextButton(onClick = onNavigateToRegister) {
                Text("Don't have an account? Sign up")
            }
        }
    }
}

@Composable
fun RegisterScreen(
    onNavigateToLogin: () -> Unit,
    onRegisterSuccess: () -> Unit,
    viewModel: AuthViewModel
) {
    val email by remember { mutableStateOf("") }
    val password by remember { mutableStateOf("") }
    val confirmPassword by remember { mutableStateOf("") }
    val showPassword by remember { mutableStateOf(false) }

    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    AuthLayout(
        title = "Create Account",
        subtitle = "Register to sync your vault across devices"
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            TextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Email,
                    imeAction = androidx.compose.ui.text.input.ImeAction.Next
                ),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            TextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                isError = error != null,
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Next),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            TextField(
                value = confirmPassword,
                onValueChange = { confirmPassword = it },
                label = { Text("Confirm Password") },
                trailingIcon = {
                    IconButton(onClick = { showPassword = !showPassword }) {
                        Icon(
                            imageVector = if (showPassword) androidx.compose.material.icons.Icons.Default.Visibility else androidx.compose.material.icons.Icons.Default.VisibilityOff,
                            contentDescription = if (showPassword) "Hide password" else "Show password"
                        )
                    }
                },
                visualTransformation = if (showPassword) androidx.compose.material3.VisualTransformation.None else androidx.compose.material3.PasswordVisualTransformation(),
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Done),
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            error?.let {
                Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            (password != confirmPassword && confirmPassword.isNotBlank()).let { mismatch ->
                if (mismatch) {
                    Text(text = "Passwords don't match", color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                }
            }

            Button(
                onClick = {
                    if (password == confirmPassword) {
                        lifecycleScope.launch { viewModel.signUp(email, password) }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading && email.isNotBlank() && password.isNotBlank() && password == confirmPassword
            ) {
                if (loading) androidx.compose.material3.ProgressIndicator() else Text("Create Account")
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(16.dp))

            androidx.compose.material3.TextButton(onClick = onNavigateToLogin) {
                Text("Already have an account? Sign in")
            }
        }
    }
}

@Composable
fun ForgotPasswordScreen(
    onNavigateToLogin: () -> Unit,
    viewModel: AuthViewModel
) {
    val email by remember { mutableStateOf("") }
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val success by remember { mutableStateOf(false) }

    AuthLayout(title = "Reset Password", subtitle = "Enter your email to receive a reset link") {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (success) {
                androidx.compose.material3.Text(
                    text = "Reset link sent! Check your email.",
                    color = androidx.compose.material3.MaterialTheme.colorScheme.primary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }

            TextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email") },
                keyboardOptions = androidx.compose.ui.text.input.KeyboardOptions(
                    keyboardType = androidx.compose.ui.text.input.KeyboardType.Email,
                    imeAction = androidx.compose.ui.text.input.ImeAction.Done
                ),
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                enabled = !success
            )

            error?.let {
                Text(text = it, color = androidx.compose.material3.MaterialTheme.colorScheme.error, fontSize = 12.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
            }

            Button(
                onClick = {
                    lifecycleScope.launch {
                        val sent = viewModel.sendPasswordReset(email)
                        if (sent) success = true
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !loading && !success && email.isNotBlank()
            ) {
                if (loading) androidx.compose.material3.ProgressIndicator() else Text(if (success) "Sent" else "Send Reset Link")
            }

            androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(16.dp))

            androidx.compose.material3.TextButton(onClick = onNavigateToLogin) {
                Text("Back to Sign In")
            }
        }
    }
}

@Composable
fun GuestScreen(
    onGuestSetup: () -> Unit,
    onGuestEnter: () -> Unit
) {
    AuthLayout(
        title = "Guest Mode",
        subtitle = "Use Password Vault locally without an account. Data stays on this device only."
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            androidx.compose.material3.Text(
                text = "Guest vaults are stored locally and won't sync across devices. You can create an account later to enable sync.",
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            )

            androidx.compose.material3.FilledButton(
                onClick = onGuestSetup,
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            ) {
                Text("Create Guest Vault")
            }

            androidx.compose.material3.OutlinedButton(
                onClick = onGuestEnter,
                modifier = Modifier.fillMaxWidth().padding(16.dp)
            ) {
                Text("I have an existing Guest Vault")
            }
        }
    }
}

@Composable
fun AuthLayout(
    title: String,
    subtitle: String,
    showGuestButton: Boolean = false,
    onGuestClick: () -> Unit = {},
    content: @Composable () -> Unit
) {
    val context = androidx.compose.ui.platform.LocalContext.current

    androidx.compose.material3.Surface(
        modifier = Modifier.fillMaxSize(),
        color = androidx.compose.material3.MaterialTheme.colorScheme.background
    ) {
        androidx.compose.foundation.layout.Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = androidx.compose.ui.Alignment.Center
        ) {
            androidx.compose.foundation.layout.Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp)
                    .widthIn(max = 400.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // App Icon/Logo
                androidx.compose.material3.Card(
                    modifier = Modifier.size(80.dp),
                    shape = androidx.compose.foundation.shape.RoundedCornerShape(20.dp),
                    colors = androidx.compose.material3.CardDefaults.cardColors(
                        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = androidx.compose.ui.Alignment.Center
                    ) {
                        Icon(
                            imageVector = androidx.compose.material.icons.Icons.Default.Lock,
                            contentDescription = "App icon",
                            tint = androidx.compose.material3.MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }

                // Title & Subtitle
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = title, fontSize = 28.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                    androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.foundation.layout.size(8.dp))
                    Text(text = subtitle, fontSize = 16.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant, textAlign = TextAlign.Center)
                }

                // Content
                content()

                // Guest button
                if (showGuestButton) {
                    androidx.compose.material3.TextButton(onClick = onGuestClick) {
                        Text("Continue as Guest")
                    }
                }
            }
        }
    }
}