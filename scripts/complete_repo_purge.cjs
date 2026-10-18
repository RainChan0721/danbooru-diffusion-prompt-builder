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

function loadYaml(f) {
  return yaml.load(fs.readFileSync(f, 'utf8'));
}

function saveYaml(f, data) {
  fs.writeFileSync(f, yaml.dump(data, { indent: 2, lineWidth: -1, noRefs: true }), 'utf8');
}

console.log('=== STARTING COMPLETE 100% REPOSITORY PURGE AND RECLASSIFICATION ===');

// All docs cache
const docs = {};
const allFiles = walk('data/tags');
for (const f of allFiles) {
  const norm = f.replace(/\\/g, '/');
  try {
    docs[norm] = loadYaml(f);
  } catch (e) {}
}

// Target reference docs
const clothesDoc = docs['data/tags/human/clothing-styles.yaml'];
const shoesockDoc = docs['data/tags/human/shoesock.yaml'];
const weaponsDoc = docs['data/tags/items/weapons.yaml'];
const vehiclesDoc = docs['data/tags/items/vehicles.yaml'];
const creaturesDoc = docs['data/tags/items/creatures.yaml'];
const propsDoc = docs['data/tags/items/props.yaml'];
const traitsDoc = docs['data/tags/human/traits.yaml'];
const actionsDoc = docs['data/tags/human/actions.yaml'];
const artisticDoc = docs['data/tags/artistic-license.yaml'];
const backgroundDoc = docs['data/tags/image-composition/background.yaml'];
const skyDoc = docs['data/tags/natural/sky.yaml'];
const scaleDoc = docs['data/tags/image-composition/scale.yaml'];
const perspectiveDoc = docs['data/tags/image-composition/perspective.yaml'];
const placesDoc = docs['data/tags/humanities/places.yaml'];
const metaNegativeDoc = docs['data/tags/meta-negative.yaml'];
const headDoc = docs['data/tags/human/head_ornament.yaml'];
const bodyDoc = docs['data/tags/human/body_ornament.yaml'];

let countCosplayDeleted = 0;
let countMoved = 0;
let countTranslationsFixed = 0;

// =========================================================================
// 1. PURGE ALL RESIDUAL COSPLAY & CHARACTER TAGS REPO-WIDE
// =========================================================================
for (const [filePath, doc] of Object.entries(docs)) {
  if (!doc || !doc.content) continue;
  if (filePath.includes('artistic-license.yaml')) continue;

  for (const [tag, info] of Object.entries(doc.content)) {
    const t = tag.toLowerCase();
    // Catch any cosplay tags or explicit character leak tags
    if (t.includes('(cosplay)')) {
      delete doc.content[tag];
      countCosplayDeleted++;
    }
  }
}

// =========================================================================
// 2. DISASSEMBLE & CLEAN body-parts/supplement.yaml
// =========================================================================
const bodySuppDoc = docs['data/tags/human/body-parts/supplement.yaml'];
if (bodySuppDoc && bodySuppDoc.content) {
  for (const [tag, info] of Object.entries({ ...bodySuppDoc.content })) {
    const t = tag.toLowerCase();

    // 2.1 Shoes / Footwear -> shoesock.yaml
    if (
      t.includes('footwear') || t.includes('shoes') || t.includes('boots') ||
      t.includes('sneakers') || t.includes('sandals') || t.includes('heels') ||
      t.includes('slippers') || t.includes('clogs') || t.includes('geta') ||
      t.includes('zori') || t.includes('loafers') || t.includes('moccasins')
    ) {
      shoesockDoc.content[tag] = info;
      delete bodySuppDoc.content[tag];
      countMoved++;
    }
    // 2.2 Weapons -> weapons.yaml
    else if (
      t.includes('cannon') || t.includes('sword') || t.includes('blade') ||
      t.includes('spear') || t.includes('lance') || t.includes('shield') ||
      t.includes('gungnir') || t.includes('cassius') || t.includes('javelin')
    ) {
      if (!t.includes('wound') && !t.includes('scar')) {
        weaponsDoc.content[tag] = info;
        delete bodySuppDoc.content[tag];
        countMoved++;
      }
    }
    // 2.3 Vehicles -> vehicles.yaml
    else if (t === 'muscle car' || t === 'airplane wing' || t === 'airplane arms' || t === 'helicopter tail') {
      vehiclesDoc.content[tag] = info;
      delete bodySuppDoc.content[tag];
      countMoved++;
    }
    // 2.4 Animals & Bears -> creatures.yaml
    else if (
      t.includes('bear') || t.includes('polar bear') || t.includes('cat') ||
      t.includes('dragon') || t.startsWith('year of the') || t.includes('bird on') ||
      t.includes('creature on')
    ) {
      if (!t.includes('ears') && !t.includes('tail') && !t.includes('wings') && !t.includes('paws') && !t.includes('claw') && !t.includes('legs')) {
        creaturesDoc.content[tag] = info;
        delete bodySuppDoc.content[tag];
        countMoved++;
      }
    }
    // 2.5 Social media -> artistic-license.yaml
    else if (t.includes('facebook') || t.includes('emblem') || t.includes('logo')) {
      artisticDoc.content[tag] = info;
      delete bodySuppDoc.content[tag];
      countMoved++;
    }
  }
}

