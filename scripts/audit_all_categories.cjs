const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walk(full));
    } else if (f.endsWith('.yaml') || f.endsWith('.yml')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('data/tags');
console.log('Total files remaining:', files.length);

const stats = [];
const supplementFiles = [];

for (const file of files) {
  try {
    const d = yaml.load(fs.readFileSync(file, 'utf8'));
    const count = Object.keys(d.content || {}).length;
    const norm = file.replace(/\\/g, '/');
    stats.push({ file: norm, name: d.name, category: d.category, count });
    if (norm.includes('supplement')) {
      supplementFiles.push({ file: norm, name: d.name, count });
    }
  } catch (e) {
    console.error('Error loading:', file, e.message);
  }
}

stats.sort((a, b) => a.count - b.count);

console.log('\n=== All remaining supplement files ===');
supplementFiles.forEach(s => console.log(` - ${s.count} tags | ${s.name} (${s.file})`));

console.log('\n=== Top 20 Smallest Files ===');
stats.slice(0, 20).forEach(s => console.log(` - ${s.count} tags | [${(s.category||[]).join('/')}] ${s.name} (${s.file})`));

console.log('\n=== Top 15 Largest Files ===');
stats.slice(-15).forEach(s => console.log(` - ${s.count} tags | [${(s.category||[]).join('/')}] ${s.name} (${s.file})`));
