package com.example.passwordvault.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.passwordvault.data.models.Credential
import com.example.passwordvault.data.models.Category
import com.example.passwordvault.data.models.Tag

@Database(entities = [Credential::class, Category::class, Tag::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun credentialDao(): CredentialDao
    abstract fun categoryDao(): CategoryDao
    abstract fun tagDao(): TagDao
}