// =========================================================================
// 3. FIX scenery.yaml (brain, night raven, etc.)
// =========================================================================
const sceneryDoc = docs['data/tags/natural/scenery.yaml'];
if (sceneryDoc && sceneryDoc.content) {
  // brain -> traits
  ['brain', 'brain freeze', 'brain injection'].forEach(tag => {
    if (sceneryDoc.content[tag]) {
      traitsDoc.content[tag] = sceneryDoc.content[tag];
      delete sceneryDoc.content[tag];
      countMoved++;
    }
  });
  // uniforms & styles
  if (sceneryDoc.content['night raven college gym uniform']) {
    clothesDoc.content['night raven college gym uniform'] = sceneryDoc.content['night raven college gym uniform'];
    delete sceneryDoc.content['night raven college gym uniform'];
    countMoved++;
  }
  if (sceneryDoc.content['star harmony academy school uniform']) {
    clothesDoc.content['star harmony academy school uniform'] = sceneryDoc.content['star harmony academy school uniform'];
    delete sceneryDoc.content['star harmony academy school uniform'];
    countMoved++;
  }
  if (sceneryDoc.content['funamusea (style)']) {
    artisticDoc.content['funamusea (style)'] = sceneryDoc.content['funamusea (style)'];
    delete sceneryDoc.content['funamusea (style)'];
    countMoved++;
  }
  // star ornaments
  ['star tattoo', 'star ornament', 'star bracelet', 'snowflake ornament', 'shooting star hair ornament', 'snowflake hat ornament', 'starry skin', 'water drop hair ornament'].forEach(tag => {
    if (sceneryDoc.content[tag]) {
      if (tag.includes('hair') || tag.includes('hat')) headDoc.content[tag] = sceneryDoc.content[tag];
      else if (tag.includes('tattoo') || tag.includes('bracelet') || tag.includes('ornament')) bodyDoc.content[tag] = sceneryDoc.content[tag];
      else traitsDoc.content[tag] = sceneryDoc.content[tag];
      delete sceneryDoc.content[tag];
      countMoved++;
    }
  });
}

// =========================================================================
// 4. FIX creatures.yaml (operator uniforms, fishnet dress, styles)
// =========================================================================
if (creaturesDoc && creaturesDoc.content) {
  ['utnapishtim operator uniform (blue archive)', 'border operator uniform (world trigger)', 'infinite stratos academy school uniform', 'fishnet dress'].forEach(tag => {
    if (creaturesDoc.content[tag]) {
      clothesDoc.content[tag] = creaturesDoc.content[tag];
      delete creaturesDoc.content[tag];
      countMoved++;
    }
  });
  ['omocat (style)', 'animal crossing (style)', 'lobotomy corporation logo', 'cat symbol', 'rabbit symbol'].forEach(tag => {
    if (creaturesDoc.content[tag]) {
      artisticDoc.content[tag] = creaturesDoc.content[tag];
      delete creaturesDoc.content[tag];
      countMoved++;
    }
  });
  if (creaturesDoc.content['slime sex']) {
    docs['data/tags/restricted/r18-fantasy.yaml'].content['slime sex'] = creaturesDoc.content['slime sex'];
    delete creaturesDoc.content['slime sex'];
    countMoved++;
  }
}

