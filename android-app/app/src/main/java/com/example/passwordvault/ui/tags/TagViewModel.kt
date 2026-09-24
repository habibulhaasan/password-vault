package com.example.passwordvault.ui.tags

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.passwordvault.data.models.Tag
import com.example.passwordvault.data.repository.FireStoreRepository
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel for Tag management UI.
 */
class TagViewModel : ViewModel() {
    val tags = FireStoreRepository.getTags()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun addTag(tag: Tag) {
        viewModelScope.launch { FireStoreRepository.addOrUpdateTag(tag) }
    }

    fun updateTag(tag: Tag) {
        viewModelScope.launch { FireStoreRepository.addOrUpdateTag(tag) }
    }

    fun deleteTag(tagId: String) {
        viewModelScope.launch { FireStoreRepository.deleteTag(tagId) }
    }
}

