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
  getSettingsDocRef,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "@/lib/firebase/firestore";
import {
  generateSalt,
  saltToBase64,
  base64ToSalt,
  deriveVaultKey,
} from "@/lib/crypto/key-derivation";
import {
  createVaultVerificationToken,
  verifyVaultKey,
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

  // Initialize ref with 0 to maintain render purity
  const lastActivityRef = useRef<number>(0);

  // Lock the vault, purging the CryptoKey from memory
  const lockVault = useCallback(() => {
    setVaultKey(null);
    setStatus("locked");
  }, []);

  // Inactivity auto-lock listener
  useEffect(() => {
    if (!vaultKey || autoLockMinutes <= 0) return;

    lastActivityRef.current = Date.now();

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    const interval = setInterval(() => {
      const elapsedMinutes = (Date.now() - lastActivityRef.current) / (1000 * 60);
      if (elapsedMinutes >= autoLockMinutes) {
        lockVault();
      }
    }, 15000); // Check every 15 seconds

    return () => {
      clearInterval(interval);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
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
          setStatus("locked");
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
    lastActivityRef.current = Date.now();
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
        lastActivityRef.current = Date.now();
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
      }}
    >
      {children}
    </VaultContext.Provider>
  );
}
