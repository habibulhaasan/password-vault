package com.passwordvault.data.model

import kotlinx.serialization.Serializable

/**
 * Tag with usage count for tag cloud display.
 */
@Serializable
data class TagWithCount(
    val name: String,
    val count: Int
)

/**
 * Default tag suggestions matching the web app specification.
 */
object DefaultTags {
    val SUGGESTIONS = listOf(
        "personal",
        "work",
        "financial",
        "2FA",
        "important",
        "subscription",
        "rarely-used"
    )
}