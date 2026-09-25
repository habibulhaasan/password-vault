package com.passwordvault.di

import android.content.Context
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.passwordvault.data.remote.FirebaseCategoryRepository
import com.passwordvault.data.remote.FirebaseCredentialRepository
import com.passwordvault.data.remote.FirebaseVaultRepository
import com.passwordvault.data.repository.CategoryRepository
import com.passwordvault.data.repository.CredentialRepository
import com.passwordvault.data.repository.VaultRepository
import com.passwordvault.domain.usecase.CategoryUseCase
import com.passwordvault.domain.usecase.CredentialUseCase
import com.passwordvault.domain.usecase.VaultUseCase
import dagger.hilt.android.HiltAndroidApp
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.android.scopes.ActivityRetainedScoped
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@HiltAndroidApp
class PasswordVaultApplication : android.app.Application()

@Module
@InstallIn(SingletonComponent::class)
object FirebaseModule {

    @Provides
    @Singleton
    fun provideFirebaseAuth(): FirebaseAuth = FirebaseAuth.getInstance()

    @Provides
    @Singleton
    fun provideFirestore(): FirebaseFirestore = FirebaseFirestore.getInstance()
}

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideVaultRepository(
        auth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): VaultRepository = FirebaseVaultRepository(auth, firestore)

    @Provides
    @Singleton
    fun provideCredentialRepository(
        auth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): CredentialRepository = FirebaseCredentialRepository(auth, firestore)

    @Provides
    @Singleton
    fun provideCategoryRepository(
        auth: FirebaseAuth,
        firestore: FirebaseFirestore
    ): CategoryRepository = FirebaseCategoryRepository(auth, firestore)
}

@Module
@InstallIn(SingletonComponent::class)
object UseCaseModule {

    @Provides
    @Singleton
    fun provideVaultUseCase(
        vaultRepository: VaultRepository,
        credentialRepository: CredentialRepository
    ): VaultUseCase = VaultUseCase(vaultRepository, credentialRepository)

    @Provides
    @Singleton
    fun provideCredentialUseCase(
        credentialRepository: CredentialRepository,
        vaultRepository: VaultRepository
    ): CredentialUseCase = CredentialUseCase(credentialRepository, vaultRepository)

    @Provides
    @Singleton
    fun provideCategoryUseCase(
        categoryRepository: CategoryRepository
    ): CategoryUseCase = CategoryUseCase(categoryRepository)
}