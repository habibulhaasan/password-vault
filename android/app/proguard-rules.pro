# ProGuard Rules for Password Vault

# Keep model classes for serialization
-keep class com.passwordvault.data.model.** { *; }

# Keep Hilt generated classes
-keep class dagger.hilt.** { *; }
-keep class com.passwordvault.Hilt_* { *; }

# Keep ViewModels
-keep class com.passwordvault.presentation.**ViewModel { *; }

# Keep crypto classes
-keep class com.passwordvault.crypto.** { *; }

# Keep domain use cases
-keep class com.passwordvault.domain.usecase.** { *; }

# Keep navigation
-keep class com.passwordvault.navigation.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }

# Kotlinx Serialization
-keep class kotlinx.serialization.** { *; }
-keep class com.passwordvault.data.model.**$$serializer { *; }

# Coroutines
-keep class kotlinx.coroutines.** { *; }

# Kotlinx Datetime
-keep class kotlinx.datetime.** { *; }

# Room
-keep class androidx.room.** { *; }

# Biometric
-keep class androidx.biometric.** { *; }

# Security Crypto
-keep class androidx.security.crypto.** { *; }

# Material 3
-keep class androidx.compose.material3.** { *; }

# Prevent optimization of crypto operations
-keepclassmembers class javax.crypto.** { *; }
-keepclassmembers class java.security.** { *; }

# Keep line numbers for debugging
-keepattributes SourceFile,LineNumberTable

# Keep annotations
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod