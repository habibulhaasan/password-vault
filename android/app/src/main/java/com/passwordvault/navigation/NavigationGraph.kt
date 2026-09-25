package com.passwordvault.navigation

sealed interface AuthDestination {
    @Serializable
    data object Login : AuthDestination {
        val route = "login"
    }
    @Serializable
    data object Register : AuthDestination {
        val route = "register"
    }
    @Serializable
    data object ForgotPassword : AuthDestination {
        val route = "forgot-password"
    }
    @Serializable
    data object Guest : AuthDestination {
        val route = "guest"
    }
    @Serializable
    data class VaultSetup(val isGuest: Boolean = false) : AuthDestination {
        val route = "vault-setup"
    }
    @Serializable
    data object VaultUnlock : AuthDestination {
        val route = "vault-unlock"
    }
}

sealed interface MainDestination {
    @Serializable
    data object Vault : MainDestination {
        val route = "vault"
    }
    @Serializable
    data class CredentialForm(val credentialId: String? = null) : MainDestination {
        val route = "credential-form"
        companion object {
            val credentialIdArg = "credentialId"
        }
    }
    @Serializable
    data class CredentialDetail(val credentialId: String) : MainDestination {
        val route = "credential-detail"
        companion object {
            val credentialIdArg = "credentialId"
        }
    }
    @Serializable
    data object Categories : MainDestination {
        val route = "categories"
    }
    @Serializable
    data object Tags : MainDestination {
        val route = "tags"
    }
    @Serializable
    data object Generator : MainDestination {
        val route = "generator"
    }
    @Serializable
    data object Settings : MainDestination {
        val route = "settings"
    }
}

object NavigationGraph {
    enum class NavType(val type: String) {
        String("string"),
        Int("int"),
        Bool("bool"),
        Float("float")
    }
}