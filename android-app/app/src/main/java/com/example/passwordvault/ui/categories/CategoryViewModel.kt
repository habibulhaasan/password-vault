package com.example.passwordvault.ui.categories

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.launch

class CategoryViewModel : ViewModel() {
    private val db = FirebaseFirestore.getInstance()
    private val auth = FirebaseAuth.getInstance()

    fun addCategory(label: String) {
        val uid = auth.currentUser?.uid ?: return
        viewModelScope.launch {
            val data = hashMapOf(
                "label" to label,
                "isCustom" to true,
                "icon" to "folder"
            )
            db.collection("users").document(uid).collection("categories").add(data)
        }
    }
}
