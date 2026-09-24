package com.example.passwordvault.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import androidx.room.Delete
import com.example.passwordvault.data.models.Credential
import kotlinx.coroutines.flow.Flow

@Dao
interface CredentialDao {
    @Query("SELECT * FROM credentials")
    fun getAll(): Flow<List<Credential>>

    @Query("SELECT * FROM credentials WHERE id = :id")
    fun getById(id: String): Flow<Credential?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(credential: Credential)

    @Update
    suspend fun update(credential: Credential)

    @Delete
    suspend fun delete(credential: Credential)
}

