package com.example.passwordvault.ui.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.passwordvault.data.models.Category
import com.example.passwordvault.data.repository.FireStoreRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel for Category management UI.
 */
class CategoryViewModel : ViewModel() {
    val categories = FireStoreRepository.getCategories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addCategory(category: Category) {
        viewModelScope.launch { FireStoreRepository.addOrUpdateCategory(category) }
    }

    fun updateCategory(category: Category) {
        viewModelScope.launch { FireStoreRepository.addOrUpdateCategory(category) }
    }

    fun deleteCategory(categoryId: String) {
        viewModelScope.launch { FireStoreRepository.deleteCategory(categoryId) }
    }
}
