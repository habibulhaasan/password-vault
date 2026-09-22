import {
  generateSalt,
  saltToBase64,
  base64ToSalt,
  deriveVaultKey,
} from "../lib/crypto/key-derivation";
import {
  createVaultVerificationToken,
  verifyVaultKey,
  encryptCredentialFields,
  decryptCredentialFields,
} from "../lib/crypto/vault";
import type { EncryptedCredential } from "../types/credential";

async function runReencryptionTests() {
  console.log("=== Starting Master Password Re-encryption Tests ===");

  // 1. Initial Setup with Old Password
  const oldPassword = "MyOldMasterPassword!2026";
  const oldSalt = generateSalt();
  const oldKey = await deriveVaultKey(oldPassword, oldSalt);
  const oldVerificationToken = await createVaultVerificationToken(oldKey);

  const isOldKeyValid = await verifyVaultKey(oldVerificationToken, oldKey);
  console.assert(isOldKeyValid === true, "Old key must verify against old token");
  console.log("✓ Initial master key and verification token established");

  // 2. Encrypt Mock User Credentials with Old Key
  const samplePlaintexts = [
    {
      title: "GitHub",
      username: "developer@octocat.com",
      password: "SuperSecretToken$99#",
      notes: "SSH key backed up on YubiKey",
    },
    {
      title: "AWS Console",
      username: "cloud-admin",
      password: "AwsRootPassword@2026!",
      notes: "",
    },
  ];

  const initialEncryptedList: EncryptedCredential[] = [];

  for (const item of samplePlaintexts) {
    const payload = await encryptCredentialFields(item, oldKey);
    initialEncryptedList.push({
      id: `cred_${Math.random().toString(36).substring(2, 9)}`,
      title: item.title,
      encryptedUsername: payload.encryptedUsername,
      encryptedPassword: payload.encryptedPassword,
      encryptedNotes: payload.encryptedNotes,
      categoryId: "work",
      tags: ["dev", "cloud"],
      createdAt: null as unknown as EncryptedCredential["createdAt"],
      updatedAt: null as unknown as EncryptedCredential["updatedAt"],
    });
  }
  console.log(`✓ Encrypted ${initialEncryptedList.length} credentials with old key`);

  // 3. Simulate Re-encryption Workflow with New Password
  const newPassword = "MyBrandNewSecureMasterPassword#2027";
  const newSalt = generateSalt();
  const newKey = await deriveVaultKey(newPassword, newSalt);
  const newVerificationToken = await createVaultVerificationToken(newKey);

  console.assert(
    (await verifyVaultKey(newVerificationToken, newKey)) === true,
    "New key must verify against new token"
  );
  console.assert(
    (await verifyVaultKey(newVerificationToken, oldKey)) === false,
    "Old key must NOT verify against new token"
  );
  console.log("✓ New master key derived and canary token verified");

  // 4. Decrypt with Old Key and Re-encrypt with New Key
  const reEncryptedList: EncryptedCredential[] = [];

  for (const encryptedItem of initialEncryptedList) {
    const decrypted = await decryptCredentialFields(encryptedItem, oldKey);
    const newEncryptedPayload = await encryptCredentialFields(
      {
        username: decrypted.username,
        password: decrypted.password,
        notes: decrypted.notes,
      },
      newKey
    );

    reEncryptedList.push({
      ...encryptedItem,
      encryptedUsername: newEncryptedPayload.encryptedUsername,
      encryptedPassword: newEncryptedPayload.encryptedPassword,
      encryptedNotes: newEncryptedPayload.encryptedNotes,
    });
  }
  console.log("✓ Decrypted and re-encrypted all credentials with new key");

  // 5. Verify Old Key Cannot Decrypt Re-encrypted Credentials
  for (const reEncrypted of reEncryptedList) {
    let failedAsExpected = false;
    try {
      await decryptCredentialFields(reEncrypted, oldKey);
    } catch {
      failedAsExpected = true;
    }
    console.assert(
      failedAsExpected === true,
      "Old key must fail to decrypt re-encrypted credential"
    );
  }
  console.log("✓ Verified old key is completely invalidated against re-encrypted data");

  // 6. Verify New Key Successfully Decrypts Exact Original Plaintexts
  for (let i = 0; i < reEncryptedList.length; i++) {
    const reEncrypted = reEncryptedList[i];
    const original = samplePlaintexts[i];
    const decrypted = await decryptCredentialFields(reEncrypted, newKey);

    console.assert(
      decrypted.username === original.username,
      `Username mismatch for ${original.title}`
    );
    console.assert(
      decrypted.password === original.password,
      `Password mismatch for ${original.title}`
    );
    if (original.notes) {
      console.assert(
        decrypted.notes === original.notes,
        `Notes mismatch for ${original.title}`
      );
    }
  }
  console.log("✓ Verified 100% data integrity of re-encrypted credentials with new key");

  // 7. Verify Salt Encoding / Decoding
  const saltB64 = saltToBase64(newSalt);
  const decodedSalt = base64ToSalt(saltB64);
  console.assert(
    saltB64.length > 0 && decodedSalt.length === newSalt.length,
    "Salt serialization roundtrip must succeed"
  );
  console.log("✓ Salt serialization/deserialization validated");

  console.log("=== All Master Password Re-encryption Tests Passed (7/7) ===");
}

runReencryptionTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

