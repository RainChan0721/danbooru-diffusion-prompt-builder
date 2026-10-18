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
console.log(`Starting exhaustive audit across ${files.length} files...`);

const report = {
  clothes_in_wrong_places: [],
  weapons_in_wrong_places: [],
  vehicles_in_wrong_places: [],
  creatures_in_wrong_places: [],
  anatomy_or_body_in_wrong_places: [],
  styles_and_meta_in_wrong_places: [],
  props_and_furniture_in_wrong_places: [],
  nature_in_wrong_places: [],
  food_in_wrong_places: [],
  translation_blunders: []
};

// Patterns
const clothingPatterns = /\b(uniform|swimsuit|bikini|dress|skirt|sleeves|pants|shirt|jacket|coat|socks|gloves|shoes|boots|footwear|hat|cap|bonnet|scrunchie|choker|bloomers|bra|panties|costume|leotard|apron|tabard|cape|cloak|cardigan|sweater|hoodie|scarf|maebari)\b/i;
const weaponPatterns = /\b(sword|katana|blade|gun|rifle|pistol|shotgun|revolver|cannon|missile|shield|spear|lance|bow|crossbow|dagger|axe|halberd|mace|grenade)\b/i;
const vehiclePatterns = /\b(car|automobile|truck|bus|motorcycle|bicycle|train|locomotive|airplane|aircraft|helicopter|spaceship|tank|ship|boat|submarine|vehicle)\b/i;
const creaturePatterns = /\b(cat|dog|bird|fish|rabbit|horse|dragon|wolf|fox|bear|lion|tiger|deer|sheep|snake|spider|whale|dolphin|shark|owl|butterfly|creature|monster)\b/i;
const anatomyPatterns = /\b(brain|heart|liver|lung|kidney|stomach|intestine|skull|skeleton|spine|bone|flesh|organ|eyeball|testicle|penis|vagina|clitoris|labia|pussy)\b/i;
const metaPatterns = /\b(\(style\)|style|logo|emblem|username|watermark|\(meme\)|\(cosplay\)|\(medium\)|\(retro\))\b/i;

