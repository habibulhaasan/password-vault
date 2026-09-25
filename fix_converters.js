const fs = require('fs');
let content = fs.readFileSync('lib/firebase/converters.ts', 'utf8');

const target = `      encryptedNotes: data.encryptedNotes || undefined,`;
const replacement = `      encryptedNotes: data.encryptedNotes || undefined,
      encryptedRecoveryEmail: data.encryptedRecoveryEmail || undefined,
      encryptedMobile: data.encryptedMobile || undefined,
      encryptedSecurityQuestions: data.encryptedSecurityQuestions || undefined,`;

content = content.replace(target, replacement);

fs.writeFileSync('lib/firebase/converters.ts', content, 'utf8');
console.log('Fixed converters');
