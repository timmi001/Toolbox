const fs = require('fs');
const path = require('path');
const root = path.join('c:/Users/User/Toolbox/artifacts/utility-tools/src');
const toolsData = fs.readFileSync(path.join(root, 'lib/tools-data.ts'), 'utf8');
const slugs = [...toolsData.matchAll(/slug:\s*'([^']+)'/g)].map(m => m[1]);
const present = {};
for (const ent of fs.readdirSync(path.join(root, 'pages/tools'), { withFileTypes: true })) {
  if (ent.isDirectory()) {
    const files = fs.readdirSync(path.join(root, 'pages/tools', ent.name))
      .filter(f => f.endsWith('.tsx'))
      .map(f => path.basename(f, '.tsx'));
    present[ent.name] = new Set(files);
  }
}
const app = fs.readFileSync(path.join(root, 'App.tsx'), 'utf8');
const routePaths = [...app.matchAll(/path="(\/tools\/[^\"]+)"/g)].map(m => m[1]);
const expected = new Set();
for (const slug of slugs) {
  for (const [cat, files] of Object.entries(present)) {
    if (files.has(slug)) {
      expected.add(`/tools/${cat}/${slug}`);
      break;
    }
  }
}
const missing = [...expected].filter(r => !routePaths.includes(r)).sort();
console.log('Expected tool routes', expected.size);
console.log('Route count', routePaths.length);
console.log('Missing routes:');
if (missing.length) console.log(missing.join('\n'));
else console.log('(none)');
