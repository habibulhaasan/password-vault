package com.passwordvault.data.repository

import com.passwordvault.data.model.Category
import com.passwordvault.data.model.Category.CategoryFormData
import kotlinx.coroutines.flow.Flow

/**
 * Repository interface for category operations.
 */
interface CategoryRepository {

    /**
     * Real-time stream of categories (system + custom) for the current user.
     */
    fun observeCategories(): Flow<List<Category>>

    /**
     * Creates a custom category.
     */
    suspend fun createCategory(data: CategoryFormData): String

    /**
     * Updates a category (works for both custom and system overrides).
     */
    suspend fun updateCategory(id: String, data: CategoryFormData)

    /**
     * Deletes a category with cascade unlinking of credentials.
     */
    suspend fun deleteCategory(id: String)

    /**
     * Gets a category by ID.
     */
    suspend fun getCategory(id: String): Category?
}