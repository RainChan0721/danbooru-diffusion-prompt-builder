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
console.log(`Auditing ${files.length} files in depth...`);

// 1. Audit restricted/ files for weird tags (e.g. SFW tags, animals, locations)
const sfwInRestricted = [];
const nsfwInSfw = [];

// 2. Audit props.yaml for actions, clothes, locations, animals
const weirdInProps = [];

// 3. Audit artists-supplement.yaml for non-artists
const weirdInArtists = [];

// 4. Audit food files
const weirdInFood = [];

// 5. Audit all translations for:
// - English remaining as Chinese name (untranslated)
// - Repetitive translations (e.g. "复制粘贴复制粘贴" or "守夜之铁戒 守夜之铁戒")
// - Punctuation / garbled characters
const translationAnomalies = [];

const nsfwKeywords = /\b(sex|penis|vagina|clitoris|pussy|cock|dildo|fellatio|cunnilingus|creampie|cum|ejaculation|masturbation|orgasm|erotic|anal|hentai|uncensored|pegging|futanari|paizuri|bukkake)\b/i;

for (const file of files) {
  const norm = file.replace(/\\/g, '/');
  let doc;
  try {
    doc = yaml.load(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    continue;
  }
  if (!doc || !doc.content) continue;

  const isRestricted = norm.includes('/restricted/');
  const isArtists = norm.includes('artists-');
  const isProps = norm.includes('props.yaml');
  const isFood = norm.includes('/food/');

  for (const [tag, info] of Object.entries(doc.content)) {
    const t = tag.toLowerCase();
    const name = info.name || '';

    // Check repetitive translation glitch (e.g. "复制粘贴复制粘贴复制粘贴")
    if (name.length > 15) {
      const first4 = name.slice(0, 4);
      if (name.split(first4).length > 3) {
        translationAnomalies.push({ file: norm, tag, name, issue: 'Repetitive machine translation loop' });
      }
    }

    // Check untranslated in main categories (excluding artists)
    if (!isArtists && (!name || name === tag || !/\p{Script=Han}/u.test(name))) {
      // Don't report if artist or format
      if (!norm.includes('artists') && !norm.includes('illustrious')) {
        // translationAnomalies.push({ file: norm, tag, name, issue: 'Untranslated' });
      }
    }

    // Check SFW vs NSFW boundary
    if (!isRestricted && nsfwKeywords.test(t)) {
      if (!norm.includes('traits') && !norm.includes('censorship') && !norm.includes('breasts') && !norm.includes('lowerbody')) {
        nsfwInSfw.push({ file: norm, tag, name });
      }
    }

    // In restricted, check for weird non-NSFW things (like animals, food, vehicles, computer, software)
    if (isRestricted) {
      if (t.includes('software') || t.includes('photoshop') || t.includes('bus') || t.includes('airplane') || t.includes('train') || t.includes('bicycle') || t.includes('car') || t.includes('truck')) {
        sfwInRestricted.push({ file: norm, tag, name });
      }
    }

    // In props.yaml, check for actions or locations
    if (isProps) {
      if (t.endsWith('ing') && (t.startsWith('holding ') || t.startsWith('eating ') || t.startsWith('drinking ') || t.startsWith('wearing ') || t.startsWith('looking '))) {
        weirdInProps.push({ file: norm, tag, name, issue: 'Action tag in props' });
      }
      if (t.includes('room') || t.includes('hallway') || t.includes('shrine') || t.includes('temple') || t.includes('street') || t.includes('bridge') || t.includes('castle')) {
        if (!t.includes('key') && !t.includes('lock') && !t.includes('card') && !t.includes('model') && !t.includes('miniature') && !t.includes('board')) {
          weirdInProps.push({ file: norm, tag, name, issue: 'Location/Architecture in props' });
        }
      }
    }

    // In artists, check for non-artist tags
    if (isArtists) {
      if (!t.endsWith(')') && !t.includes('(style)') && !t.includes('artist') && !tag.includes('_')) {
        // Just checking if common words leaked into artists
        if (t === 'girl' || t === 'boy' || t === '1girl' || t === '1boy' || t === 'solo' || t === 'dress' || t === 'sword') {
          weirdInArtists.push({ tag, name });
        }
      }
    }
  }
}

console.log(`\n=== 1. Translation Loop / Glitch Anomalies (${translationAnomalies.length}) ===`);
translationAnomalies.forEach(a => console.log(` - [${a.file}] ${a.tag} -> "${a.name}"`));

console.log(`\n=== 2. NSFW Leaked into SFW Files (${nsfwInSfw.length}) ===`);
nsfwInSfw.forEach(a => console.log(` - [${a.file}] ${a.tag} (${a.name})`));

console.log(`\n=== 3. SFW / Vehicles / Non-NSFW in Restricted (${sfwInRestricted.length}) ===`);
sfwInRestricted.forEach(a => console.log(` - [${a.file}] ${a.tag} (${a.name})`));

console.log(`\n=== 4. Actions or Locations Leaked into Props.yaml (${weirdInProps.length}) ===`);
weirdInProps.forEach(a => console.log(` - ${a.tag} (${a.name}) [${a.issue}]`));

console.log(`\n=== 5. Non-artists in Artists.yaml (${weirdInArtists.length}) ===`);
weirdInArtists.forEach(a => console.log(` - ${a.tag} (${a.name})`));
