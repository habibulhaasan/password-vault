const fs = require('fs');
const path = 'app/(vault)/credentials/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const oldUI = `          {credential.securityQuestion && (
            <div className="pt-4 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Security Question</p>
              <p className="text-sm text-foreground break-all">{credential.securityQuestion}</p>
            </div>
          )}

          {credential.answer && (
            <div className="pt-4 space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Answer</p>
              <p className="text-sm font-mono text-foreground break-all">{credential.answer}</p>
            </div>
          )}`;

const newUI = `          {credential.securityQuestions && credential.securityQuestions.length > 0 && (
            <div className="pt-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Security Questions</p>
              <div className="space-y-3">
                {credential.securityQuestions.map((sq, i) => (
                  <div key={i} className="rounded-md border bg-muted/20 p-3 space-y-1">
                    <p className="text-xs font-medium text-foreground">{sq.question}</p>
                    <p className="text-sm font-mono text-muted-foreground break-all">{sq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}`;

content = content.replace(oldUI, newUI);
fs.writeFileSync(path, content, 'utf8');
console.log('Details updated');
