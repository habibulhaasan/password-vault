package com.example.passwordvault

import android.app.Application
import com.google.firebase.FirebaseApp

class MyApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        // Initialize Room database
        val db = androidx.room.Room.databaseBuilder(
            applicationContext,
            com.example.passwordvault.data.local.AppDatabase::class.java,
            "password_vault_db"
        ).fallbackToDestructiveMigration().build()
        // Store in holder for repository access
        com.example.passwordvault.data.repository.AppDatabaseHolder.init(db)
        // Enable offline persistence for Firestore
        // Enable offline persistence for Firestore using new settings API
        val firestore = com.google.firebase.firestore.FirebaseFirestore.getInstance()
        val settings = com.google.firebase.firestore.FirebaseFirestoreSettings.Builder()
            .setPersistenceEnabled(true)
            .build()
        firestore.firestoreSettings = settings
    }
}

