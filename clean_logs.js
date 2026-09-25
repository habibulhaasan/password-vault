const fs = require('fs');

let form = fs.readFileSync('components/credentials/credential-form.tsx', 'utf8');
form = form.replace('console.log("HELLO! FORM IS SUBMITTING:", values);\n', '');
fs.writeFileSync('components/credentials/credential-form.tsx', form, 'utf8');

let hooks = fs.readFileSync('hooks/use-credentials.ts', 'utf8');
hooks = hooks.replace('console.log("CREATE PAYLOAD:", encryptedFields);\n', '');
hooks = hooks.replace('console.log("UPDATE PAYLOAD:", encryptedFields);\n', '');
fs.writeFileSync('hooks/use-credentials.ts', hooks, 'utf8');

console.log('Cleaned up console logs');
