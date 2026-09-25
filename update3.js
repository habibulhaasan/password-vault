const fs = require('fs');
const path = 'hooks/use-credentials.ts';
let content = fs.readFileSync(path, 'utf8');

const target = 'encryptedNotes: encryptedFields.encryptedNotes || "",';
const replacement = `encryptedNotes: encryptedFields.encryptedNotes || "",
          encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",
          encryptedMobile: encryptedFields.encryptedMobile || "",
          encryptedSecurityQuestion: encryptedFields.encryptedSecurityQuestion || "",
          encryptedAnswer: encryptedFields.encryptedAnswer || "",`;

// Replace specifically in updateCredential (which is the last one now)
const parts = content.split('updateCredential');
if (parts.length > 1) {
    parts[1] = parts[1].replace(target, replacement);
    fs.writeFileSync(path, parts.join('updateCredential'), 'utf8');
    console.log('Success');
} else {
    console.log('Failed to find updateCredential');
}
