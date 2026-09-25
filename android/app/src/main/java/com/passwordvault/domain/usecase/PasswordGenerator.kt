package com.passwordvault.domain.usecase

import java.security.SecureRandom
import kotlin.math.log2
import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * Cryptographically secure password generator.
 * Mirrors the web app's lib/utils/password-generator.ts implementation.
 */
object PasswordGenerator {

    data class Options(
        val length: Int = 20,
        val uppercase: Boolean = true,
        val lowercase: Boolean = true,
        val numbers: Boolean = true,
        val symbols: Boolean = true,
        val avoidAmbiguous: Boolean = false
    )

    data class Strength(
        val score: Int, // 0-4
        val entropyBits: Int,
        val label: String,
        val color: String // Material 3 color role
    )

    private const val UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    private const val LOWERCASE = "abcdefghijklmnopqrstuvwxyz"
    private const val NUMBERS = "0123456789"
    private const val SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?"
    private val AMBIGUOUS_CHARS = setOf('i', 'l', '1', 'L', 'o', '0', 'O')

    private val secureRandom = SecureRandom()

    /**
     * Generates an unbiased random integer in the range [0, max - 1]
     * using rejection sampling to eliminate modulo bias.
     */
    private fun getSecureRandomInt(max: Int): Int {
        require(max > 0) { "Max must be positive" }
        if (max == 1) return 0

        val maxUint32 = 0xFFFFFFFFL
        val limit = maxUint32 - (maxUint32 % max)
        val buffer = LongArray(1)

        var value: Long
        do {
            secureRandom.nextBytes(buffer[0].toByteArray())
            value = buffer[0].toULong()
        } while (value >= limit)

        return (value % max).toInt()
    }

    /**
     * Fisher-Yates shuffle using cryptographically secure random integers.
     */
    private fun <T> secureShuffle(array: Array<T>): Array<T> {
        val result = array.copyOf()
        for (i in result.lastIndex downTo 1) {
            val j = getSecureRandomInt(i + 1)
            val temp = result[i]
            result[i] = result[j]
            result[j] = temp
        }
        return result
    }

    /**
     * Generates a cryptographically secure random password based on the supplied options.
     */
    fun generate(options: Options = Options()): String {
        var upper = UPPERCASE
        var lower = LOWERCASE
        var nums = NUMBERS
        var syms = SYMBOLS

        if (options.avoidAmbiguous) {
            upper = upper.filter { it !in AMBIGUOUS_CHARS }
            lower = lower.filter { it !in AMBIGUOUS_CHARS }
            nums = nums.filter { it !in AMBIGUOUS_CHARS }
            syms = syms.filter { it !in AMBIGUOUS_CHARS }
        }

        val activeSets = mutableListOf<String>()
        if (options.uppercase && upper.isNotEmpty()) activeSets.add(upper)
        if (options.lowercase && lower.isNotEmpty()) activeSets.add(lower)
        if (options.numbers && nums.isNotEmpty()) activeSets.add(nums)
        if (options.symbols && syms.isNotEmpty()) activeSets.add(syms)

        // Fallback if no sets selected
        if (activeSets.isEmpty()) {
            activeSets.addAll(listOf(lower, upper, nums))
        }

        val combinedPool = activeSets.joinToString("")
        val targetLength = max(4, min(128, options.length))
        val characters = mutableListOf<Char>()

        // Guarantee at least 1 character from each chosen character set
        for (set in activeSets) {
            if (characters.size < targetLength) {
                val idx = getSecureRandomInt(set.length)
                characters.add(set[idx])
            }
        }

        // Fill remaining characters uniformly from the combined pool
        while (characters.size < targetLength) {
            val idx = getSecureRandomInt(combinedPool.length)
            characters.add(combinedPool[idx])
        }

        // Cryptographically shuffle the entire array
        return secureShuffle(characters.toTypedArray()).joinToString("")
    }

    /**
     * Calculates theoretical entropy in bits: E = L * log2(N)
     */
    fun calculateEntropy(password: String): Int {
        if (password.isBlank()) return 0

        var poolSize = 0
        var hasLower = false
        var hasUpper = false
        var hasDigit = false
        var hasSymbol = false

        for (char in password) {
            when {
                char in 'a'..'z' -> hasLower = true
                char in 'A'..'Z' -> hasUpper = true
                char in '0'..'9' -> hasDigit = true
                else -> hasSymbol = true
            }
        }

        if (hasLower) poolSize += 26
        if (hasUpper) poolSize += 26
        if (hasDigit) poolSize += 10
        if (hasSymbol) poolSize += 32

        if (poolSize == 0) return 0

        val entropy = password.length * log2(poolSize.toDouble())
        return entropy.roundToInt()
    }

    /**
     * Evaluates password strength and assigns a score, label, and UI color.
     */
    fun getStrength(password: String): Strength {
        if (password.isBlank()) {
            return Strength(0, 0, "Very Weak", "errorContainer")
        }

        val entropy = calculateEntropy(password)
        val length = password.length

        return when {
            length < 8 || entropy < 36 -> Strength(1, entropy, "Weak", "error")
            length < 12 || entropy < 60 -> Strength(2, entropy, "Fair", "tertiaryContainer")
            length < 16 || entropy < 85 -> Strength(3, entropy, "Strong", "primaryContainer")
            else -> Strength(4, entropy, "Very Strong", "secondaryContainer")
        }
    }
}