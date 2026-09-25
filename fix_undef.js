const fs = require('fs');
let content = fs.readFileSync('components/credentials/credential-form.tsx', 'utf8');

content = content.replace(/errors\.securityQuestions\[index\]/g, 'errors.securityQuestions?.[index]');

fs.writeFileSync('components/credentials/credential-form.tsx', content, 'utf8');
console.log('Fixed undefined errors');
