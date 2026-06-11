const fs = require('fs');
const path = require('path');

const dirs = [
  path.join(__dirname, '..', 'controllers'),
  path.join(__dirname, '..', 'services'),
  path.join(__dirname, '..', 'routes')
];

let count = 0;
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    if (!file.endsWith('.js')) return;
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    const original = content;
    content = content.replace(/\\\`/g, '`').replace(/\\\$/g, '$');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      count++;
      console.log('Fixed', file);
    }
  });
});
console.log(`Fixed ${count} files.`);
