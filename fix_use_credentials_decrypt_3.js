const fs = require('fs');
let content = fs.readFileSync('hooks/use-credentials.ts', 'utf8');

const regex = /notes: decryptedFields\.notes,/;
const replacement = `notes: decryptedFields.notes,
          recoveryEmail: decryptedFields.recoveryEmail,
          mobile: decryptedFields.mobile,
          securityQuestions: decryptedFields.securityQuestions,`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('hooks/use-credentials.ts', content, 'utf8');
    console.log('Fixed use-credentials.ts decrypt mapping correctly this time!');
} else {
    console.log('Regex did not match!');
}
