const fs = require('fs');
const providerPath = 'providers/vault-provider.tsx';
let provider = fs.readFileSync(providerPath, 'utf8');

const regex = /const reEncryptedItems: \{\n[\s\S]*?\}\[\] = \[\];\n\n      for \(const docSnap of credsSnap.docs\) \{\n[\s\S]*?\}\);/m;

const replacement = \const reEncryptedItems: {
        id: string;
        encryptedUsername: string;
        encryptedPassword: string;
        encryptedNotes: string | null;
        encryptedRecoveryEmail: string | null;
        encryptedMobile: string | null;
        encryptedSecurityQuestion: string | null;
        encryptedAnswer: string | null;
      }[] = [];

      for (const docSnap of credsSnap.docs) {
        const cred = docSnap.data() as any;
        const decrypted = await decryptCredentialFields(cred, vaultKey);
        const reEncrypted = await encryptCredentialFields(
          {
            username: decrypted.username,
            password: decrypted.password,
            notes: decrypted.notes,
            recoveryEmail: decrypted.recoveryEmail,
            mobile: decrypted.mobile,
            securityQuestion: decrypted.securityQuestion,
            answer: decrypted.answer,
          },
          newKey
        );
        reEncryptedItems.push({
          id: docSnap.id,
          encryptedUsername: reEncrypted.encryptedUsername,
          encryptedPassword: reEncrypted.encryptedPassword,
          encryptedNotes: reEncrypted.encryptedNotes ?? null,
          encryptedRecoveryEmail: reEncrypted.encryptedRecoveryEmail ?? null,
          encryptedMobile: reEncrypted.encryptedMobile ?? null,
          encryptedSecurityQuestion: reEncrypted.encryptedSecurityQuestion ?? null,
          encryptedAnswer: reEncrypted.encryptedAnswer ?? null,
        });\;

provider = provider.replace(regex, replacement);

const regexBatchUpdate = /batch.update\\(docRef, \\{\n              encryptedUsername: item.encryptedUsername,\n              encryptedPassword: item.encryptedPassword,\n              encryptedNotes: item.encryptedNotes,\n              updatedAt: serverTimestamp\\(\\),\n            \\}\\);/m;

const replacementBatchUpdate = \atch.update(docRef, {
              encryptedUsername: item.encryptedUsername,
              encryptedPassword: item.encryptedPassword,
              encryptedNotes: item.encryptedNotes,
              encryptedRecoveryEmail: item.encryptedRecoveryEmail,
              encryptedMobile: item.encryptedMobile,
              encryptedSecurityQuestion: item.encryptedSecurityQuestion,
              encryptedAnswer: item.encryptedAnswer,
              updatedAt: serverTimestamp(),
            });\;
            
provider = provider.replace(regexBatchUpdate, replacementBatchUpdate);

fs.writeFileSync(providerPath, provider, 'utf8');
console.log('Done');
