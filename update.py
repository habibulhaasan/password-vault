import re
import os

provider_path = r'providers\vault-provider.tsx'
with open(provider_path, 'r', encoding='utf-8') as f:
    provider = f.read()

# Add bytesToBase64, base64ToBytes to imports
provider = provider.replace(
    '  base64ToSalt,\n  deriveVaultKey,\n} from "@/lib/crypto/key-derivation";',
    '  base64ToSalt,\n  deriveVaultKey,\n  bytesToBase64,\n  base64ToBytes,\n} from "@/lib/crypto/key-derivation";'
)

# Replace Inactivity auto-lock listener
auto_lock_effect = '''  // Auto-lock listener based on session storage
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
  }, [vaultKey, autoLockMinutes, lockVault]);'''

provider = re.sub(
    r'  // Inactivity auto-lock listener.*?  }, \[vaultKey, autoLockMinutes, lockVault\]\);',
    auto_lock_effect,
    provider,
    flags=re.DOTALL
)

# Update lockVault
lock_vault = '''  // Lock the vault, purging the CryptoKey from memory
  const lockVault = useCallback(() => {
    setVaultKey(null);
    setStatus("locked");
    sessionStorage.removeItem("vaultKey");
    sessionStorage.removeItem("vaultLockTime");
  }, []);'''

provider = re.sub(
    r'  // Lock the vault, purging the CryptoKey from memory\n  const lockVault = useCallback\(\(\) => \{\n    setVaultKey\(null\);\n    setStatus\("locked"\);\n  \}, \[\]\);',
    lock_vault,
    provider
)

# Add load from sessionStorage in syncVault effect
sync_vault_start = '''    async function syncVault() {
      if (!user) {
        if (isMounted) {
          setVaultKey(null);
          setVaultSettings(null);
          setStatus("locked");
          sessionStorage.removeItem("vaultKey");
          sessionStorage.removeItem("vaultLockTime");
        }
        return;
      }'''

provider = provider.replace(
    '    async function syncVault() {\n      if (!user) {\n        if (isMounted) {\n          setVaultKey(null);\n          setVaultSettings(null);\n          setStatus("locked");\n        }\n        return;\n      }',
    sync_vault_start
)

# Where it sets loaded settings, try to restore key
restore_key_logic = '''          setVaultSettings(loadedSettings);
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
                raw,
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
          }'''

provider = provider.replace(
    '          setVaultSettings(loadedSettings);\n          setAutoLockMinutes(loadedSettings.autoLockMinutes);\n          setStatus("locked");',
    restore_key_logic
)

# Helper to save to session storage
save_helper = '''  const saveSession = async (key: CryptoKey, minutes: number) => {
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
  };'''

# Add saveSession before setupVault
provider = provider.replace(
    '  // First-time setup:',
    save_helper + '\\n\\n  // First-time setup:'
)

# Update setupVault
provider = provider.replace(
    '    setVaultKey(key);\n    lastActivityRef.current = Date.now();\n    setStatus("unlocked");',
    '    setVaultKey(key);\n    await saveSession(key, autoLockMinutes);\n    setStatus("unlocked");'
)

# Update unlockVault
provider = provider.replace(
    '        setVaultKey(candidateKey);\n        lastActivityRef.current = Date.now();\n        setStatus("unlocked");',
    '        setVaultKey(candidateKey);\n        await saveSession(candidateKey, autoLockMinutes);\n        setStatus("unlocked");'
)

# Update changeMasterPassword
provider = provider.replace(
    '    setVaultSettings(updatedSettings);\n    setVaultKey(newKey);\n    lastActivityRef.current = Date.now();',
    '    setVaultSettings(updatedSettings);\n    setVaultKey(newKey);\n    await saveSession(newKey, autoLockMinutes);'
)

# Update autoLockMinutes
update_auto = '''  // Update auto-lock interval
  const updateAutoLockMinutes = async (minutes: number) => {
    setAutoLockMinutes(minutes);
    if (vaultKey) {
      if (minutes > 0) {
        sessionStorage.setItem("vaultLockTime", (Date.now() + minutes * 60 * 1000).toString());
      } else {
        sessionStorage.removeItem("vaultLockTime");
      }
    }
    if (user && vaultSettings) {'''

provider = provider.replace(
    '  // Update auto-lock interval\n  const updateAutoLockMinutes = async (minutes: number) => {\n    setAutoLockMinutes(minutes);\n    if (user && vaultSettings) {',
    update_auto
)

with open(provider_path, 'w', encoding='utf-8') as f:
    f.write(provider)

timers_path = r'components\layout\floating-timers.tsx'
with open(timers_path, 'r', encoding='utf-8') as f:
    timers = f.read()

timer_logic = '''  // Vault Timer Logic
  useEffect(() => {
    if (status !== "unlocked" || !autoLockMinutes) {
      setVaultTimeLeft(null);
      return;
    }

    const interval = setInterval(() => {
      const lockAtStr = sessionStorage.getItem("vaultLockTime");
      if (!lockAtStr) {
        setVaultTimeLeft(null);
        return;
      }
      const lockAt = parseInt(lockAtStr, 10);
      const remaining = lockAt - Date.now();
      if (remaining <= 0) {
        setVaultTimeLeft(null);
      } else {
        setVaultTimeLeft(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [status, autoLockMinutes]);'''

timers = re.sub(
    r'  // Vault Timer Logic.*?  \}, \[status, autoLockMinutes\]\);',
    timer_logic,
    timers,
    flags=re.DOTALL
)

with open(timers_path, 'w', encoding='utf-8') as f:
    f.write(timers)

print("Done")
