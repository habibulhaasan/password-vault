const fs = require('fs');
let content = fs.readFileSync('app/(vault)/credentials/[id]/page.tsx', 'utf8');

content = content.replace('setCredential(decrypted);', 'console.log("Decrypted Credential:", decrypted);\n        setCredential(decrypted);');

fs.writeFileSync('app/(vault)/credentials/[id]/page.tsx', content, 'utf8');
console.log('Added console.log');
