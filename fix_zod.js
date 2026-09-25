const fs = require('fs');
let valid = fs.readFileSync('lib/validations/credential.ts', 'utf8');

valid = valid.replace(/\)\.optional\(\)\.default\(\[\]\),/g, ').optional(),');

fs.writeFileSync('lib/validations/credential.ts', valid, 'utf8');
console.log('Fixed zod schema');