// =========================================================================
// 5. FIX vehicles.yaml (ghostbusters uniform, toon style)
// =========================================================================
if (vehiclesDoc && vehiclesDoc.content) {
  if (vehiclesDoc.content['ghostbusters uniform']) {
    clothesDoc.content['ghostbusters uniform'] = vehiclesDoc.content['ghostbusters uniform'];
    delete vehiclesDoc.content['ghostbusters uniform'];
    countMoved++;
  }
  if (vehiclesDoc.content['toon (style)']) {
    artisticDoc.content['toon (style)'] = vehiclesDoc.content['toon (style)'];
    delete vehiclesDoc.content['toon (style)'];
    countMoved++;
  }
}

// =========================================================================
// 6. FIX weapons.yaml (wandenreich uniform)
// =========================================================================
if (weaponsDoc && weaponsDoc.content) {
  if (weaponsDoc.content['wandenreich uniform']) {
    clothesDoc.content['wandenreich uniform'] = weaponsDoc.content['wandenreich uniform'];
    delete weaponsDoc.content['wandenreich uniform'];
    countMoved++;
  }
}

// =========================================================================
// 7. FIX clothing/supplement.yaml (armored vehicle, bowgun, etc.)
// =========================================================================
const clothSuppDoc = docs['data/tags/human/clothing/supplement.yaml'];
if (clothSuppDoc && clothSuppDoc.content) {
  ['armored vehicle', 'armored personnel carrier'].forEach(tag => {
    if (clothSuppDoc.content[tag]) {
      vehiclesDoc.content[tag] = clothSuppDoc.content[tag];
      delete clothSuppDoc.content[tag];
      countMoved++;
    }
  });
  if (clothSuppDoc.content['bowgun']) {
    weaponsDoc.content['bowgun'] = clothSuppDoc.content['bowgun'];
    delete clothSuppDoc.content['bowgun'];
    countMoved++;
  }
  ['chi-hatan (emblem)', 'bowser logo', 'capture styler'].forEach(tag => {
    if (clothSuppDoc.content[tag]) {
      artisticDoc.content[tag] = clothSuppDoc.content[tag];
      delete clothSuppDoc.content[tag];
      countMoved++;
    }
  });
  ['carrot necklace', 'food-themed necklace'].forEach(tag => {
    if (clothSuppDoc.content[tag]) {
      bodyDoc.content[tag] = clothSuppDoc.content[tag];
      delete clothSuppDoc.content[tag];
      countMoved++;
    }
  });
  ['carrot earrings', 'food-themed earrings', 'food-themed hat ornament'].forEach(tag => {
    if (clothSuppDoc.content[tag]) {
      headDoc.content[tag] = clothSuppDoc.content[tag];
      delete clothSuppDoc.content[tag];
      countMoved++;
    }
  });
}

// =========================================================================
// 8. FIX image-composition/supplement.yaml (bloomers, shotgun, sky, backgrounds)
// =========================================================================
const lightSuppDoc = docs['data/tags/image-composition/supplement.yaml'];
if (lightSuppDoc && lightSuppDoc.content) {
  for (const [tag, info] of Object.entries({ ...lightSuppDoc.content })) {
    const t = tag.toLowerCase();

    if (t === 'white bloomers') {
      clothesDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t === 'shotgun') {
      weaponsDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t.includes('watercraft')) {
      vehiclesDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t === 'water gun') {
      weaponsDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t === 'water bottle' || t === 'broom') {
      propsDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t.includes('background')) {
      backgroundDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t.includes('sky') || t.includes('sunlight') || t.includes('cloud') || t.includes('twilight') || t.includes('star (sky)')) {
      skyDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    } else if (t.includes('watermark')) {
      metaNegativeDoc.content[tag] = info;
      delete lightSuppDoc.content[tag];
      countMoved++;
    }
  }
}

// =========================================================================
// 9. FIX general-elements.yaml (social media logos, usernames, vehicles)
// =========================================================================
const genElemDoc = docs['data/tags/image-composition/general-elements.yaml'];
if (genElemDoc && genElemDoc.content) {
  for (const [tag, info] of Object.entries({ ...genElemDoc.content })) {
    const t = tag.toLowerCase();

    if (t.includes('username') || t.includes('logo') || t.includes('(style)') || t.includes('(meme)')) {
      artisticDoc.content[tag] = info;
      delete genElemDoc.content[tag];
      countMoved++;
    } else if (t === 'locomotive' || t === 'diesel locomotive' || t === 'electric locomotive' || t === 'submarine') {
      vehiclesDoc.content[tag] = info;
      delete genElemDoc.content[tag];
      countMoved++;
    }
  }
}

