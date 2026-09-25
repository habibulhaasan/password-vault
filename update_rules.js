const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

const target1 = "&& isOptionalString(request.resource.data, 'encryptedNotes', 10000)";
const replacement1 = `&& isOptionalString(request.resource.data, 'encryptedNotes', 10000)
          && isOptionalString(request.resource.data, 'encryptedRecoveryEmail', 2048)
          && isOptionalString(request.resource.data, 'encryptedMobile', 1024)
          && isOptionalString(request.resource.data, 'encryptedSecurityQuestions', 10000)`;

rules = rules.replace(target1, replacement1);
rules = rules.replace(target1, replacement1);

fs.writeFileSync('firestore.rules', rules, 'utf8');
console.log('Updated firestore.rules');
