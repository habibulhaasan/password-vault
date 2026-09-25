const fs = require('fs');

// 1. types/credential.ts
let types = fs.readFileSync('types/credential.ts', 'utf8');
const sqInterface = `export interface SecurityQuestion {
  question: string;
  answer: string;
}\n\n`;
if (!types.includes('SecurityQuestion {')) {
  types = sqInterface + types;
}

types = types.replace(/encryptedSecurityQuestion\?: string \| null;/g, 'encryptedSecurityQuestions?: string | null;');
types = types.replace(/encryptedAnswer\?: string \| null;/g, '');
types = types.replace(/securityQuestion\?: string \| null;/g, 'securityQuestions?: SecurityQuestion[] | null;');
types = types.replace(/answer\?: string \| null;/g, '');
types = types.replace(/securityQuestion\?: string;/g, 'securityQuestions?: SecurityQuestion[];');
types = types.replace(/answer\?: string;/g, '');
fs.writeFileSync('types/credential.ts', types, 'utf8');

// 2. lib/crypto/vault.ts
let vault = fs.readFileSync('lib/crypto/vault.ts', 'utf8');
vault = vault.replace(/encryptedSecurityQuestion\?: string;/g, 'encryptedSecurityQuestions?: string;');
vault = vault.replace(/encryptedAnswer\?: string;/g, '');
vault = vault.replace(/securityQuestion\?: string;/g, 'securityQuestions?: { question: string, answer: string }[];');
vault = vault.replace(/answer\?: string;/g, '');

const encryptSQCode = `
  let encryptedSecurityQuestions: string | undefined = undefined;
  if (input.securityQuestions && input.securityQuestions.length > 0) {
    encryptedSecurityQuestions = await encryptString(JSON.stringify(input.securityQuestions), key);
  }
`;
vault = vault.replace(/  let encryptedSecurityQuestion: string \| undefined = undefined;[\s\S]*?encryptedAnswer = await encryptString\(input\.answer, key\);\n  }/g, encryptSQCode.trim());

vault = vault.replace(/encryptedSecurityQuestion,/g, 'encryptedSecurityQuestions,');
vault = vault.replace(/encryptedAnswer,/g, '');

const decryptSQCode = `
  let securityQuestions: { question: string, answer: string }[] | undefined = undefined;
  if (encrypted.encryptedSecurityQuestions) {
    const dec = await decryptString(encrypted.encryptedSecurityQuestions, key);
    try {
      securityQuestions = JSON.parse(dec);
    } catch(e) {}
  }
`;
vault = vault.replace(/  let securityQuestion: string \| undefined = undefined;[\s\S]*?answer = await decryptString\(encrypted\.encryptedAnswer, key\);\n  }/g, decryptSQCode.trim());

vault = vault.replace(/securityQuestion,/g, 'securityQuestions,');
vault = vault.replace(/answer,/g, '');
fs.writeFileSync('lib/crypto/vault.ts', vault, 'utf8');

// 3. lib/validations/credential.ts
let valid = fs.readFileSync('lib/validations/credential.ts', 'utf8');
const sqSchema = `
  securityQuestions: z.array(
    z.object({
      question: z.string().max(250, "Security question is too long"),
      answer: z.string().max(250, "Answer is too long")
    })
  ).optional().default([]),
`;
valid = valid.replace(/  securityQuestion: z[\s\S]*?\.or\(z\.literal\(""\)\),\n/g, '');
valid = valid.replace(/  answer: z[\s\S]*?\.or\(z\.literal\(""\)\),\n/g, sqSchema);
fs.writeFileSync('lib/validations/credential.ts', valid, 'utf8');

// 4. hooks/use-credentials.ts
let hooks = fs.readFileSync('hooks/use-credentials.ts', 'utf8');
hooks = hooks.replace(/encryptedSecurityQuestion: encryptedFields\.encryptedSecurityQuestion \|\| "",/g, 'encryptedSecurityQuestions: encryptedFields.encryptedSecurityQuestions || "",');
hooks = hooks.replace(/encryptedAnswer: encryptedFields\.encryptedAnswer \|\| "",/g, '');
fs.writeFileSync('hooks/use-credentials.ts', hooks, 'utf8');

// 5. providers/vault-provider.tsx
let prov = fs.readFileSync('providers/vault-provider.tsx', 'utf8');
prov = prov.replace(/encryptedSecurityQuestion: string \| null;/g, 'encryptedSecurityQuestions: string | null;');
prov = prov.replace(/encryptedAnswer: string \| null;/g, '');
prov = prov.replace(/securityQuestion: decrypted\.securityQuestion,/g, 'securityQuestions: decrypted.securityQuestions,');
prov = prov.replace(/answer: decrypted\.answer,/g, '');
prov = prov.replace(/encryptedSecurityQuestion: reEncrypted\.encryptedSecurityQuestion \?\? null,/g, 'encryptedSecurityQuestions: reEncrypted.encryptedSecurityQuestions ?? null,');
prov = prov.replace(/encryptedAnswer: reEncrypted\.encryptedAnswer \?\? null,/g, '');
prov = prov.replace(/encryptedSecurityQuestion: item\.encryptedSecurityQuestion,/g, 'encryptedSecurityQuestions: item.encryptedSecurityQuestions,');
prov = prov.replace(/encryptedAnswer: item\.encryptedAnswer,/g, '');
fs.writeFileSync('providers/vault-provider.tsx', prov, 'utf8');

console.log('Backend types and logic updated successfully.');
