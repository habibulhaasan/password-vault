const fs = require('fs');

function addMt6(filePath, searchString, replacement) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(searchString, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated ' + filePath);
    }
}

addMt6('components/settings/change-master-password-dialog.tsx', '<DialogFooter className="pt-2 gap-2 sm:gap-0">', '<DialogFooter className="pt-2 mt-6 gap-2 sm:gap-0">');
addMt6('components/password-generator/password-generator-dialog.tsx', '<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">', '<DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-6">');

console.log('Done');
