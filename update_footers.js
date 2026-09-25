const fs = require('fs');

function addMt6(filePath, searchString, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(searchString, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

addMt6('components/auth/forgot-password-form.tsx', '<CardFooter className="flex flex-col gap-3">', '<CardFooter className="flex flex-col gap-3 mt-6">');
addMt6('components/auth/login-form.tsx', '<CardFooter className="flex flex-col gap-3">', '<CardFooter className="flex flex-col gap-3 mt-6">');
addMt6('components/auth/register-form.tsx', '<CardFooter className="flex flex-col gap-3">', '<CardFooter className="flex flex-col gap-3 mt-6">');
addMt6('components/credentials/credential-form.tsx', '<CardFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t pt-4">', '<CardFooter className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 border-t pt-4 mt-6">');
addMt6('components/vault/vault-setup-form.tsx', '<CardFooter>', '<CardFooter className="mt-6">');
addMt6('components/vault/vault-unlock-form.tsx', '<CardFooter>', '<CardFooter className="mt-6">');

console.log('Done');
