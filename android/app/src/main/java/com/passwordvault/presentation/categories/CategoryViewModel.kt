package com.passwordvault.presentation.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.passwordvault.data.model.Category
import com.passwordvault.data.model.Category.CategoryFormData
import com.passwordvault.domain.usecase.CategoryUseCase
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.launch

/**
 * ViewModel for category management.
 */
class CategoryViewModel(
    private val categoryUseCase: CategoryUseCase
) : ViewModel() {

    private val _categories = MutableStateFlow<List<Category>>(emptyList())
    val categories = _categories.distinctUntilChanged()

    private val _loading = MutableStateFlow(false)
    val loading = _loading.distinctUntilChanged()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.distinctUntilChanged()

    init {
        observeCategories()
    }

    private fun observeCategories() {
        viewModelScope.launch {
            categoryUseCase.observeCategories()
                .collect { _categories.value = it }
        }
    }

    val systemCategories = categories.map { it.filter { !it.isCustom } }
    val customCategories = categories.map { it.filter { it.isCustom } }

    suspend fun createCategory(data: CategoryFormData) {
        _loading.value = true
        _error.value = null
        try {
            categoryUseCase.createCategory(data)
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to create category"
            throw e
        } finally {
            _loading.value = false
        }
    }

    suspend fun updateCategory(id: String, data: CategoryFormData) {
        _loading.value = true
        _error.value = null
        try {
            categoryUseCase.updateCategory(id, data)
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to update category"
            throw e
        } finally {
            _loading.value = false
        }
    }

    suspend fun deleteCategory(id: String) {
        _loading.value = true
        _error.value = null
        try {
            categoryUseCase.deleteCategory(id)
        } catch (e: Exception) {
            _error.value = e.message ?: "Failed to delete category"
            throw e
        } finally {
            _loading.value = false
        }
    }

    fun getCategory(id: String): Category? = _categories.value.find { it.id == id }
}