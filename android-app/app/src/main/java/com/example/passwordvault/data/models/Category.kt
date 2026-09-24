package com.example.passwordvault.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.google.firebase.firestore.DocumentId

@Entity(tableName = "categories")
@TypeConverters(Converters::class)
data class Category(
    @PrimaryKey @DocumentId val id: String = "",
    val name: String = "",
    val colorHex: String = "#FFFFFF"
)

/**
 * Uses the shared Converters defined in Converters.kt for Room type conversion.
 */

