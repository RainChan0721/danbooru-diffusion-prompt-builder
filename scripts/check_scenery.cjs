const fs = require('fs');
const yaml = require('js-yaml');

const scenery = yaml.load(fs.readFileSync('data/tags/natural/scenery.yaml', 'utf8')).content || {};
const outdoors = yaml.load(fs.readFileSync('data/tags/natural/outdoors.yaml', 'utf8')).content || {};

const susScenery = [];
for (const [tag, info] of Object.entries({ ...scenery, ...outdoors })) {
  const t = tag.toLowerCase();
  if (
    t.includes('uniform') || t.includes('swimsuit') || t.includes('dress') ||
    t.includes('skirt') || t.includes('piercing') || t.includes('eyebrow') ||
    t.includes('hairpin') || t.includes('ornament') || t.includes('style') ||
    t.includes('skin') || t.includes('tattoo') || t.includes('bracelet') ||
    t.includes('panties') || t.includes('bra') || t.includes('food')
  ) {
    susScenery.push({ tag, name: info.name });
  }
}

console.log('Suspicious in scenery/outdoors:', susScenery.length);
susScenery.forEach(s => console.log(` - ${s.tag} (${s.name})`));
