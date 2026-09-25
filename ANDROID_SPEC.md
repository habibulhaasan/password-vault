# Password Vault - Native Android App Specification

## Project Overview
Port the Zero-Knowledge Password Vault (Next.js + Firebase) to a native Android application using Kotlin and Jetpack Compose.

## Architecture

### Zero-Knowledge Principles (MUST PRESERVE)
- **All encryption/decryption happens client-side** on Android device
- Master password never leaves device, never stored persistently
- Only ciphertext + IVs stored in Firestore
- AES-GCM 256-bit with 12-byte IV + 128-bit auth tag
- PBKDF2-SHA256 with 600,000 iterations for key derivation
- Canary token for vault verification

### Android-Specific Security
- **Android Keystore** for key storage (hardware-backed when available)
- **BiometricPrompt** for biometric unlock (fingerprint/face)
- **EncryptedSharedPreferences** for non-sensitive settings
- Session key held only in memory, purged on lock
- Auto-lock timer with configurable timeout

## Data Models

### EncryptedCredential (Firestore)
```kotlin
data class EncryptedCredential(
    val id: String,
    val title: String,
    val encryptedUsername: String,    // Base64(IV + ciphertext)
    val encryptedPassword: String,
    val encryptedNotes: String?,
    val websiteUrl: String?,
    val logoUrl: String?,
    val categoryId: String?,
    val tags: List<String>,
    val lastLoginAt: Timestamp?,
    val createdAt: Timestamp,
    val updatedAt: Timestamp
)
```

### DecryptedCredential (In-Memory Only)
```kotlin
data class DecryptedCredential(
    val id: String,
    val title: String,
    val username: String,
    val password: String,
    val notes: String?,
    val websiteUrl: String?,
    val logoUrl: String?,
    val categoryId: String?,
    val tags: List<String>,
    val lastLoginAt: Date?,
    val createdAt: Date,
    val updatedAt: Date
)
```

### Category
```kotlin
data class Category(
    val id: String,
    val label: String,
    val icon: String,
    val isCustom: Boolean = false,
    val isDeleted: Boolean = false,
    val userId: String? = null,
    val createdAt: Timestamp? = null,
    val updatedAt: Timestamp? = null
)
```

### VaultSettings (Firestore)
```kotlin
data class VaultSettings(
    val salt: String,              // Base64 encoded 16-byte salt
    val verificationToken: String, // Encrypted canary token
    val autoLockMinutes: Int = 15
)
```

## Cryptographic Implementation

### Key Derivation (PBKDF2-SHA256)
```kotlin
// 600,000 iterations, 256-bit key, 16-byte salt
SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
PBEKeySpec(password.toCharArray(), salt, 600000, 256)
```

### Encryption (AES-GCM)
```kotlin
// 12-byte IV, 256-bit key
Cipher.getInstance("AES/GCM/NoPadding")
GCMParameterSpec(128, iv) // 128-bit auth tag
// Output: Base64(IV || ciphertext || authTag)
```

### Canary Token
- Constant: `"PASSWORD_VAULT_CANARY_VERIFICATION_V1"`
- Encrypted during vault setup
- Verified during unlock to validate master password

## Core Features

### 1. Vault Management
- **Setup Vault**: First-time user creates master password → generates salt → derives key → encrypts canary → saves to Firestore
- **Unlock Vault**: Enter master password → derive key with stored salt → verify canary → store key in memory + session
- **Lock Vault**: Purge key from memory, clear session
- **Auto-Lock**: Configurable timeout (default 15 min), background timer
- **Change Master Password**: Verify current → generate new salt/key → re-encrypt all credentials in batch → atomic commit

### 2. Credential Operations (All Client-Side Encrypted)
- **Create**: Encrypt username/password/notes → save to Firestore
- **Read**: Fetch encrypted → decrypt in memory → display
- **Update**: Encrypt new values → update Firestore
- **Delete**: Remove from Firestore
- **Mark Logged In**: Update lastLoginAt timestamp

### 3. Categories
- **11 System Categories**: Personal, Work, Finance, Social, Shopping, Education, Development, Government, Health, Entertainment, Other
- **Custom Categories**: User-created with icon selection
- **Override System**: User can rename/hide system categories
- **Cascade Delete**: Unlink credentials when category deleted

### 4. Tags
- Auto-extract from credentials
- Count usage across all credentials
- Global rename/delete via batch writes
- Suggestions: existing + defaults (personal, work, financial, 2FA, important, subscription, rarely-used)

