const fs = require('fs');
let content = fs.readFileSync('hooks/use-credentials.ts', 'utf8');

content = content.replace('const docRef = await addDoc(getCredentialsRef(user.uid), {', 'console.log("CREATE PAYLOAD:", encryptedFields);\n        const docRef = await addDoc(getCredentialsRef(user.uid), {');
content = content.replace('await updateDoc(docRef, {', 'console.log("UPDATE PAYLOAD:", encryptedFields);\n        await updateDoc(docRef, {');

fs.writeFileSync('hooks/use-credentials.ts', content, 'utf8');
console.log('Added console logs to hooks');
