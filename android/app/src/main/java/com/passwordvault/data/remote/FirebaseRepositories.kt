package com.passwordvault.data.remote

import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.FirebaseUser
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.passwordvault.data.model.Category
import com.passwordvault.data.model.Credential.*
import com.passwordvault.data.model.Tag.TagWithCount
import com.passwordvault.data.model.VaultSettings
import com.passwordvault.data.model.VaultUser
import com.passwordvault.data.repository.CategoryRepository
import com.passwordvault.data.repository.CredentialRepository
import com.passwordvault.data.repository.VaultRepository
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import kotlinx.datetime.Instant
import kotlinx.serialization.decodeFromJsonElement
import kotlinx.serialization.json.Json

/**
 * Firebase implementation of VaultRepository.
 */
class FirebaseVaultRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : VaultRepository {

    private val json = Json { ignoreUnknownKeys = true }

    override fun observeAuthState(): Flow<VaultUser?> = callbackFlow {
        val listener = auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            val vaultUser = user?.let {
                VaultUser(
                    uid = it.uid,
                    email = it.email,
                    displayName = it.displayName,
                    photoUrl = it.photoUrl.toString()
                )
            }
            trySend(vaultUser)
        }
        awaitClose { auth.removeAuthStateListener(listener) }
    }

    override suspend fun signIn(email: String, password: String): VaultUser {
        val result = auth.signInWithEmailAndPassword(email, password).await()
        return VaultUser(
            uid = result.user!!.uid,
            email = result.user!!.email,
            displayName = result.user!!.displayName,
            photoUrl = result.user!!.photoUrl.toString()
        )
    }

    override suspend fun signUp(email: String, password: String): VaultUser {
        val result = auth.createUserWithEmailAndPassword(email, password).await()
        return VaultUser(
            uid = result.user!!.uid,
            email = result.user!!.email,
            displayName = result.user!!.displayName,
            photoUrl = result.user!!.photoUrl.toString()
        )
    }

    override suspend fun sendPasswordResetEmail(email: String) {
        auth.sendPasswordResetEmail(email).await()
    }

    override suspend fun signOut() {
        auth.signOut()
    }

    private fun getSettingsRef(uid: String) = firestore.collection("users").document(uid).collection("settings").document("vault")

    private fun getCredentialsRef(uid: String) = firestore.collection("users").document(uid).collection("credentials")

    private fun getCategoriesRef(uid: String) = firestore.collection("users").document(uid).collection("categories")

    override suspend fun isVaultInitialized(): Boolean {
        val user = auth.currentUser ?: return false
        val doc = getSettingsRef(user.uid).get().await()
        return doc.exists()
    }

    override suspend fun setupVault(masterPassword: String, autoLockMinutes: Int): VaultSettings {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        // Note: Salt generation and key derivation happens in domain layer
        // This just stores the settings
        val settings = VaultSettings(
            salt = "", // Will be set by domain layer
            verificationToken = "", // Will be set by domain layer
            autoLockMinutes = autoLockMinutes
        )
        getSettingsRef(user.uid).set(settings).await()
        return settings
    }

    override suspend fun unlockVault(masterPassword: String): Boolean {
        // Verification happens in domain layer
        return true
    }

    override suspend fun changeMasterPassword(currentPassword: String, newPassword: String) {
        // Re-encryption happens in domain layer with batch writes
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        // This is a complex operation - see domain use case
    }

    override suspend fun updateAutoLockMinutes(minutes: Int) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        getSettingsRef(user.uid).update("autoLockMinutes", minutes, "updatedAt", Instant.now()).await()
    }

    override suspend fun getVaultSettings(): VaultSettings? {
        val user = auth.currentUser ?: return null
        val doc = getSettingsRef(user.uid).get().await()
        return if (doc.exists()) {
            json.decodeFromJsonElement<VaultSettings>(doc.data!!)
        } else null
    }

    override fun observeVaultSettings(): Flow<VaultSettings?> = callbackFlow {
        val user = auth.currentUser ?: return@callbackFlow
        val registration = getSettingsRef(user.uid).addSnapshotListener { snapshot, error ->
            if (error != null) {
                trySend(null)
                return@addSnapshotListener
            }
            val settings = snapshot?.data?.let { json.decodeFromJsonElement<VaultSettings>(it) }
            trySend(settings)
        }
        awaitClose { registration.remove() }
    }
}