### 5. Password Generator
- Cryptographically secure using `SecureRandom`
- Rejection sampling for unbiased distribution
- Fisher-Yates shuffle
- Options: length (4-128), uppercase, lowercase, numbers, symbols, avoid ambiguous
- Guarantees at least 1 char from each selected set
- Entropy calculation: `L * log2(N)`
- Strength: Very Weak (<36 bits) → Very Strong (>85 bits)

### 6. Authentication
- Firebase Auth (Email/Password)
- Email verification
- Password reset
- Guest mode (local-only, no sync)

### 7. Real-Time Sync
- Firestore listeners for credentials, categories
- Optimistic UI updates
- Offline support via Firestore cache

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Kotlin 2.0+ |
| UI | Jetpack Compose (Material 3) |
| Architecture | MVVM + Repository Pattern |
| DI | Hilt / Koin |
| Database | Room (local cache) + Firestore (remote) |
| Auth | Firebase Auth |
| Crypto | Android Jetpack Security / javax.crypto |
| Biometric | BiometricPrompt API |
| Async | Kotlin Coroutines + Flow |
| Navigation | Navigation Compose |
| Serialization | Kotlinx Serialization |
| Testing | JUnit, Turbine, Compose Testing |

## Project Structure
```
app/
├── src/
│   ├── main/
│   │   ├── java/com/passwordvault/
│   │   │   ├── crypto/
│   │   │   │   ├── KeyDerivation.kt
│   │   │   │   ├── Encryption.kt
│   │   │   │   └── VaultCrypto.kt
│   │   │   ├── data/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── local/
│   │   │   │   └── remote/
│   │   │   ├── domain/
│   │   │   │   ├── usecase/
│   │   │   │   └── model/
│   │   │   ├── presentation/
│   │   │   │   ├── vault/
│   │   │   │   ├── credentials/
│   │   │   │   ├── categories/
│   │   │   │   ├── tags/
│   │   │   │   ├── generator/
│   │   │   │   ├── settings/
│   │   │   │   └── auth/
│   │   │   ├── di/
│   │   │   ├── navigation/
│   │   │   └── PasswordVaultApplication.kt
│   │   ├── res/
│   │   │   ├── values/
│   │   │   ├── xml/
│   │   │   └── drawable/
│   │   └── AndroidManifest.xml
│   ├── test/
│   └── androidTest/
├── build.gradle.kts
└── proguard-rules.pro
```

## UI Screens

### Auth Flow
1. **Welcome/Splash** - App branding, biometric prompt if available
2. **Login** - Email/password, forgot password, register link
3. **Register** - Email/password/confirm, email verification sent
4. **Guest Mode** - Local-only vault (no cloud sync)

### Vault Flow
5. **Vault Setup** - First-time: create master password, confirm, hint optional
6. **Vault Unlock** - Master password entry, biometric option, "Remember me" (session)
7. **Vault Locked** - Locked state, unlock button, auto-lock countdown

### Main App (Bottom Navigation)
8. **Vault/Home** - Credential list with search, filter by category/tag, FAB to add
9. **Categories** - System + custom categories, create/edit/delete
10. **Tags** - Tag cloud with counts, rename/delete
11. **Generator** - Password generator with options, strength meter, copy
12. **Settings** - Auto-lock timer, change master password, export/import, about

### Credential Detail/Edit
13. **Credential Detail** - View decrypted fields, copy buttons, mark logged in, edit/delete
14. **Credential Form** - Title, username, password (with generator), notes, URL, category, tags

## Security Checklist
- [ ] Master password never logged, never in memory longer than needed
- [ ] CryptoKey marked non-extractable where possible
- [ ] IV never reused with same key
- [ ] Auth tag verified on every decrypt (AEAD)
- [ ] Session key stored in memory only (not SharedPreferences)
- [ ] Auto-lock purges key on timeout
- [ ] Biometric unlock uses CryptoObject for key release
- [ ] ProGuard/R8 rules to strip logs in release
- [ ] Network Security Config for certificate pinning
- [ ] Firestore Security Rules: user-scoped access only

## Firestore Security Rules (Port from Web)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Build Configuration
- minSdk 24 (Android 7.0)
- targetSdk 35 (Android 15)
- compileSdk 35
- Kotlin 2.0+
- Compose Compiler 1.5+
- Material 3
- Firebase BoM 33+

## Testing Requirements
- Unit tests for crypto (key derivation, encrypt/decrypt, canary)
- Unit tests for password generator (entropy, strength, distribution)
- Instrumented tests for VaultRepository, CredentialRepository
- UI tests for critical flows (setup, unlock, add credential)
- Security tests: wrong password rejects, tampered ciphertext rejects

## Deliverables
1. Complete Android Studio project
2. `google-services.json` template (user adds their own)
3. README with build/run instructions
4. ProGuard rules for release
5. Firebase setup guide