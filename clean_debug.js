const fs = require('fs');
let content = fs.readFileSync('app/(vault)/credentials/[id]/page.tsx', 'utf8');

// Remove debug JSON
const debugStart = content.indexOf('DEBUG: {JSON.stringify(credential, null, 2)}');
const debugBlockEnd = content.indexOf('</div>', debugStart) + 6;

if (debugStart !== -1) {
    const debugBlockStart = content.lastIndexOf('<div className="p-4 bg-muted text-xs font-mono overflow-auto whitespace-pre-wrap">', debugStart);
    if (debugBlockStart !== -1) {
        content = content.substring(0, debugBlockStart) + content.substring(debugBlockEnd);
    }
}

content = content.replace('const [rawEncrypted, setRawEncrypted] = useState<any>(null);\n', '');
content = content.replace('const encrypted = await getCredential(id);\n        setRawEncrypted(encrypted);', 'const encrypted = await getCredential(id);');
content = content.replace('const encrypted = await getCredential(id);\n          setRawEncrypted(encrypted);', 'const encrypted = await getCredential(id);');


fs.writeFileSync('app/(vault)/credentials/[id]/page.tsx', content, 'utf8');
console.log('Cleaned up debug code');
