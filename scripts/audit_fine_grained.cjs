const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function walk(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) results = results.concat(walk(full));
    else if (f.endsWith('.yaml') || f.endsWith('.yml')) results.push(full);
  });
  return results;
}

const files = walk('data/tags');
console.log('Auditing series/character leaks and fine-grained categories...');

// 1. Franchise-specific characters/cosplays leaked into general files (excluding artistic-license)
const characterLeaks = [];

// 2. Face / hair / breasts / ears anomalies
const faceHairAnomalies = [];

// 3. Food anomalies
const foodAnomalies = [];

// 4. Direction anomalies
const directionAnomalies = [];

// 5. Censorship / Effects anomalies
const compAnomalies = [];

for (const file of files) {
  const norm = file.replace(/\\/g, '/');
  let doc;
  try {
    doc = yaml.load(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    continue;
  }
  if (!doc || !doc.content) continue;

  const isMeta = norm.includes('artistic-license') || norm.includes('meta-') || norm.includes('artists-');

  for (const [tag, info] of Object.entries(doc.content)) {
    const t = tag.toLowerCase();
    const name = (info.name || '').toLowerCase();

    // Check franchise leaks: e.g. "hatsune miku", "reimu hakurei", "(cosplay)" in general tags
    if (!isMeta) {
      if (t.includes('(cosplay)')) {
        characterLeaks.push({ file: norm, tag, name, issue: 'Cosplay tag in general file' });
      }
      // Specific famous character names
      if (t === 'hatsune miku' || t === 'reimu hakurei' || t === 'marisa kirisame' || t === 'remilia scarlet' || t === 'flandre scarlet' || t === 'sakuya izayoi' || t === 'goku' || t === 'naruto' || t === 'luffy' || t === 'saber' || t === 'artoria pendragon' || t === 'asuka langley' || t === 'rei ayanami' || t === 'shinji ikari') {
        characterLeaks.push({ file: norm, tag, name, issue: 'Famous character leaked into general tags' });
      }
    }

    // Check face.yaml for non-face items
    if (norm.includes('face.yaml')) {
      if (t.includes('shoe') || t.includes('sword') || t.includes('car') || t.includes('dress') || t.includes('skirt') || t.includes('building') || t.includes('swimsuit')) {
        faceHairAnomalies.push({ file: norm, tag, name });
      }
    }

    // Check hair.yaml for non-hair items
    if (norm.includes('hair.yaml')) {
      if (t.includes('shoe') || t.includes('sword') || t.includes('car') || t.includes('dress') || t.includes('skirt') || t.includes('building') || t.includes('swimsuit') || t.includes('food') || t.includes('meat') || t.includes('bread')) {
        faceHairAnomalies.push({ file: norm, tag, name });
      }
    }

    // Check breasts.yaml for non-breast items
    if (norm.includes('breasts.yaml')) {
      if (t.includes('shoe') || t.includes('sword') || t.includes('car') || t.includes('building') || t.includes('food') || t.includes('cake') || t.includes('tree') || t.includes('cloud')) {
        faceHairAnomalies.push({ file: norm, tag, name });
      }
    }

    // Check ears.yaml for non-ear items
    if (norm.includes('ears.yaml')) {
      if (!t.includes('ear') && !t.includes('piercing')) {
        faceHairAnomalies.push({ file: norm, tag, name });
      }
    }

    // Check food files
    if (norm.includes('/food/')) {
      if (t.includes('sword') || t.includes('gun') || t.includes('shield') || t.includes('pants') || t.includes('shirt') || t.includes('skirt') || t.includes('dress') || t.includes('shoe') || t.includes('building') || t.includes('vehicle') || t.includes('car')) {
        foodAnomalies.push({ file: norm, tag, name });
      }
    }

    // Check directions.yaml (only 40 tags)
    if (norm.includes('directions.yaml')) {
      if (!t.includes('look') && !t.includes('view') && !t.includes('from ') && !t.includes('facing') && !t.includes('turn') && !t.includes('profile') && !t.includes('front') && !t.includes('back') && !t.includes('side') && !t.includes('behind') && !t.includes('angle') && !t.includes('pov') && !t.includes('focus') && !t.includes('straight-on') && !t.includes('top-down') && !t.includes('bottom-up')) {
        directionAnomalies.push({ file: norm, tag, name });
      }
    }
  }
}

console.log(`\n=== 1. Character / Cosplay Leaks in General Files (${characterLeaks.length}) ===`);
characterLeaks.forEach(c => console.log(` - [${c.file}] ${c.tag} (${c.name}) [${c.issue}]`));

console.log(`\n=== 2. Face / Hair / Breasts / Ears Anomalies (${faceHairAnomalies.length}) ===`);
faceHairAnomalies.forEach(f => console.log(` - [${f.file}] ${f.tag} (${f.name})`));

console.log(`\n=== 3. Food Anomalies (${foodAnomalies.length}) ===`);
foodAnomalies.forEach(f => console.log(` - [${f.file}] ${f.tag} (${f.name})`));

console.log(`\n=== 4. Directions Anomalies (${directionAnomalies.length}) ===`);
directionAnomalies.forEach(d => console.log(` - [${d.file}] ${d.tag} (${d.name})`));
