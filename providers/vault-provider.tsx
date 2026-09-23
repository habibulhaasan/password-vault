"use client";

import React, {
  createContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  db,
  getSettingsDocRef,
  getCredentialsRef,
  getCredentialDocRef,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from "@/lib/firebase/firestore";
import {
  generateSalt,
  saltToBase64,
  base64ToSalt,
  deriveVaultKey,
  bytesToBase64,
  base64ToBytes,
} from "@/lib/crypto/key-derivation";
import {
  createVaultVerificationToken,
  verifyVaultKey,
  decryptCredentialFields,
  encryptCredentialFields,
} from "@/lib/crypto/vault";

export type VaultStatus = "loading" | "uninitialized" | "locked" | "unlocked";

interface StoredVaultSettings {
  salt: string;
  verificationToken: string;
  autoLockMinutes: number;
}

export interface VaultContextType {
  status: VaultStatus;
  vaultKey: CryptoKey | null;
  autoLockMinutes: number;
  setupVault: (masterPassword: string) => Promise<void>;
  unlockVault: (masterPassword: string) => Promise<boolean>;
  lockVault: () => void;
  updateAutoLockMinutes: (minutes: number) => Promise<void>;
  changeMasterPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
}

export const VaultContext = createContext<VaultContextType | undefined>(undefined);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [status, setStatus] = useState<VaultStatus>("loading");
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);
  const [autoLockMinutes, setAutoLockMinutes] = useState<number>(15);
  const [vaultSettings, setVaultSettings] = useState<StoredVaultSettings | null>(
    null
  );


  // Lock the vault, purging the CryptoKey from memory
  const lockVault = useCallback(() => {
    setVaultKey(null);
    setStatus("locked");
    sessionStorage.removeItem("vaultKey");
    sessionStorage.removeItem("vaultLockTime");
  }, []);

  // Auto-lock listener based on session storage
  useEffect(() => {
    if (!vaultKey || autoLockMinutes <= 0) return;

    const interval = setInterval(() => {
      const lockAtStr = sessionStorage.getItem("vaultLockTime");
      if (lockAtStr) {
        const lockAt = parseInt(lockAtStr, 10);
        if (Date.now() >= lockAt) {
          lockVault();
        }
      }
    }, 1000); // Check every 1 second

    return () => {
      clearInterval(interval);
    };
  }, [vaultKey, autoLockMinutes, lockVault]);

  // Load vault configuration from Firestore
  useEffect(() => {
    let isMounted = true;

    async function syncVault() {
      if (!user) {
        if (isMounted) {
          setVaultKey(null);
          setVaultSettings(null);
          setStatus("locked");
          sessionStorage.removeItem("vaultKey");
          sessionStorage.removeItem("vaultLockTime");
        }
        return;
      }

      try {
        const docRef = getSettingsDocRef(user.uid, "vault");
        const docSnap = await getDoc(docRef);

        if (!isMounted) return;

        if (docSnap.exists()) {
          const data = docSnap.data();
          const loadedSettings: StoredVaultSettings = {
            salt: data.salt,
            verificationToken: data.verificationToken,
            autoLockMinutes:
              typeof data.autoLockMinutes === "number"
                ? data.autoLockMinutes
                : 15,
          };
          setVaultSettings(loadedSettings);
          setAutoLockMinutes(loadedSettings.autoLockMinutes);

          // Try to restore from session storage
          const storedKeyBase64 = sessionStorage.getItem("vaultKey");
          const storedLockTime = sessionStorage.getItem("vaultLockTime");

          let restored = false;
          if (storedKeyBase64) {
            try {
              const raw = base64ToBytes(storedKeyBase64);
              const key = await crypto.subtle.importKey(
                "raw",
                raw.buffer as ArrayBuffer,
                "AES-GCM",
                true,
                ["encrypt", "decrypt"]
              );

              if (loadedSettings.autoLockMinutes === 0 || (storedLockTime && Date.now() < parseInt(storedLockTime, 10))) {
                setVaultKey(key);
                setStatus("unlocked");
                restored = true;
              } else {
                sessionStorage.removeItem("vaultKey");
                sessionStorage.removeItem("vaultLockTime");
              }
            } catch (e) {
              console.warn("Failed to restore key", e);
            }
          }

          if (!restored) {
            setStatus("locked");
          }
        } else {
          setVaultSettings(null);
          setStatus("uninitialized");
        }
      } catch (err) {
        if (!isMounted) return;
        console.warn("Failed to retrieve vault configuration:", err);
        setStatus("locked");
      }
    }

    syncVault();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const saveSession = async (key: CryptoKey, minutes: number) => {
    try {
      const raw = await crypto.subtle.exportKey("raw", key);
      const base64 = bytesToBase64(new Uint8Array(raw));
      sessionStorage.setItem("vaultKey", base64);
      if (minutes > 0) {
        sessionStorage.setItem("vaultLockTime", (Date.now() + minutes * 60 * 1000).toString());
      } else {
        sessionStorage.removeItem("vaultLockTime");
      }
    } catch (e) {
      console.warn("Failed to export key", e);
    }
  };

  // First-time setup: initialize master password, salt, and canary verification token
  const setupVault = async (masterPassword: string) => {
    if (!user) throw new Error("Authentication required to set up vault");

    const salt = generateSalt();
    const key = await deriveVaultKey(masterPassword, salt);
    const verificationToken = await createVaultVerificationToken(key);
    const saltBase64 = saltToBase64(salt);

    const newSettings: StoredVaultSettings = {
      salt: saltBase64,
      verificationToken,
      autoLockMinutes,
    };

    const docRef = getSettingsDocRef(user.uid, "vault");
    await setDoc(docRef, {
      ...newSettings,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    setVaultSettings(newSettings);
    setVaultKey(key);
    await saveSession(key, autoLockMinutes);
    setStatus("unlocked");
  };

  // Unlock existing vault with Master Password
  const unlockVault = async (masterPassword: string): Promise<boolean> => {
    if (!vaultSettings) return false;

    try {
      const salt = base64ToSalt(vaultSettings.salt);
      const candidateKey = await deriveVaultKey(masterPassword, salt);
      const isValid = await verifyVaultKey(
        vaultSettings.verificationToken,
        candidateKey
      );

      if (isValid) {
        setVaultKey(candidateKey);
        await saveSession(candidateKey, autoLockMinutes);
        setStatus("unlocked");
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Update auto-lock interval
  const updateAutoLockMinutes = async (minutes: number) => {
    setAutoLockMinutes(minutes);
    if (vaultKey) {
      if (minutes > 0) {
        sessionStorage.setItem("vaultLockTime", (Date.now() + minutes * 60 * 1000).toString());
      } else {
        sessionStorage.removeItem("vaultLockTime");
      }
    }
    if (user && vaultSettings) {
      try {
        const docRef = getSettingsDocRef(user.uid, "vault");
        await updateDoc(docRef, {
          autoLockMinutes: minutes,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn("Failed to persist auto-lock setting:", err);
      }
    }
  };

  // Change master password: securely re-encrypts all credentials and updates settings atomically
  const changeMasterPassword = async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (!user) throw new Error("Authentication required to change master password");
    if (!vaultKey) throw new Error("Vault must be unlocked to change master password");
    if (!vaultSettings) throw new Error("Vault settings not loaded");

    // 1. Verify current master password
    const currentSalt = base64ToSalt(vaultSettings.salt);
    const candidateCurrentKey = await deriveVaultKey(currentPassword, currentSalt);
    const isValid = await verifyVaultKey(
      vaultSettings.verificationToken,
      candidateCurrentKey
    );
    if (!isValid) {
      throw new Error("Current master password is incorrect");
    }

    // 2. Generate new salt and derive new 256-bit AES-GCM key
    const newSalt = generateSalt();
    const newKey = await deriveVaultKey(newPassword, newSalt);
    const newVerificationToken = await createVaultVerificationToken(newKey);
    const newSaltBase64 = saltToBase64(newSalt);

    // 3. Fetch all existing encrypted credentials for this user
    const credsSnap = await getDocs(getCredentialsRef(user.uid));

    // 4. Decrypt each credential using active vaultKey and re-encrypt using newKey
    const reEncryptedItems: {
      id: string;
      encryptedUsername: string;
      encryptedPassword: string;
      encryptedNotes: string | null;
    }[] = [];

    for (const docSnap of credsSnap.docs) {
      const cred = docSnap.data();
      const decrypted = await decryptCredentialFields(cred, vaultKey);
      const reEncrypted = await encryptCredentialFields(
        {
          username: decrypted.username,
          password: decrypted.password,
          notes: decrypted.notes,
        },
        newKey
      );
      reEncryptedItems.push({
        id: docSnap.id,
        encryptedUsername: reEncrypted.encryptedUsername,
        encryptedPassword: reEncrypted.encryptedPassword,
        encryptedNotes: reEncrypted.encryptedNotes ?? null,
      });
    }

    // 5. Commit atomically via Firestore writeBatch in chunks <= 400
    const settingsDocRef = getSettingsDocRef(user.uid, "vault");

    if (reEncryptedItems.length === 0) {
      await updateDoc(settingsDocRef, {
        salt: newSaltBase64,
        verificationToken: newVerificationToken,
        updatedAt: serverTimestamp(),
      });
    } else {
      const BATCH_SIZE = 400;
      for (let i = 0; i < reEncryptedItems.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const chunk = reEncryptedItems.slice(i, i + BATCH_SIZE);
        for (const item of chunk) {
          const docRef = getCredentialDocRef(user.uid, item.id);
          batch.update(docRef, {
            encryptedUsername: item.encryptedUsername,
            encryptedPassword: item.encryptedPassword,
            encryptedNotes: item.encryptedNotes,
            updatedAt: serverTimestamp(),
          });
        }
        // Include the settings document in the last batch
        if (i + BATCH_SIZE >= reEncryptedItems.length) {
          batch.update(settingsDocRef, {
            salt: newSaltBase64,
            verificationToken: newVerificationToken,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    }

    // 6. Update in-memory state
    const updatedSettings: StoredVaultSettings = {
      salt: newSaltBase64,
      verificationToken: newVerificationToken,
      autoLockMinutes,
    };
    setVaultSettings(updatedSettings);
    setVaultKey(newKey);
    await saveSession(newKey, autoLockMinutes);
  };

  return (
    <VaultContext.Provider
      value={{
        status,
        vaultKey,
        autoLockMinutes,
        setupVault,
        unlockVault,
        lockVault,
        updateAutoLockMinutes,
        changeMasterPassword,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
