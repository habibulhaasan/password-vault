const fs = require('fs');
let content = fs.readFileSync('hooks/use-credentials.ts', 'utf8');

// Hardcode a recovery email into the payload to test the data pipeline
content = content.replace(
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",',
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "ENCRYPTED_TEST", // FORCED_TEST'
);

content = content.replace(
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",', // Replace both create and update
  'encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "ENCRYPTED_TEST", // FORCED_TEST'
);

fs.writeFileSync('hooks/use-credentials.ts', content, 'utf8');
console.log('Hardcoded encryptedRecoveryEmail');
