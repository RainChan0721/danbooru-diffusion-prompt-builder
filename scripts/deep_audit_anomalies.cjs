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
const anomalies = [];

// Heuristic keyword definitions for mismatch detection
const categoryChecks = [
  {
    name: 'Food files having non-food',
    matcher: f => f.includes('food'),
    isAnomaly: (tag, cn) => {
      const t = tag.toLowerCase();
      // Look for clothes, weapons, vehicles, anatomy
      return t.includes('sword') || t.includes('gun') || t.includes('dress') || t.includes('skirt') ||
             t.includes('panties') || t.includes('vehicle') || t.includes('car') || t.includes('piercing');
    }
  },
  {
    name: 'Clothing files having non-clothing',
    matcher: f => f.includes('clothing') || f.includes('clothes'),
    isAnomaly: (tag, cn) => {
      const t = tag.toLowerCase();
      // Look for weapons, vehicles, animals, architecture, foods
      return (t.includes('sword') || t.includes('shotgun') || t.includes('rifle') || t.includes('vehicle') ||
             t.includes('building') || t.includes('shrine') || t.includes('food') || t.includes('eating') ||
             t.includes('sleeping')) && !t.includes('print') && !t.includes('pattern') && !t.includes('clothes') && !t.includes('costume') && !t.includes('dress') && !t.includes('uniform') && !t.includes('shirt') && !t.includes('swimsuit');
    }
  },
  {
    name: 'Creatures files having non-creatures',
    matcher: f => f.includes('creatures'),
    isAnomaly: (tag, cn) => {
      const t = tag.toLowerCase();
      return (t.includes('vehicle') || t.includes('sword') || t.includes('gun') || t.includes('building') ||
             t.includes('swimsuit') || t.includes('uniform')) && !t.includes('print') && !t.includes('pattern') && !t.includes('costume') && !t.includes('ears') && !t.includes('tail') && !t.includes('wings');
    }
  },
  {
    name: 'Weapons files having non-weapons',
    matcher: f => f.includes('weapons'),
    isAnomaly: (tag, cn) => {
      const t = tag.toLowerCase();
      return (t.includes('swimsuit') || t.includes('panties') || t.includes('bra') || t.includes('dress') ||
             t.includes('skirt') || t.includes('building') || t.includes('temple')) && !t.includes('print') && !t.includes('pattern') && !t.includes('sword') && !t.includes('blade') && !t.includes('gun');
    }
  },
  {
    name: 'Vehicles files having non-vehicles',
    matcher: f => f.includes('vehicles'),
    isAnomaly: (tag, cn) => {
      const t = tag.toLowerCase();
      return (t.includes('swimsuit') || t.includes('panties') || t.includes('dress') || t.includes('piercing') ||
             t.includes('eyebrow') || t.includes('hairpin')) && !t.includes('car') && !t.includes('bike') && !t.includes('print');
    }
  },
  {
    name: 'Natural scenery files having artificial items/weapons',
    matcher: f => f.includes('natural'),
    isAnomaly: (tag, cn) => {
      const t = tag.toLowerCase();
      return (t.includes('sword') || t.includes('gun') || t.includes('pistol') || t.includes('tank') ||
             t.includes('car') || t.includes('motorcycle') || t.includes('photoshop') || t.includes('software')) &&
             !t.includes('flower') && !t.includes('plant') && !t.includes('tree');
    }
  }
];

for (const file of files) {
  const norm = file.replace(/\\/g, '/');
  try {
    const d = yaml.load(fs.readFileSync(file, 'utf8'));
    if (!d || !d.content) continue;
    for (const check of categoryChecks) {
      if (check.matcher(norm)) {
        for (const [tag, info] of Object.entries(d.content)) {
          if (check.isAnomaly(tag, info.name)) {
            anomalies.push({
              file: norm,
              category: d.name,
              check: check.name,
              tag,
              name: info.name
            });
          }
        }
      }
    }
  } catch (e) {}
}

console.log('Total cross-domain anomalies found:', anomalies.length);
anomalies.slice(0, 40).forEach(a => {
  console.log(` - [${a.category}] ${a.tag} (${a.name}) -> in ${a.file}`);
});
