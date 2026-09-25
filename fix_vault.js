const fs = require('fs');
let vault = fs.readFileSync('lib/crypto/vault.ts', 'utf8');

const regex = /let securityQuestion: string \| undefined = undefined;[\s\S]*?answer = await decryptString\(encrypted\. key\);\n  }/m;
const fix = `let securityQuestions: { question: string, answer: string }[] | undefined = undefined;
  if (encrypted.encryptedSecurityQuestions) {
    const dec = await decryptString(encrypted.encryptedSecurityQuestions, key);
    try {
      securityQuestions = JSON.parse(dec);
    } catch(e) {}
  }`;

vault = vault.replace(regex, fix);

// Just in case my regex missed it because it was partially changed:
const backupRegex = /let securityQuestion: string \| undefined = undefined;[\s\S]*?answer = await decryptString\(encrypted\.[a-zA-Z]*?,? key\);\n  }/m;
vault = vault.replace(backupRegex, fix);

fs.writeFileSync('lib/crypto/vault.ts', vault, 'utf8');
console.log('Fixed decrypt fields');
