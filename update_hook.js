const fs = require('fs');
const hookPath = 'hooks/use-credentials.ts';
let hook = fs.readFileSync(hookPath, 'utf8');

const regexSave = /encryptedNotes: encryptedFields\.encryptedNotes \|\| "",/m;
const replacementSave = \encryptedNotes: encryptedFields.encryptedNotes || "",
        encryptedRecoveryEmail: encryptedFields.encryptedRecoveryEmail || "",
        encryptedMobile: encryptedFields.encryptedMobile || "",
        encryptedSecurityQuestion: encryptedFields.encryptedSecurityQuestion || "",
        encryptedAnswer: encryptedFields.encryptedAnswer || "",\;
        
hook = hook.replace(regexSave, replacementSave);
hook = hook.replace(regexSave, replacementSave);

fs.writeFileSync(hookPath, hook, 'utf8');
