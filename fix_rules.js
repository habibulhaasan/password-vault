const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');

// Undo the mess
const badReplacement = `&& isOptionalString(request.resource.data, 'encryptedNotes', 10000)
          && isOptionalString(request.resource.data, 'encryptedRecoveryEmail', 2048)
          && isOptionalString(request.resource.data, 'encryptedMobile', 1024)
          && isOptionalString(request.resource.data, 'encryptedSecurityQuestions', 10000)
          && isOptionalString(request.resource.data, 'encryptedRecoveryEmail', 2048)
          && isOptionalString(request.resource.data, 'encryptedMobile', 1024)
          && isOptionalString(request.resource.data, 'encryptedSecurityQuestions', 10000)`;

const goodReplacement = `&& isOptionalString(request.resource.data, 'encryptedNotes', 10000)
          && isOptionalString(request.resource.data, 'encryptedRecoveryEmail', 2048)
          && isOptionalString(request.resource.data, 'encryptedMobile', 1024)
          && isOptionalString(request.resource.data, 'encryptedSecurityQuestions', 10000)`;

rules = rules.replace(badReplacement, goodReplacement);

// Fix the update block which was missed
const updateTarget = "&& isOptionalString(request.resource.data, 'encryptedNotes', 10000)\n          && isOptionalString(request.resource.data, 'websiteUrl', 2048)";
const updateReplacement = `&& isOptionalString(request.resource.data, 'encryptedNotes', 10000)
          && isOptionalString(request.resource.data, 'encryptedRecoveryEmail', 2048)
          && isOptionalString(request.resource.data, 'encryptedMobile', 1024)
          && isOptionalString(request.resource.data, 'encryptedSecurityQuestions', 10000)
          && isOptionalString(request.resource.data, 'websiteUrl', 2048)`;

rules = rules.replace(updateTarget, updateReplacement);

fs.writeFileSync('firestore.rules', rules, 'utf8');
console.log('Fixed firestore.rules');
