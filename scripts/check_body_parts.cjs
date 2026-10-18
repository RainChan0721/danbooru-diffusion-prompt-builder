const fs = require('fs');
const yaml = require('js-yaml');

const doc = yaml.load(fs.readFileSync('data/tags/human/body-parts/supplement.yaml', 'utf8'));
const tags = doc.content || {};

const weird = [];
for (const [tag, info] of Object.entries(tags)) {
  const t = tag.toLowerCase();
  if (
    t.includes('tit') || t.includes('cat') || t.includes('dog') || t.includes('bird') ||
    t.includes('fish') || t.includes('flower') || t.includes('food') || t.includes('car') ||
    t.includes('game') || t.includes('meme') || t.includes('text') || t.includes('watermark') ||
    t.includes('broom') || t.includes('shoe') || t.includes('boot') || t.includes('sock') ||
    t.includes('footwear') || t.includes('hat') || t.includes('cap') || t.includes('helmet')
  ) {
    weird.push({ tag, name: info.name });
  }
}

console.log('Weird items in body-parts/supplement.yaml:', weird.length);
console.log(weird.slice(0, 30));