// =========================================================================
// 10. FIX restricted/ files (cumulonimbus cloud, titans, training outfit, scarves)
// =========================================================================
const r18FluidsDoc = docs['data/tags/restricted/r18-fluids.yaml'];
if (r18FluidsDoc && r18FluidsDoc.content) {
  if (r18FluidsDoc.content['cumulonimbus cloud']) {
    skyDoc.content['cumulonimbus cloud'] = { name: '积雨云' };
    delete r18FluidsDoc.content['cumulonimbus cloud'];
    countMoved++;
  }
  ['mr.milk caramel', 'caramel (caramelmilk)'].forEach(tag => {
    if (r18FluidsDoc.content[tag]) {
      docs['data/tags/humanities/food/sweets.yaml'].content[tag] = r18FluidsDoc.content[tag];
      delete r18FluidsDoc.content[tag];
      countMoved++;
    }
  });
}

const r18MoodDoc = docs['data/tags/restricted/r18-mood.yaml'];
if (r18MoodDoc && r18MoodDoc.content) {
  if (r18MoodDoc.content['cart titan']) {
    traitsDoc.content['cart titan'] = { name: '车力巨人（特征）' };
    delete r18MoodDoc.content['cart titan'];
    countMoved++;
  }
  if (r18MoodDoc.content['titan shifter scars']) {
    traitsDoc.content['titan shifter scars'] = { name: '巨人化面部伤痕' };
    delete r18MoodDoc.content['titan shifter scars'];
    countMoved++;
  }
}

const r18FetishDoc = docs['data/tags/restricted/r18-fetish.yaml'];
if (r18FetishDoc && r18FetishDoc.content) {
  if (r18FetishDoc.content['training outfit (fire emblem engage)']) {
    clothesDoc.content['training outfit (fire emblem engage)'] = { name: '火焰纹章训练服' };
    delete r18FetishDoc.content['training outfit (fire emblem engage)'];
    countMoved++;
  }
  if (r18FetishDoc.content['collared peccary (kemono friends)']) {
    creaturesDoc.content['collared peccary (kemono friends)'] = { name: '白唇西貒（兽娘动物园）' };
    delete r18FetishDoc.content['collared peccary (kemono friends)'];
    countMoved++;
  }
}

const r18ActsDoc = docs['data/tags/restricted/r18-acts.yaml'];
if (r18ActsDoc && r18ActsDoc.content) {
  ['striped scarf', 'vertical-striped scarf', 'striped cardigan'].forEach(tag => {
    if (r18ActsDoc.content[tag]) {
      clothesDoc.content[tag] = r18ActsDoc.content[tag];
      delete r18ActsDoc.content[tag];
      countMoved++;
    }
  });
}

// =========================================================================
// 11. FIX directions.yaml (full body, upper body, lower body, portrait, upskirt)
// =========================================================================
const dirDoc = docs['data/tags/human/directions.yaml'];
if (dirDoc && dirDoc.content) {
  ['full body', 'upper body', 'lower body', 'portrait'].forEach(tag => {
    if (dirDoc.content[tag]) {
      scaleDoc.content[tag] = dirDoc.content[tag];
      delete dirDoc.content[tag];
      countMoved++;
    }
  });
  ['upskirt', 'upshirt', 'upshorts'].forEach(tag => {
    if (dirDoc.content[tag]) {
      perspectiveDoc.content[tag] = dirDoc.content[tag];
      delete dirDoc.content[tag];
      countMoved++;
    }
  });
  ['taking picture', 'staring', 'eye contact', 'peeping'].forEach(tag => {
    if (dirDoc.content[tag]) {
      actionsDoc.content[tag] = dirDoc.content[tag];
      delete dirDoc.content[tag];
      countMoved++;
    }
  });
  if (dirDoc.content['looking at penis']) {
    docs['data/tags/restricted/r18-acts.yaml'].content['looking at penis'] = dirDoc.content['looking at penis'];
    delete dirDoc.content['looking at penis'];
    countMoved++;
  }
}

