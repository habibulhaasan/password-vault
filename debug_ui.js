const fs = require('fs');
let content = fs.readFileSync('app/(vault)/credentials/[id]/page.tsx', 'utf8');

const target = `{/* Username */}`;
const replacement = `{/* Username */}
          <div className="p-4 bg-muted text-xs font-mono overflow-auto whitespace-pre-wrap">
            DEBUG: {JSON.stringify(credential, null, 2)}
          </div>`;

content = content.replace(target, replacement);

fs.writeFileSync('app/(vault)/credentials/[id]/page.tsx', content, 'utf8');
console.log('Added debug json');
