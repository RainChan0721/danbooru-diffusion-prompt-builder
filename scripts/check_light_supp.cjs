const fs = require('fs');
const yaml = require('js-yaml');

const doc = yaml.load(fs.readFileSync('data/tags/image-composition/supplement.yaml', 'utf8'));
const tags = doc.content || {};

const backgrounds = [];
const sky = [];
const focus = [];
const other = [];

for (const [tag, info] of Object.entries(tags)) {
  const t = tag.toLowerCase();
  if (t.includes('background')) {
    backgrounds.push(tag);
  } else if (t.includes('sky') || t.includes('sunlight') || t.includes('cloud') || t.includes('moon') || t.includes('star (sky)')) {
    sky.push(tag);
  } else if (t.includes('focus')) {
    focus.push(tag);
  } else {
    other.push(tag);
  }
}

console.log('Backgrounds in light supplement:', backgrounds.length);
console.log('Sky/Weather in light supplement:', sky.length);
console.log('Focus in light supplement:', focus.length);
console.log('Other in light supplement:', other.length);
console.log('Other sample:', other.slice(0, 30));
