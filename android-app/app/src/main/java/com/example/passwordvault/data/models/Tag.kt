package com.example.passwordvault.data.models

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.firebase.firestore.DocumentId

@Entity(tableName = "tags")
data class Tag(
    @PrimaryKey @DocumentId val id: String = "",
    val name: String = "",
    val colorHex: String = "#FF0000"
)