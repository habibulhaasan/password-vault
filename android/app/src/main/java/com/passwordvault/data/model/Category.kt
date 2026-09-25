package com.passwordvault.data.model

import android.os.Parcelable
import kotlinx.datetime.Instant
import kotlinx.parcelize.Parcelize
import kotlinx.serialization.Serializable

/**
 * Category model for organizing credentials.
 * System categories are predefined, custom categories are user-created.
 */
@Serializable
@Parcelize
data class Category(
    val id: String,
    val label: String,
    val icon: String,
    val isCustom: Boolean = false,
    val isDeleted: Boolean = false,
    val userId: String? = null,
    val createdAt: Instant? = null,
    val updatedAt: Instant? = null
) : Parcelable

/**
 * Form data for creating/updating a category.
 */
@Serializable
data class CategoryFormData(
    val label: String,
    val icon: String
)

/**
 * System category definitions matching the web app.
 */
object SystemCategories {
    private const val ICON_GLOBE = "globe"
    private const val ICON_BRIEFCASE = "briefcase"
    private const val ICON_LANDMARK = "landmark"
    private const val ICON_USERS = "users"
    private const val ICON_SHOPPING_CART = "shopping-cart"
    private const val ICON_GRADUATION_CAP = "graduation-cap"
    private const val ICON_CODE = "code"
    private const val ICON_BUILDING_2 = "building-2"
    private const val ICON_HEART = "heart"
    private const val ICON_GAMEPAD = "gamepad"
    private const val ICON_MORE = "more"

    val ALL = listOf(
        Category("personal", "Personal", ICON_GLOBE, isCustom = false),
        Category("work", "Work", ICON_BRIEFCASE, isCustom = false),
        Category("finance", "Finance", ICON_LANDMARK, isCustom = false),
        Category("social", "Social", ICON_USERS, isCustom = false),
        Category("shopping", "Shopping", ICON_SHOPPING_CART, isCustom = false),
        Category("education", "Education", ICON_GRADUATION_CAP, isCustom = false),
        Category("development", "Development", ICON_CODE, isCustom = false),
        Category("government", "Government", ICON_BUILDING_2, isCustom = false),
        Category("health", "Health", ICON_HEART, isCustom = false),
        Category("entertainment", "Entertainment", ICON_GAMEPAD, isCustom = false),
        Category("other", "Other", ICON_MORE, isCustom = false)
    )

    val ID_TO_LABEL = ALL.associateBy({ it.id }, { it.label })
    val ID_TO_ICON = ALL.associateBy({ it.id }, { it.icon })

    fun getById(id: String): Category? = ALL.find { it.id == id }
    fun isSystem(id: String): Boolean = ALL.any { it.id == id }
}