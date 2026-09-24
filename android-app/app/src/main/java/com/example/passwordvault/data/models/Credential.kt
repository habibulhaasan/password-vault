package com.example.passwordvault.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.google.firebase.firestore.DocumentId

@Entity(tableName = "credentials")
@TypeConverters(StringListConverter::class) // 1. Update the reference here
data class Credential(
    @PrimaryKey @DocumentId val id: String = "",
    val title: String = "",
    val username: String = "",
    val password: String = "",
    val url: String = "",
    val notes: String = "",
    val categoryId: String = "",
    val tagIds: List<String> = emptyList()
)

/**
 * Converters for Room to store List<String> as a single String.
 */
class StringListConverter { // 2. Rename the class to avoid conflicts
    @TypeConverter
    fun fromList(value: List<String>): String = value.joinToString(",")

    @TypeConverter
    fun toList(value: String): List<String> =
        if (value.isEmpty()) emptyList() else value.split(",")
}