/**
 * Firebase implementation of CredentialRepository.
 */
class FirebaseCredentialRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : CredentialRepository {

    private val json = Json { ignoreUnknownKeys = true }

    private fun getCredentialsRef(uid: String) = firestore.collection("users").document(uid).collection("credentials")

    override fun observeCredentials(): Flow<List<EncryptedCredential>> = callbackFlow {
        val user = auth.currentUser ?: return@callbackFlow
        val query = getCredentialsRef(user.uid).orderBy("updatedAt", com.google.firebase.firestore.Query.Direction.DESCENDING)
        val registration = query.addSnapshotListener { snapshot, error ->
            if (error != null) {
                trySend(emptyList())
                return@addSnapshotListener
            }
            val credentials = snapshot?.documents?.mapNotNull { doc ->
                try {
                    json.decodeFromJsonElement<EncryptedCredential>(doc.data)
                } catch (e: Exception) {
                    null
                }
            } ?: emptyList()
            trySend(credentials)
        }
        awaitClose { registration.remove() }
    }

    override suspend fun createCredential(dto: CreateEncryptedCredentialDTO): String {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        val ref = getCredentialsRef(user.uid).document()
        val data = dto.copy(id = ref.id)
        ref.set(data).await()
        return ref.id
    }

    override suspend fun updateCredential(id: String, dto: UpdateEncryptedCredentialDTO) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        getCredentialsRef(user.uid).document(id).update(
            dto.toJsonMap()
        ).await()
    }

    override suspend fun deleteCredential(id: String) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        getCredentialsRef(user.uid).document(id).delete().await()
    }

    override suspend fun getCredential(id: String): EncryptedCredential? {
        val user = auth.currentUser ?: return null
        val doc = getCredentialsRef(user.uid).document(id).get().await()
        return if (doc.exists()) {
            json.decodeFromJsonElement<EncryptedCredential>(doc.data!!)
        } else null
    }

    override suspend fun markAsLoggedIn(id: String) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        getCredentialsRef(user.uid).document(id).update(
            "lastLoginAt", Instant.now(),
            "updatedAt", Instant.now()
        ).await()
    }

    override fun observeTags(): Flow<List<TagWithCount>> = callbackFlow {
        val user = auth.currentUser ?: return@callbackFlow
        val registration = getCredentialsRef(user.uid).addSnapshotListener { snapshot, error ->
            if (error != null) {
                trySend(emptyList())
                return@addSnapshotListener
            }
            val allCredentials = snapshot?.documents?.mapNotNull { doc ->
                try {
                    json.decodeFromJsonElement<EncryptedCredential>(doc.data)
                } catch (e: Exception) {
                    null
                }
            } ?: emptyList()

            // Aggregate tags
            val tagCounts = mutableMapOf<String, Int>()
            allCredentials.forEach { cred ->
                cred.tags.forEach { tag ->
                    val trimmed = tag.trim()
                    if (trimmed.isNotEmpty()) {
                        tagCounts[trimmed] = tagCounts.getOrDefault(trimmed, 0) + 1
                    }
                }
            }

            val tags = tagCounts.map { (name, count) -> TagWithCount(name, count) }
                .sortedByDescending { it.count }
                .thenBy { it.name }

            trySend(tags)
        }
        awaitClose { registration.remove() }
    }

    override suspend fun renameTag(oldTag: String, newTag: String) {
        if (oldTag == newTag) return
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        val credsRef = getCredentialsRef(user.uid)
        val query = credsRef.whereArrayContains("tags", oldTag)
        val snapshot = query.get().await()

        val batch = firestore.batch()
        snapshot.documents.forEach { doc ->
            val cred = json.decodeFromJsonElement<EncryptedCredential>(doc.data!!)
            val updatedTags = cred.tags.map { if (it == oldTag) newTag else it }.distinct()
            batch.update(doc.reference, mapOf(
                "tags" to updatedTags,
                "updatedAt" to Instant.now()
            ))
        }
        batch.commit().await()
    }

    override suspend fun deleteTag(tagToDelete: String) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        val credsRef = getCredentialsRef(user.uid)
        val query = credsRef.whereArrayContains("tags", tagToDelete)
        val snapshot = query.get().await()

        val batch = firestore.batch()
        snapshot.documents.forEach { doc ->
            val cred = json.decodeFromJsonElement<EncryptedCredential>(doc.data!!)
            val updatedTags = cred.tags.filter { it != tagToDelete }
            batch.update(doc.reference, mapOf(
                "tags" to updatedTags,
                "updatedAt" to Instant.now()
            ))
        }
        batch.commit().await()
    }
}

