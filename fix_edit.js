const fs = require('fs');
let content = fs.readFileSync('app/(vault)/credentials/[id]/edit/page.tsx', 'utf8');

const oldMap = `          tags: decrypted.tags || [],
          notes: decrypted.notes || "",
        });`;

const newMap = `          tags: decrypted.tags || [],
          notes: decrypted.notes || "",
          recoveryEmail: decrypted.recoveryEmail || "",
          mobile: decrypted.mobile || "",
          securityQuestions: decrypted.securityQuestions || [],
        });`;

content = content.replace(oldMap, newMap);
fs.writeFileSync('app/(vault)/credentials/[id]/edit/page.tsx', content, 'utf8');
console.log('Fixed edit page');
