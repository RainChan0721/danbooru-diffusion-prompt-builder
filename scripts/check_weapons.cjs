const fs = require('fs');
const yaml = require('js-yaml');

const doc = yaml.load(fs.readFileSync('data/tags/items/weapons.yaml', 'utf8'));
const tags = doc.content || {};

const suspiciousWeapons = [];
for (const [tag, info] of Object.entries(tags)) {
  const t = tag.toLowerCase();
  if (
    t.includes('swimsuit') || t.includes('uniform') || t.includes('dress') ||
    t.includes('skirt') || t.includes('piercing') || t.includes('eyebrow') ||
    t.includes('hairpin') || t.includes('style') || t.includes('logo') ||
    t.includes('food') || t.includes('fruit') || t.includes('cake')
  ) {
    if (!t.includes('sword') && !t.includes('gun') && !t.includes('knife') && !t.includes('blade') && !t.includes('bow') && !t.includes('spear')) {
      suspiciousWeapons.push({ tag, name: info.name });
    }
  }
}

console.log('Suspicious in weapons.yaml:', suspiciousWeapons.length);
suspiciousWeapons.forEach(s => console.log(` - ${s.tag} (${s.name})`));