/**
 * Firebase implementation of CategoryRepository.
 */
class FirebaseCategoryRepository(
    private val auth: FirebaseAuth = FirebaseAuth.getInstance(),
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) : CategoryRepository {

    private val json = Json { ignoreUnknownKeys = true }

    private fun getCategoriesRef(uid: String) = firestore.collection("users").document(uid).collection("categories")

    override fun observeCategories(): Flow<List<Category>> = callbackFlow {
        val user = auth.currentUser ?: return@callbackFlow
        val registration = getCategoriesRef(user.uid).addSnapshotListener { snapshot, error ->
            if (error != null) {
                trySend(emptyList())
                return@addSnapshotListener
            }
            val customCategories = snapshot?.documents?.mapNotNull { doc ->
                try {
                    json.decodeFromJsonElement<Category>(doc.data)
                } catch (e: Exception) {
                    null
                }
            } ?: emptyList()

            // Merge with system categories in domain layer
            trySend(customCategories)
        }
        awaitClose { registration.remove() }
    }

    override suspend fun createCategory(data: CategoryFormData): String {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        val ref = getCategoriesRef(user.uid).document()
        val category = Category(
            id = ref.id,
            label = data.label.trim(),
            icon = data.icon.trim(),
            isCustom = true,
            userId = user.uid,
            createdAt = Instant.now(),
            updatedAt = Instant.now()
        )
        ref.set(category).await()
        return ref.id
    }

    override suspend fun updateCategory(id: String, data: CategoryFormData) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        val isSystem = com.passwordvault.data.model.SystemCategories.isSystem(id)
        val ref = getCategoriesRef(user.uid).document(id)
        val updates = mapOf(
            "label" to data.label.trim(),
            "icon" to data.icon.trim(),
            "isCustom" to !isSystem,
            "userId" to user.uid,
            "updatedAt" to Instant.now()
        )
        ref.set(updates, SetOptions.merge()).await()
    }

    override suspend fun deleteCategory(id: String) {
        val user = auth.currentUser ?: throw IllegalStateException("User not authenticated")
        val isSystem = com.passwordvault.data.model.SystemCategories.isSystem(id)
        val ref = getCategoriesRef(user.uid).document(id)

        // Check for credentials using this category
        val credsRef = firestore.collection("users").document(user.uid).collection("credentials")
        val query = credsRef.whereEqualTo("categoryId", id)
        val snapshot = query.get().await()

        val batch = firestore.batch()
        if (!snapshot.isEmpty()) {
            snapshot.documents.forEach { doc ->
                batch.update(doc.reference, mapOf(
                    "categoryId" to "",
                    "updatedAt" to Instant.now()
                ))
            }
            if (isSystem) {
                batch.set(ref, mapOf("isDeleted" to true, "updatedAt" to Instant.now()), SetOptions.merge())
            } else {
                batch.delete(ref)
            }
        } else {
            if (isSystem) {
                batch.set(ref, mapOf("isDeleted" to true, "updatedAt" to Instant.now()), SetOptions.merge())
            } else {
                batch.delete(ref)
            }
        }
        batch.commit().await()
    }

    override suspend fun getCategory(id: String): Category? {
        val user = auth.currentUser ?: return null
        val doc = getCategoriesRef(user.uid).document(id).get().await()
        return if (doc.exists()) {
            json.decodeFromJsonElement<Category>(doc.data!!)
        } else null
    }
}

private fun UpdateEncryptedCredentialDTO.toJsonMap(): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>("updatedAt" to kotlinx.datetime.Instant.now())
    title?.let { map["title"] = it }
    encryptedUsername?.let { map["encryptedUsername"] = it }
    encryptedPassword?.let { map["encryptedPassword"] = it }
    encryptedNotes?.let { map["encryptedNotes"] = it }
    websiteUrl?.let { map["websiteUrl"] = it }
    logoUrl?.let { map["logoUrl"] = it }
    categoryId?.let { map["categoryId"] = it }
    tags?.let { map["tags"] = it }
    lastLoginAt?.let { map["lastLoginAt"] = it }
    return map
}