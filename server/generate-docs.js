const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, 'routes');
let output = '# Beyond Classroom API Documentation\n\n';

output += '## Server Routes (server-simple.js)\n';
const serverFile = fs.readFileSync('server-simple.js', 'utf8');
const serverMatches = serverFile.match(/app\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g);
if (serverMatches) {
  serverMatches.forEach(m => {
    const match = m.match(/app\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/);
    output += `- **${match[1].toUpperCase()}** \`${match[2]}\`\n`;
  });
}

const files = fs.readdirSync(routesDir).filter(f => f.endsWith('.js'));
files.forEach(file => {
  output += `\n## ${file.replace('.js', '')} Routes\n`;
  const content = fs.readFileSync(path.join(routesDir, file), 'utf8');
  const matches = content.match(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/g);
  if (matches) {
    matches.forEach(m => {
      const match = m.match(/router\.(get|post|put|patch|delete)\(['"]([^'"]+)['"]/);
      let routePath = match[2];
      if (routePath === '/') routePath = '';
      output += `- **${match[1].toUpperCase()}** \`/api/${file.replace('.js', '')}${routePath}\`\n`;
    });
  } else {
    output += '*No direct routes found*\n';
  }
});

const artifactPath = path.join('C:', 'Users', 'asus', '.gemini', 'antigravity-ide', 'brain', '7ec815f9-65c7-4216-a81e-0f0a84f9c651', 'backend_apis.md');
fs.writeFileSync(artifactPath, output);
console.log('Artifact created at:', artifactPath);
