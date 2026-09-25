const fs = require('fs');
const path = 'components/credentials/credential-form.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldDefaults = `      tags: initialValues?.tags || [],
      notes: initialValues?.notes || "",
    },`;
const newDefaults = `      tags: initialValues?.tags || [],
      notes: initialValues?.notes || "",
      recoveryEmail: initialValues?.recoveryEmail || "",
      mobile: initialValues?.mobile || "",
      securityQuestion: initialValues?.securityQuestion || "",
      answer: initialValues?.answer || "",
    },`;
content = content.replace(oldDefaults, newDefaults);

const oldMap = `        notes: values.notes || undefined,
      });`;
const newMap = `        notes: values.notes || undefined,
        recoveryEmail: values.recoveryEmail || undefined,
        mobile: values.mobile || undefined,
        securityQuestion: values.securityQuestion || undefined,
        answer: values.answer || undefined,
      });`;
content = content.replace(oldMap, newMap);

fs.writeFileSync(path, content, 'utf8');
console.log('Success');
