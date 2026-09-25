const fs = require('fs');
let content = fs.readFileSync('hooks/use-credentials.ts', 'utf8');

const target = `          password: decryptedFields.password,
          notes: decryptedFields.notes,`;

const replacement = `          password: decryptedFields.password,
          notes: decryptedFields.notes,
          recoveryEmail: decryptedFields.recoveryEmail,
          mobile: decryptedFields.mobile,
          securityQuestions: decryptedFields.securityQuestions,`;

content = content.replace(target, replacement);

fs.writeFileSync('hooks/use-credentials.ts', content, 'utf8');
console.log('Fixed use-credentials.ts decrypt mapping');