for (const file of files) {
  const norm = file.replace(/\\/g, '/');
  let doc;
  try {
    doc = yaml.load(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    continue;
  }
  if (!doc || !doc.content) continue;

  const isClothingFile = norm.includes('/clothing') || norm.includes('/clothes') || norm.includes('clothing-styles') || norm.includes('shoesock');
  const isWeaponFile = norm.includes('weapons.yaml');
  const isVehicleFile = norm.includes('vehicles.yaml');
  const isCreatureFile = norm.includes('creatures.yaml');
  const isNaturalFile = norm.includes('/natural/');
  const isFoodFile = norm.includes('/food/');
  const isBodyFile = norm.includes('/human/body-parts/') || norm.includes('face.yaml') || norm.includes('ears.yaml') || norm.includes('breasts.yaml') || norm.includes('lowerbody.yaml') || norm.includes('upperbody.yaml') || norm.includes('traits.yaml');
  const isMetaFile = norm.includes('artistic-license.yaml') || norm.includes('meta-') || norm.includes('artists-');
  const isImageComp = norm.includes('/image-composition/');
  const isPropsFile = norm.includes('props.yaml');
  const isHumanities = norm.includes('/humanities/');

  for (const [tag, info] of Object.entries(doc.content)) {
    const t = tag.toLowerCase();
    const name = (info.name || '').toLowerCase();

    // 1. Clothing in non-clothing files
    if (clothingPatterns.test(t)) {
      // Ignore valid prints, patterns, holding clothes, eating, animal features
      if (!isClothingFile && !norm.includes('body_ornament') && !norm.includes('head_ornament') && !norm.includes('r18') && !norm.includes('actions.yaml')) {
        if (!t.includes('print') && !t.includes('pattern') && !t.includes('holding') && !t.includes('covered') && !t.includes('through clothes') && !t.includes('theme') && !t.includes('ears') && !t.includes('tail') && !t.includes('wings') && !t.includes('cutout') && !t.includes('focus') && !t.includes('pull')) {
          report.clothes_in_wrong_places.push({ file: norm, tag, name: info.name });
        }
      }
    }

    // 2. Weapons in non-weapon files
    if (weaponPatterns.test(t)) {
      if (!isWeaponFile && !norm.includes('actions.yaml') && !norm.includes('r18') && !isMetaFile) {
        if (!t.includes('print') && !t.includes('pattern') && !t.includes('holding') && !t.includes('aiming') && !t.includes('pointing') && !t.includes('sheath') && !t.includes('holster') && !t.includes('wound') && !t.includes('hair') && !t.includes('eyes') && !t.includes('pose') && !t.includes('theme') && !t.includes('symbol')) {
          report.weapons_in_wrong_places.push({ file: norm, tag, name: info.name });
        }
      }
    }

    // 3. Vehicles in non-vehicle files
    if (vehiclePatterns.test(t)) {
      if (!isVehicleFile && !norm.includes('actions.yaml') && !isMetaFile) {
        if (!t.includes('print') && !t.includes('pattern') && !t.includes('holding') && !t.includes('riding') && !t.includes('driving') && !t.includes('theme') && !t.includes('hair') && !t.includes('eyes') && !t.includes('tank top') && !t.includes('boat neck')) {
          report.vehicles_in_wrong_places.push({ file: norm, tag, name: info.name });
        }
      }
    }

    // 4. Creatures in non-creature files (e.g. food, natural, body parts)
    if (creaturePatterns.test(t)) {
      if (!isCreatureFile && !norm.includes('actions.yaml') && !isMetaFile && !isClothingFile && !norm.includes('food')) {
        if (!t.includes('ears') && !t.includes('tail') && !t.includes('wings') && !t.includes('horn') && !t.includes('print') && !t.includes('pattern') && !t.includes('holding') && !t.includes('riding') && !t.includes('hair') && !t.includes('eyes') && !t.includes('theme') && !t.includes('symbol') && !t.includes('costume') && !t.includes('hood') && !t.includes('mask') && !t.includes('cutout') && !t.includes('pose')) {
          report.creatures_in_wrong_places.push({ file: norm, tag, name: info.name });
        }
      }
    }

    // 5. Internal anatomy / organs in non-body files (e.g. natural scenery, food, props)
    if (anatomyPatterns.test(t)) {
      if (isNaturalFile || isFoodFile || norm.includes('places.yaml')) {
        if (!t.includes('fruit') && !t.includes('plant') && !t.includes('tree') && !t.includes('flower') && !t.includes('dish') && !t.includes('soup')) {
          report.anatomy_or_body_in_wrong_places.push({ file: norm, tag, name: info.name });
        }
      }
    }

    // 6. Meta / Styles / Logos in content files
    if (metaPatterns.test(t)) {
      if (!isMetaFile) {
        report.styles_and_meta_in_wrong_places.push({ file: norm, tag, name: info.name });
      }
    }

    // 7. Check mistranslations
    if (t.includes('tit') && !t.includes('title') && !t.includes('attitude') && (name.includes('山雀') || name.includes('鸟')) && (norm.includes('human') || norm.includes('restricted'))) {
      report.translation_blunders.push({ file: norm, tag, name: info.name, fix: 'tit mistranslated as 山雀' });
    }
    if (t.includes('pussy') && name.includes('猫')) {
      report.translation_blunders.push({ file: norm, tag, name: info.name, fix: 'pussy mistranslated as 猫' });
    }
  }
}

console.log('\n================ EXHAUSTIVE AUDIT RESULTS ================');
for (const [category, items] of Object.entries(report)) {
  console.log(`\n### ${category.toUpperCase()} (Total: ${items.length}) ###`);
  items.slice(0, 20).forEach(item => {
    console.log(` - [${item.file}] ${item.tag} (${item.name}) ${item.fix ? '-> ' + item.fix : ''}`);
  });
  if (items.length > 20) {
    console.log(`   ... and ${items.length - 20} more`);
  }
}
