const fs = require('fs');
let content = fs.readFileSync('hooks/use-credentials.ts', 'utf8');

content = content.replace(
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "ENCRYPTED_TEST", // FORCED_TEST',
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",'
);
content = content.replace(
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "ENCRYPTED_TEST", // FORCED_TEST',
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",'
);

fs.writeFileSync('hooks/use-credentials.ts', content, 'utf8');
console.log('Restored');
