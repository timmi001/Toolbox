import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('artifacts/utility-tools/src');
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
const expected = new Map();
for (const slug of slugs) {
  const candidates = [];
  for (const [cat, files] of Object.entries(present)) {
    if (files.has(slug)) {
      candidates.push(`/tools/${cat}/${slug}`);
    }
  }
  expected.set(slug, candidates);
}
const missing = [...expected.entries()]
  .filter(([, candidates]) => !candidates.some(route => routePaths.includes(route)))
  .map(([slug, candidates]) => `${slug} (${candidates.join(' or ')})`)
  .sort();
console.log('Expected tool slugs', expected.size);
console.log('Route count', routePaths.length);
console.log('Missing routes:');
if (missing.length) console.log(missing.join('\n'));
else console.log('(none)');
