const fs = require('fs');
let content = fs.readFileSync('app/(vault)/credentials/[id]/page.tsx', 'utf8');

if (!content.includes('const [rawEncrypted, setRawEncrypted]')) {
    content = content.replace('const [credential, setCredential] = useState<DecryptedCredential | null>(null);', 
                              'const [credential, setCredential] = useState<DecryptedCredential | null>(null);\n  const [rawEncrypted, setRawEncrypted] = useState<any>(null);');
                              
    content = content.replace('const encrypted = await getCredential(id);', 
                              'const encrypted = await getCredential(id);\n        setRawEncrypted(encrypted);');

    content = content.replace('DEBUG: {JSON.stringify(credential, null, 2)}', 
                              'DEBUG: {JSON.stringify(credential, null, 2)}\n            RAW FIRESTORE: {JSON.stringify(rawEncrypted, null, 2)}');

    fs.writeFileSync('app/(vault)/credentials/[id]/page.tsx', content, 'utf8');
    console.log('Added raw state');
}
