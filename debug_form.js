const fs = require('fs');
let content = fs.readFileSync('components/credentials/credential-form.tsx', 'utf8');

content = content.replace('const handleFormSubmit = async (values: CredentialFormValues) => {', 'const handleFormSubmit = async (values: CredentialFormValues) => {\n      console.log("HELLO! FORM IS SUBMITTING:", values);');

fs.writeFileSync('components/credentials/credential-form.tsx', content, 'utf8');
console.log('Added log to form submit');
