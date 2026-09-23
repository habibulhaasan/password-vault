const fs = require('fs');
const providerPath = 'providers/vault-provider.tsx';
let provider = fs.readFileSync(providerPath, 'utf8');

provider = provider.replace(
    '  base64ToSalt,\\n  deriveVaultKey,\\n} from "@/lib/crypto/key-derivation";',
    '  base64ToSalt,\\n  deriveVaultKey,\\n  bytesToBase64,\\n  base64ToBytes,\\n} from "@/lib/crypto/key-derivation";'
);

const autoLockEffect =   // Auto-lock listener based on session storage
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
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [vaultKey, autoLockMinutes, lockVault]);;

provider = provider.replace(/  \/\/ Inactivity auto-lock listener[\s\S]*?  }, \[vaultKey, autoLockMinutes, lockVault\]\);/, autoLockEffect);

const lockVault =   // Lock the vault, purging the CryptoKey from memory
  const lockVault = useCallback(() => {
    setVaultKey(null);
    setStatus("locked");
    sessionStorage.removeItem("vaultKey");
    sessionStorage.removeItem("vaultLockTime");
  }, []);;

provider = provider.replace(/  \/\/ Lock the vault, purging the CryptoKey from memory[\s\S]*?  \}, \[\]\);/, lockVault);

const syncVaultStart =     async function syncVault() {
      if (!user) {
        if (isMounted) {
          setVaultKey(null);
          setVaultSettings(null);
          setStatus("locked");
          sessionStorage.removeItem("vaultKey");
          sessionStorage.removeItem("vaultLockTime");
        }
        return;
      };

provider = provider.replace(/    async function syncVault\(\) \{[\s\S]*?        return;\n      \}/, syncVaultStart);

const restoreKeyLogic =           setVaultSettings(loadedSettings);
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
          };

provider = provider.replace(/          setVaultSettings\(loadedSettings\);\n          setAutoLockMinutes\(loadedSettings\.autoLockMinutes\);\n          setStatus\("locked"\);/, restoreKeyLogic);

const saveHelper =   const saveSession = async (key: CryptoKey, minutes: number) => {
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
  };;

provider = provider.replace('  // First-time setup:', saveHelper + '\\n\\n  // First-time setup:');

provider = provider.replace('    setVaultKey(key);\\n    lastActivityRef.current = Date.now();\\n    setStatus("unlocked");', '    setVaultKey(key);\\n    await saveSession(key, autoLockMinutes);\\n    setStatus("unlocked");');
provider = provider.replace('    setVaultKey(key);\n    lastActivityRef.current = Date.now();\n    setStatus("unlocked");', '    setVaultKey(key);\n    await saveSession(key, autoLockMinutes);\n    setStatus("unlocked");');

provider = provider.replace('        setVaultKey(candidateKey);\\n        lastActivityRef.current = Date.now();\\n        setStatus("unlocked");', '        setVaultKey(candidateKey);\\n        await saveSession(candidateKey, autoLockMinutes);\\n        setStatus("unlocked");');
provider = provider.replace('        setVaultKey(candidateKey);\n        lastActivityRef.current = Date.now();\n        setStatus("unlocked");', '        setVaultKey(candidateKey);\n        await saveSession(candidateKey, autoLockMinutes);\n        setStatus("unlocked");');

provider = provider.replace('    setVaultSettings(updatedSettings);\\n    setVaultKey(newKey);\\n    lastActivityRef.current = Date.now();', '    setVaultSettings(updatedSettings);\\n    setVaultKey(newKey);\\n    await saveSession(newKey, autoLockMinutes);');
provider = provider.replace('    setVaultSettings(updatedSettings);\n    setVaultKey(newKey);\n    lastActivityRef.current = Date.now();', '    setVaultSettings(updatedSettings);\n    setVaultKey(newKey);\n    await saveSession(newKey, autoLockMinutes);');


const updateAuto =   // Update auto-lock interval
  const updateAutoLockMinutes = async (minutes: number) => {
    setAutoLockMinutes(minutes);
    if (vaultKey) {
      if (minutes > 0) {
        sessionStorage.setItem("vaultLockTime", (Date.now() + minutes * 60 * 1000).toString());
      } else {
        sessionStorage.removeItem("vaultLockTime");
      }
    }
    if (user && vaultSettings) {;

provider = provider.replace('  // Update auto-lock interval\\n  const updateAutoLockMinutes = async (minutes: number) => {\\n    setAutoLockMinutes(minutes);\\n    if (user && vaultSettings) {', updateAuto);
provider = provider.replace('  // Update auto-lock interval\n  const updateAutoLockMinutes = async (minutes: number) => {\n    setAutoLockMinutes(minutes);\n    if (user && vaultSettings) {', updateAuto);

fs.writeFileSync(providerPath, provider, 'utf8');

const timersPath = 'components/layout/floating-timers.tsx';
let timers = fs.readFileSync(timersPath, 'utf8');

const timerLogic =   // Vault Timer Logic
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
  }, [status, autoLockMinutes]);;

timers = timers.replace(/  \/\/ Vault Timer Logic[\s\S]*?  \}, \[status, autoLockMinutes\]\);/, timerLogic);

fs.writeFileSync(timersPath, timers, 'utf8');
console.log("Done");
