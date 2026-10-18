const fs = require('fs');
const yaml = require('js-yaml');

const doc = yaml.load(fs.readFileSync('data/tags/items/vehicles.yaml', 'utf8'));
const tags = doc.content || {};

const suspiciousVehicles = [];
for (const [tag, info] of Object.entries(tags)) {
  const t = tag.toLowerCase();
  if (
    t.includes('swimsuit') || t.includes('uniform') || t.includes('dress') ||
    t.includes('skirt') || t.includes('piercing') || t.includes('eyebrow') ||
    t.includes('hairpin') || t.includes('earrings') || t.includes('necklace') ||
    t.includes('food') || t.includes('fruit') || t.includes('cake') ||
    t.includes('style') || t.includes('logo') || t.includes('symbol')
  ) {
    if (!t.includes('car') && !t.includes('bike') && !t.includes('train') && !t.includes('plane') && !t.includes('ship')) {
      suspiciousVehicles.push({ tag, name: info.name });
    }
  }
}

console.log('Suspicious in vehicles.yaml:', suspiciousVehicles.length);
suspiciousVehicles.forEach(s => console.log(` - ${s.tag} (${s.name})`));
