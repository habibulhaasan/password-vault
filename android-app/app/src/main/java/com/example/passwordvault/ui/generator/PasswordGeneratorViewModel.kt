package com.example.passwordvault.ui.generator

import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.passwordvault.data.models.Credential
import com.example.passwordvault.data.repository.FireStoreRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.UUID

class PasswordGeneratorViewModel : ViewModel() {
    // UI text fields
    val titleState = mutableStateOf("")
    val usernameState = mutableStateOf("")
    val urlState = mutableStateOf("")
    val notesState = mutableStateOf("")

    // Generation settings
    private val _length = MutableStateFlow(12)
    val length: StateFlow<Int> = _length

    private val _includeUpper = MutableStateFlow(true)
    val includeUpper: StateFlow<Boolean> = _includeUpper

    private val _includeLower = MutableStateFlow(true)
    val includeLower: StateFlow<Boolean> = _includeLower

    private val _includeNumbers = MutableStateFlow(false)
    val includeNumbers: StateFlow<Boolean> = _includeNumbers

    private val _includeSymbols = MutableStateFlow(false)
    val includeSymbols: StateFlow<Boolean> = _includeSymbols

    private val _generatedPassword = MutableStateFlow("")
    val generatedPassword: StateFlow<String> = _generatedPassword

    // Setters
    fun setLength(value: Int) { _length.value = value }
    fun setIncludeUpper(value: Boolean) { _includeUpper.value = value }
    fun setIncludeLower(value: Boolean) { _includeLower.value = value }
    fun setIncludeNumbers(value: Boolean) { _includeNumbers.value = value }
    fun setIncludeSymbols(value: Boolean) { _includeSymbols.value = value }

    // Password generation logic
    fun generatePassword() {
        val upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        val lower = "abcdefghijklmnopqrstuvwxyz"
        val numbers = "0123456789"
        val symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?/"

        var charset = ""
        if (includeUpper.value) charset += upper
        if (includeLower.value) charset += lower
        if (includeNumbers.value) charset += numbers
        if (includeSymbols.value) charset += symbols

        if (charset.isEmpty()) {
            _generatedPassword.value = ""
            return
        }

        val sb = StringBuilder()
        val rnd = java.util.Random()
        repeat(length.value) {
            val idx = rnd.nextInt(charset.length)
            sb.append(charset[idx])
        }
        _generatedPassword.value = sb.toString()
    }

    // Save generated credential to Firestore
    fun saveCredential(
        title: String,
        username: String,
        url: String,
        notes: String,
        onSaved: (credentialId: String) -> Unit
    ) {
        viewModelScope.launch {
            val credential = Credential(
                id = UUID.randomUUID().toString(),
                title = title,
                username = username,
                password = generatedPassword.value,
                url = url,
                notes = notes,
                categoryId = "",
                tagIds = emptyList()
            )
            FireStoreRepository.addOrUpdateCredential(credential)
            onSaved(credential.id)
        }
    }
}

