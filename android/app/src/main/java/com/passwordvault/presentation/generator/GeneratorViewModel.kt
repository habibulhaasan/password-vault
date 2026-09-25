package com.passwordvault.presentation.generator

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.passwordvault.domain.usecase.PasswordGenerator
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

/**
 * ViewModel for password generator.
 */
class GeneratorViewModel : ViewModel() {

    private val _options = MutableStateFlow(PasswordGenerator.Options())
    val options = _options.distinctUntilChanged()

    private val _generatedPassword = MutableStateFlow<String>("")
    val generatedPassword = _generatedPassword.distinctUntilChanged()

    private val _strength = MutableStateFlow(PasswordGenerator.Strength(0, 0, "Very Weak", "errorContainer"))
    val strength = _strength.distinctUntilChanged()

    init {
        generatePassword()
    }

    fun updateOptions(newOptions: PasswordGenerator.Options) {
        _options.value = newOptions
        generatePassword()
    }

    fun updateLength(length: Int) {
        _options.value = _options.value.copy(length = length.coerceIn(4, 128))
        generatePassword()
    }

    fun toggleUppercase() {
        _options.value = _options.value.copy(uppercase = !_options.value.uppercase)
        generatePassword()
    }

    fun toggleLowercase() {
        _options.value = _options.value.copy(lowercase = !_options.value.lowercase)
        generatePassword()
    }

    fun toggleNumbers() {
        _options.value = _options.value.copy(numbers = !_options.value.numbers)
        generatePassword()
    }

    fun toggleSymbols() {
        _options.value = _options.value.copy(symbols = !_options.value.symbols)
        generatePassword()
    }

    fun toggleAvoidAmbiguous() {
        _options.value = _options.value.copy(avoidAmbiguous = !_options.value.avoidAmbiguous)
        generatePassword()
    }

    fun regenerate() {
        generatePassword()
    }

    private fun generatePassword() {
        viewModelScope.launch {
            val password = PasswordGenerator.generate(_options.value)
            _generatedPassword.value = password
            _strength.value = PasswordGenerator.getStrength(password)
        }
    }

    fun copyPassword(): String = _generatedPassword.value
}