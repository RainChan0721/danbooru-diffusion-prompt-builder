const fs = require('fs');
const yaml = require('js-yaml');

function loadYaml(f) {
  return yaml.load(fs.readFileSync(f, 'utf8'));
}

function saveYaml(f, data) {
  fs.writeFileSync(f, yaml.dump(data, { indent: 2, lineWidth: -1, noRefs: true }), 'utf8');
}

const bodySuppDoc = loadYaml('data/tags/human/body-parts/supplement.yaml');
const clothSuppDoc = loadYaml('data/tags/human/clothing/supplement.yaml');
const genElemDoc = loadYaml('data/tags/image-composition/general-elements.yaml');
const propsDoc = loadYaml('data/tags/items/props.yaml');
const weaponsDoc = loadYaml('data/tags/items/weapons.yaml');
const vehiclesDoc = loadYaml('data/tags/items/vehicles.yaml');
const creaturesDoc = loadYaml('data/tags/items/creatures.yaml');
const clothesDoc = loadYaml('data/tags/human/clothing-styles.yaml');
const artisticDoc = loadYaml('data/tags/artistic-license.yaml');
const headDoc = loadYaml('data/tags/human/head_ornament.yaml');
const bodyDoc = loadYaml('data/tags/human/body_ornament.yaml');
const humantypeDoc = loadYaml('data/tags/human/humantype.yaml');
const actionsDoc = loadYaml('data/tags/human/actions.yaml');

// 1. Move long-tailed tit to creatures
if (bodySuppDoc.content['long-tailed tit']) {
  creaturesDoc.content['long-tailed tit'] = { name: '长尾山雀（鸟类）' };
  delete bodySuppDoc.content['long-tailed tit'];
}

// 2. Move brown dog to creatures
if (bodySuppDoc.content['brown dog']) {
  creaturesDoc.content['brown dog'] = bodySuppDoc.content['brown dog'];
  delete bodySuppDoc.content['brown dog'];
}

// 3. Move snake charmer to humantype, snake armband to body_ornament
if (bodySuppDoc.content['snake charmer']) {
  humantypeDoc.content['snake charmer'] = bodySuppDoc.content['snake charmer'];
  delete bodySuppDoc.content['snake charmer'];
}
if (bodySuppDoc.content['snake armband']) {
  bodyDoc.content['snake armband'] = bodySuppDoc.content['snake armband'];
  delete bodySuppDoc.content['snake armband'];
}
if (bodySuppDoc.content['cat between legs']) {
  actionsDoc.content['cat between legs'] = bodySuppDoc.content['cat between legs'];
  delete bodySuppDoc.content['cat between legs'];
}

// 4. Move bras / cardigans / leotards from body-parts to clothing-styles
['brown sleeves', 'heart maebari', 'cardigan around waist', 'brown leotard', 'brown bra', 'bra slip', 'off-shoulder leotard', 'brown sports bra', 'heart bra'].forEach(t => {
  if (bodySuppDoc.content[t]) {
    clothesDoc.content[t] = bodySuppDoc.content[t];
    delete bodySuppDoc.content[t];
  }
});

// 5. Move bow (weapon) from clothing to weapons
if (clothSuppDoc.content['bow (weapon)']) {
  weaponsDoc.content['bow (weapon)'] = clothSuppDoc.content['bow (weapon)'];
  delete clothSuppDoc.content['bow (weapon)'];
}

// 6. Move steam locomotive from props to vehicles
if (propsDoc.content['steam locomotive']) {
  vehiclesDoc.content['steam locomotive'] = propsDoc.content['steam locomotive'];
  delete propsDoc.content['steam locomotive'];
}

// 7. Move helmets from weapons to head_ornament
['motorcycle helmet', 'tank helmet', 'bicycle helmet'].forEach(h => {
  if (weaponsDoc.content[h]) {
    headDoc.content[h] = weaponsDoc.content[h];
    delete weaponsDoc.content[h];
  }
});

// 8. Move emblems from general-elements to artistic-license
for (const [tag, info] of Object.entries({ ...genElemDoc.content })) {
  if (tag.includes('(emblem)') || tag.includes('clan (emblem)')) {
    artisticDoc.content[tag] = info;
    delete genElemDoc.content[tag];
  }
}

// Save all updated files
saveYaml('data/tags/human/body-parts/supplement.yaml', bodySuppDoc);
saveYaml('data/tags/human/clothing/supplement.yaml', clothSuppDoc);
saveYaml('data/tags/image-composition/general-elements.yaml', genElemDoc);
saveYaml('data/tags/items/props.yaml', propsDoc);
saveYaml('data/tags/items/weapons.yaml', weaponsDoc);
saveYaml('data/tags/items/vehicles.yaml', vehiclesDoc);
saveYaml('data/tags/items/creatures.yaml', creaturesDoc);
saveYaml('data/tags/human/clothing-styles.yaml', clothesDoc);
saveYaml('data/tags/artistic-license.yaml', artisticDoc);
saveYaml('data/tags/human/head_ornament.yaml', headDoc);
saveYaml('data/tags/human/body_ornament.yaml', bodyDoc);
saveYaml('data/tags/human/humantype.yaml', humantypeDoc);
saveYaml('data/tags/human/actions.yaml', actionsDoc);

console.log('Second pass precision migration complete!');
