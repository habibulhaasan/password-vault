const fs = require('fs');
let content = fs.readFileSync('components/credentials/credential-form.tsx', 'utf8');

const target = `<Input
                    id="websiteUrl"
                    placeholder="https://example.com"
                    type="url"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.websiteUrl}
                    {...register("websiteUrl")}
                  />`;

const replacement = `<Input
                    id="websiteUrl"
                    placeholder="example.com or https://example.com"
                    type="text"
                    disabled={isSubmitting}
                    aria-invalid={!!errors.websiteUrl}
                    {...register("websiteUrl")}
                  />`;

content = content.replace(target, replacement);
fs.writeFileSync('components/credentials/credential-form.tsx', content, 'utf8');
console.log('Fixed input type');
