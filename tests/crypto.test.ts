import test, { describe } from "node:test";
import assert from "node:assert/strict";
import {
  generateSalt,
  saltToBase64,
  base64ToSalt,
  deriveVaultKey,
} from "@/lib/crypto/key-derivation";
import {
  encryptField,
  decryptField,
  generateIv,
  ivToBase64,
} from "@/lib/crypto/encryption";
import {
  createVaultVerificationToken,
  verifyVaultKey,
  encryptCredentialFields,
  decryptCredentialFields,
} from "@/lib/crypto/vault";
import type { EncryptedCredential } from "@/types/credential";

describe("Cryptographic Core & Master Password Tests", () => {
  describe("PBKDF2 Key Derivation", () => {
    test("generates 16-byte random salt", () => {
      const salt = generateSalt();
      assert.equal(salt.byteLength, 16);
    });

    test("serializes and deserializes salt to/from Base64", () => {
      const salt = generateSalt();
      const b64 = saltToBase64(salt);
      assert.equal(typeof b64, "string");
      const decoded = base64ToSalt(b64);
      assert.deepEqual(Array.from(decoded), Array.from(salt));
    });

    test("derives a CryptoKey with AES-GCM 256-bit algorithm", async () => {
      const salt = generateSalt();
      const key = await deriveVaultKey("MasterPassword123!", salt);
      assert.equal(key.algorithm.name, "AES-GCM");
      // Key should not be extractable for zero-knowledge security
      assert.equal(key.extractable, false);
    });

    test("derives different keys for different salts with same password", async () => {
      const pass = "IdenticalMasterPassword!";
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const key1 = await deriveVaultKey(pass, salt1);
      const key2 = await deriveVaultKey(pass, salt2);

      // Encrypt sample text with key1
      const enc = await encryptField("Secret", key1);
      // Key2 must fail to decrypt
      await assert.rejects(async () => {
        await decryptField(enc.ciphertext, enc.iv, key2);
      });
    });

    test("derives different keys for different passwords with same salt", async () => {
      const salt = generateSalt();
      const key1 = await deriveVaultKey("PasswordOne!", salt);
      const key2 = await deriveVaultKey("PasswordTwo!", salt);

      const enc = await encryptField("Secret", key1);
      await assert.rejects(async () => {
        await decryptField(enc.ciphertext, enc.iv, key2);
      });
    });
  });

  describe("AES-GCM Symmetric Encryption", () => {
    test("encrypts and decrypts UTF-8 plaintext with 100% fidelity", async () => {
      const salt = generateSalt();
      const key = await deriveVaultKey("TestPassword!2026", salt);
      const secret = "SuperSecret_P@ssw0rd!_12345_©_🔒";

      const enc = await encryptField(secret, key);
      assert.equal(typeof enc.ciphertext, "string");
      assert.equal(typeof enc.iv, "string");
      assert.notEqual(enc.ciphertext, secret);

      const decrypted = await decryptField(enc.ciphertext, enc.iv, key);
      assert.equal(decrypted, secret);
    });

    test("generates unique 12-byte IV for each encryption operation", () => {
      const iv1 = generateIv();
      const iv2 = generateIv();
      assert.equal(iv1.byteLength, 12);
      assert.equal(iv2.byteLength, 12);
      assert.notEqual(ivToBase64(iv1), ivToBase64(iv2));
    });

    test("fails authentication and rejects tampered ciphertext", async () => {
      const salt = generateSalt();
      const key = await deriveVaultKey("TestPassword!2026", salt);
      const enc = await encryptField("SensitiveData", key);

      // Corrupt the ciphertext by modifying a character
      const tamperedCiphertext =
        enc.ciphertext.substring(0, 4) +
        (enc.ciphertext[4] === "A" ? "B" : "A") +
        enc.ciphertext.substring(5);

      await assert.rejects(
        async () => {
          await decryptField(tamperedCiphertext, enc.iv, key);
        },
        /OperationError|tag mismatch|decrypt/i
      );
    });

    test("fails authentication and rejects corrupted IV", async () => {
      const salt = generateSalt();
      const key = await deriveVaultKey("TestPassword!2026", salt);
      const enc = await encryptField("SensitiveData", key);

      const corruptedIv = ivToBase64(generateIv()); // Different IV
      await assert.rejects(async () => {
        await decryptField(enc.ciphertext, corruptedIv, key);
      });
    });
  });

  describe("Canary Verification Token", () => {
    test("creates and validates canary verification token", async () => {
      const salt = generateSalt();
      const key = await deriveVaultKey("MasterPass!999", salt);
      const token = await createVaultVerificationToken(key);

      const isValid = await verifyVaultKey(token, key);
      assert.equal(isValid, true);
    });

    test("rejects verification token when checked with incorrect key", async () => {
      const salt = generateSalt();
      const key1 = await deriveVaultKey("CorrectPassword!1", salt);
      const key2 = await deriveVaultKey("WrongPassword!2", salt);
      const token = await createVaultVerificationToken(key1);

      const isValid = await verifyVaultKey(token, key2);
      assert.equal(isValid, false);
    });
  });

  describe("Master Password Rotation & Credential Batch Re-encryption", () => {
    test("re-encrypts multiple credentials with new key and invalidates old key", async () => {
      // 1. Setup old key
      const oldPass = "OldMasterPassword#2026";
      const oldSalt = generateSalt();
      const oldKey = await deriveVaultKey(oldPass, oldSalt);
      const oldToken = await createVaultVerificationToken(oldKey);
      assert.equal(await verifyVaultKey(oldToken, oldKey), true);

      // 2. Encrypt credentials with old key
      const records = [
        {
          title: "ProtonMail",
          username: "agent@proton.me",
          password: "ComplexPassword!1",
          notes: "Primary encrypted inbox",
        },
        {
          title: "GitHub Enterprise",
          username: "octocat_admin",
          password: "TokenGHO_9988776655",
          notes: "Personal access token",
        },
      ];

      const encryptedList: EncryptedCredential[] = [];
      for (const item of records) {
        const payload = await encryptCredentialFields(item, oldKey);
        encryptedList.push({
          id: `cred_${Math.random().toString(36).substring(2, 7)}`,
          title: item.title,
          encryptedUsername: payload.encryptedUsername,
          encryptedPassword: payload.encryptedPassword,
          encryptedNotes: payload.encryptedNotes,
          categoryId: "work",
          tags: ["security"],
          createdAt: null as unknown as EncryptedCredential["createdAt"],
          updatedAt: null as unknown as EncryptedCredential["updatedAt"],
        });
      }

      // 3. Derive new master key
      const newPass = "NewMasterPassword#2027";
      const newSalt = generateSalt();
      const newKey = await deriveVaultKey(newPass, newSalt);
      const newToken = await createVaultVerificationToken(newKey);
      assert.equal(await verifyVaultKey(newToken, newKey), true);
      assert.equal(await verifyVaultKey(newToken, oldKey), false);

      // 4. Decrypt with old key and re-encrypt with new key
      const reEncryptedList: EncryptedCredential[] = [];
      for (const cred of encryptedList) {
        const decrypted = await decryptCredentialFields(cred, oldKey);
        const newPayload = await encryptCredentialFields(
          {
            username: decrypted.username,
            password: decrypted.password,
            notes: decrypted.notes,
          },
          newKey
        );
        reEncryptedList.push({
          ...cred,
          encryptedUsername: newPayload.encryptedUsername,
          encryptedPassword: newPayload.encryptedPassword,
          encryptedNotes: newPayload.encryptedNotes,
        });
      }

      // 5. Old key fails to decrypt any re-encrypted records
      for (const cred of reEncryptedList) {
        await assert.rejects(async () => {
          await decryptCredentialFields(cred, oldKey);
        });
      }

      // 6. New key decrypts 100% original values
      for (let i = 0; i < records.length; i++) {
        const decrypted = await decryptCredentialFields(reEncryptedList[i], newKey);
        assert.equal(decrypted.username, records[i].username);
        assert.equal(decrypted.password, records[i].password);
        assert.equal(decrypted.notes, records[i].notes);
      }
    });
  });
});

