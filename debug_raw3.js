const fs = require('fs');
let content = fs.readFileSync('app/(vault)/credentials/[id]/page.tsx', 'utf8');

content = content.replace('const [loading, setLoading] = useState(true);', 
                          'const [rawEncrypted, setRawEncrypted] = useState<any>(null);\n  const [loading, setLoading] = useState(true);');

fs.writeFileSync('app/(vault)/credentials/[id]/page.tsx', content, 'utf8');
console.log('Fixed raw state');
