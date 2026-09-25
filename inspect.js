const fs = require('fs');
const content = fs.readFileSync('components/credentials/credential-form.tsx', 'utf8');
const lines = content.split('\n');

// Find default values block
const start = lines.findIndex(l => l.includes('defaultValues: {'));
console.log(lines.slice(start, start + 20).join('\n'));

console.log('\n--- Advanced Section ---');
// Find Advanced section
const advStart = lines.findIndex(l => l.includes('showAdvanced && ('));
if (advStart !== -1) {
  console.log(lines.slice(advStart, advStart + 60).join('\n'));
} else {
  console.log('No showAdvanced section found.');
}
