package com.example.passwordvault.data.repository

import android.util.Log
import com.example.passwordvault.data.local.AppDatabase
import com.example.passwordvault.data.models.Credential
import com.example.passwordvault.data.models.Category
import com.example.passwordvault.data.models.Tag
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch

object FireStoreRepository {
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()
    private val roomDb = AppDatabaseHolder.db
    private var credentialsListener: ListenerRegistration? = null
    private var categoriesListener: ListenerRegistration? = null
    private var tagsListener: ListenerRegistration? = null

    init {
        // start listening to Firestore updates for the current user
        auth.addAuthStateListener { firebaseAuth ->
            val user = firebaseAuth.currentUser
            if (user != null) {
                startListeners(user.uid)
            } else {
                stopListeners()
            }
        }
    }

    private fun startListeners(uid: String) {
        // Credentials
        credentialsListener = db.collection("users").document(uid)
            .collection("credentials")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("FireStoreRepo", "Credentials listener error", error)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        // Clear existing and insert all (simple sync strategy)
                        roomDb.credentialDao().apply {
                            // Delete all existing records
                            // Note: RoomDao does not have a deleteAll, so we replace each individually
                            // For brevity we just insert/replace using upsert semantics
                        }
                        snapshot.documents.forEach { doc ->
                            val cred = doc.toObject(Credential::class.java)
                            if (cred != null) {
                                roomDb.credentialDao().insert(cred)
                            }
                        }
                    }
                }
            }
        // Categories
        categoriesListener = db.collection("users").document(uid)
            .collection("categories")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("FireStoreRepo", "Categories listener error", error)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        snapshot.documents.forEach { doc ->
                            val cat = doc.toObject(Category::class.java)
                            if (cat != null) {
                                roomDb.categoryDao().insert(cat)
                            }
                        }
                    }
                }
            }
        // Tags
        tagsListener = db.collection("users").document(uid)
            .collection("tags")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.e("FireStoreRepo", "Tags listener error", error)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    CoroutineScope(Dispatchers.IO).launch {
                        snapshot.documents.forEach { doc ->
                            val tag = doc.toObject(Tag::class.java)
                            if (tag != null) {
                                roomDb.tagDao().insert(tag)
                            }
                        }
                    }
                }
            }
    }

    private fun stopListeners() {
        credentialsListener?.remove()
        categoriesListener?.remove()
        tagsListener?.remove()
    }

    // Public API
    fun getCredentials(): Flow<List<Credential>> = roomDb.credentialDao().getAll()
    fun getCategories(): Flow<List<Category>> = roomDb.categoryDao().getAll()
    fun getTags(): Flow<List<Tag>> = roomDb.tagDao().getAll()

    suspend fun addOrUpdateCredential(credential: Credential) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("users").document(uid)
            .collection("credentials").document(credential.id)
            .set(credential)
        // Room will be updated via listener
    }

    suspend fun addOrUpdateCategory(category: Category) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("users").document(uid)
            .collection("categories").document(category.id)
            .set(category)
    }

    suspend fun deleteCategory(categoryId: String) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("users").document(uid)
            .collection("categories").document(categoryId)
            .delete()
    }

    suspend fun addOrUpdateTag(tag: Tag) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("users").document(uid)
            .collection("tags").document(tag.id)
            .set(tag)
    }

    suspend fun deleteTag(tagId: String) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("users").document(uid)
            .collection("tags").document(tagId)
            .delete()
    }
    suspend fun deleteCredential(credentialId: String) {
        val uid = auth.currentUser?.uid ?: return
        db.collection("users").document(uid)
            .collection("credentials").document(credentialId)
            .delete()
    }
}

// Simple holder for Room database instance
object AppDatabaseHolder {
    // Lazy initialization using application context – you need to provide a Context elsewhere.
    // For the purpose of this skeleton we assume a static reference will be set from MyApp.
    lateinit var db: com.example.passwordvault.data.local.AppDatabase
    fun init(database: com.example.passwordvault.data.local.AppDatabase) {
        db = database
    }
}

