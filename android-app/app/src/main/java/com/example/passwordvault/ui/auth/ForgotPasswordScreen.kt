package com.example.passwordvault.ui.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import com.example.passwordvault.ui.auth.AuthViewModel
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel

@Composable
fun ForgotPasswordScreen(
    authViewModel: AuthViewModel,
    onBack: () -> Unit = {}
) {
    val email = remember { mutableStateOf("") }
    val message = remember { mutableStateOf("") }

    Column(modifier = Modifier
        .fillMaxSize()
        .padding(16.dp)) {
        OutlinedTextField(
            value = email.value,
            onValueChange = { email.value = it },
            label = { Text("Email") },
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
        )
        Button(
            onClick = {
                authViewModel.sendPasswordReset(email.value) { success, err ->
                    message.value = if (success) "Reset email sent" else err ?: "Failed"
                }
            },
            modifier = Modifier.fillMaxWidth().padding(top = 12.dp)
        ) {
            Text("Send Reset Email")
        }
        Button(
            onClick = onBack,
            modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
        ) {
            Text("Back to Login")
        }
        if (message.value.isNotEmpty()) {
            Text(text = message.value, modifier = Modifier.padding(top = 8.dp))
        }
    }
}




@Preview(showBackground = true)
@Composable
fun ForgotPasswordScreenPreview() {
    ForgotPasswordScreen(
        authViewModel = viewModel(),
        onBack = {}
    )
}
