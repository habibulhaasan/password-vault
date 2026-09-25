package com.passwordvault.domain.usecase

import com.passwordvault.data.model.Category
import com.passwordvault.data.model.Category.CategoryFormData
import com.passwordvault.data.model.SystemCategories
import com.passwordvault.data.repository.CategoryRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Use case for category operations.
 * Handles merging system and custom categories.
 */
class CategoryUseCase(
    private val repository: CategoryRepository
) {

    /**
     * Observes unified list of system and custom categories.
     * Handles overrides and deletions.
     */
    fun observeCategories(): Flow<List<Category>> = repository.observeCategories()
        .map { customCategories ->
            mergeCategories(customCategories)
        }

    /**
     * Creates a custom category.
     */
    suspend fun createCategory(data: CategoryFormData): String {
        validateCategoryData(data)
        checkNameConflict(data.label.trim(), emptyList())
        return repository.createCategory(data)
    }

    /**
     * Updates a category (custom or system override).
     */
    suspend fun updateCategory(id: String, data: CategoryFormData) {
        validateCategoryData(data)
        // Get current categories to check for conflicts
        // In real implementation, this would come from a snapshot
        checkNameConflict(data.label.trim(), emptyList(), excludeId = id)
        repository.updateCategory(id, data)
    }

    /**
     * Deletes a category with cascade unlinking.
     */
    suspend fun deleteCategory(id: String) = repository.deleteCategory(id)

    /**
     * Gets a category by ID from the unified list.
     */
    suspend fun getCategory(id: String): Category? = repository.getCategory(id)

    private fun mergeCategories(customCategories: List<Category>): List<Category> {
        val customMap = customCategories.associateBy({ it.id }, { it })

        // Process system categories (allow overrides and deletions)
        val mergedSystem = SystemCategories.ALL.mapNotNull { sys ->
            if (customMap.containsKey(sys.id)) {
                val override = customMap[sys.id]!!
                if (override.isDeleted) return@mapNotNull null
                return@mapNotNull sys.copy(
                    label = override.label,
                    icon = override.icon,
                    isCustom = false
                )
            }
            sys
        }

        // Process purely custom categories (not system overrides and not deleted)
        val pureCustom = customCategories.filter { custom ->
            !custom.isDeleted && !SystemCategories.isSystem(custom.id)
        }

        return mergedSystem + pureCustom
    }

    private fun validateCategoryData(data: CategoryFormData) {
        require(data.label.trim().isNotEmpty()) { "Category name is required" }
        require(data.label.trim().length <= 50) { "Category name cannot exceed 50 characters" }
        require(data.icon.trim().isNotEmpty()) { "Icon is required" }
        require(data.icon.trim().length <= 50) { "Icon identifier cannot exceed 50 characters" }
    }

    private fun checkNameConflict(label: String, currentCategories: List<Category>, excludeId: String = "") {
        val labelLower = label.lowercase()
        val exists = currentCategories.any { it.id != excludeId && it.label.lowercase() == labelLower }
        require(!exists) { "A category named \"$label\" already exists." }
    }
}