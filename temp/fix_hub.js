const fs = require('fs');
const file = 'c:/Users/User/Toolbox/artifacts/utility-tools/src/pages/HubWorkspace.tsx';
let text = fs.readFileSync(file, 'utf8');
const start = '\n  );<main className="mx-auto flex w-full max-w-3xl flex-1 flex-col">';
const index = text.indexOf(start);
if (index < 0) {
  console.log('marker not found');
  process.exit(0);
}
text = text.slice(0, index) + '\n  );\n}\n';
fs.writeFileSync(file, text);
console.log('fixed');
