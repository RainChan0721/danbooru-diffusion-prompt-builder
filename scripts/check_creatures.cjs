const fs = require('fs');
const yaml = require('js-yaml');

const creatures = yaml.load(fs.readFileSync('data/tags/items/creatures.yaml', 'utf8')).content || {};

const suspiciousCreatures = [];
for (const [tag, info] of Object.entries(creatures)) {
  const t = tag.toLowerCase();
  if (
    t.includes('uniform') || t.includes('swimsuit') || t.includes('dress') ||
    t.includes('skirt') || t.includes('shirt') || t.includes('pants') ||
    t.includes('jacket') || t.includes('gloves') || t.includes('socks') ||
    t.includes('shoes') || t.includes('boots') || t.includes('hat') ||
    t.includes('vehicle') || t.includes('car') || t.includes('building') ||
    t.includes('logo') || t.includes('style') || t.includes('symbol')
  ) {
    // Exclude animal ears, tails, animal print on clothing, etc.
    if (!t.includes('print') && !t.includes('ears') && !t.includes('tail') && !t.includes('wings') && !t.includes('costume') && !t.includes('hat') && !t.includes('hood')) {
      suspiciousCreatures.push({ tag, name: info.name });
    }
  }
}

console.log('Suspicious non-creatures in creatures.yaml:', suspiciousCreatures.length);
suspiciousCreatures.forEach(s => console.log(` - ${s.tag} (${s.name})`));