// =========================================================================
// 12. FIX props.yaml (suspension bridge, nokotan meme, holding swim ring)
// =========================================================================
if (propsDoc && propsDoc.content) {
  if (propsDoc.content['suspension bridge']) {
    placesDoc.content['suspension bridge'] = { name: '悬索吊桥' };
    delete propsDoc.content['suspension bridge'];
    countMoved++;
  }
  if (propsDoc.content['nokotan entering a classroom (meme)']) {
    artisticDoc.content['nokotan entering a classroom (meme)'] = { name: '鹿乃子进教室（梗）' };
    delete propsDoc.content['nokotan entering a classroom (meme)'];
    countMoved++;
  }
  if (propsDoc.content['holding swim ring']) {
    actionsDoc.content['holding swim ring'] = { name: '手持游泳圈' };
    delete propsDoc.content['holding swim ring'];
    countMoved++;
  }
}

// =========================================================================
// 13. FIX MACHINE TRANSLATION GLITCHES & LOOPS
// =========================================================================
const fixTranslations = {
  'v (tit mzmz)': '揉胸/抓揉胸部',
  'dynamite pussy cat': '炸药猫娘',
  'apulaz (crossbow pussycat)': 'apulaz（十字弓猫娘）',
  'momoyama tits': '桃山（胸部本）',
  'shijukara (great tit)': '大山雀（鸟类）',
  'trash bag': '垃圾袋',
  'table tennis paddle': '乒乓球拍',
  'moriya\'s iron rings': '守矢之铁环',
  'electrical outlet': '电源插座',
  'clothed bath': '穿着衣服泡澡',
  'muscular child': '肌肉儿童/肌肉萝莉',
  'holding swimsuit': '手持泳衣',
  'hard drive': '硬盘驱动器',
  'long-tailed tit': '长尾山雀'
};

for (const [filePath, doc] of Object.entries(docs)) {
  if (!doc || !doc.content) continue;
  for (const [tag, newName] of Object.entries(fixTranslations)) {
    if (doc.content[tag]) {
      doc.content[tag].name = newName;
      countTranslationsFixed++;
    }
  }
}

// =========================================================================
// 14. MERGE ORPHANED TINY FILES (< 10 tags)
// =========================================================================
// 14.1 human/quality.yaml -> meta-negative.yaml
const qualityDoc = docs['data/tags/human/quality.yaml'];
if (qualityDoc && qualityDoc.content) {
  for (const [k, v] of Object.entries(qualityDoc.content)) {
    metaNegativeDoc.content[k] = v;
  }
  delete docs['data/tags/human/quality.yaml'];
  fs.unlinkSync('data/tags/human/quality.yaml');
  console.log('Merged and removed human/quality.yaml');
}

// 14.2 image-composition/articles.yaml -> meta-negative.yaml
const articlesDoc = docs['data/tags/image-composition/articles.yaml'];
if (articlesDoc && articlesDoc.content) {
  for (const [k, v] of Object.entries(articlesDoc.content)) {
    metaNegativeDoc.content[k] = v;
  }
  delete docs['data/tags/image-composition/articles.yaml'];
  fs.unlinkSync('data/tags/image-composition/articles.yaml');
  console.log('Merged and removed image-composition/articles.yaml');
}

// 14.3 humanities/cities.yaml -> humanities/places.yaml
const citiesDoc = docs['data/tags/humanities/cities.yaml'];
if (citiesDoc && citiesDoc.content) {
  for (const [k, v] of Object.entries(citiesDoc.content)) {
    placesDoc.content[k] = v;
  }
  delete docs['data/tags/humanities/cities.yaml'];
  fs.unlinkSync('data/tags/humanities/cities.yaml');
  console.log('Merged and removed humanities/cities.yaml');
}

// =========================================================================
// 15. SAVE ALL MODIFIED DOCUMENTS
// =========================================================================
for (const [filePath, doc] of Object.entries(docs)) {
  if (doc && doc.content) {
    saveYaml(filePath, doc);
  }
}

console.log(`\n=== PURGE SUMMARY ===
  - Residual Cosplay / Character tags deleted: ${countCosplayDeleted}
  - Misplaced tags accurately migrated to proper homes: ${countMoved}
  - Machine translation blunders & loops repaired: ${countTranslationsFixed}
  - 3 Orphaned files merged into core categories.
=====================================================`);
