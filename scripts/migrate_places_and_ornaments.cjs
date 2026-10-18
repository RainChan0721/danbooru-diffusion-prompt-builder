const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function saveYaml(filePath, data) {
  const content = yaml.dump(data, {
    indent: 2,
    lineWidth: -1,
    noRefs: true
  });
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Load files
const placesPath = 'data/tags/humanities/places.yaml';
const placesDoc = loadYaml(placesPath);
const places = placesDoc.content || {};

const targetFiles = {
  body_ornament: 'data/tags/human/body_ornament.yaml',
  clothing_styles: 'data/tags/human/clothing-styles.yaml',
  clothes: 'data/tags/human/clothes.yaml',
  traits: 'data/tags/human/traits.yaml',
  actions: 'data/tags/human/actions.yaml',
  humantype: 'data/tags/human/humantype.yaml',
  props: 'data/tags/items/props.yaml',
  weapons: 'data/tags/items/weapons.yaml',
  vehicles: 'data/tags/items/vehicles.yaml',
  creatures: 'data/tags/items/creatures.yaml',
  artistic_license: 'data/tags/artistic-license.yaml',
  format: 'data/tags/image-composition/format.yaml',
  scenery: 'data/tags/natural/scenery.yaml',
  general_elements: 'data/tags/image-composition/general-elements.yaml'
};

const loadedDocs = {};
for (const [k, f] of Object.entries(targetFiles)) {
  loadedDocs[k] = loadYaml(f);
  if (!loadedDocs[k].content) loadedDocs[k].content = {};
}

// Function to move a tag from source map to a target doc
function moveTag(sourceMap, tag, targetKey) {
  if (sourceMap[tag]) {
    loadedDocs[targetKey].content[tag] = sourceMap[tag];
    delete sourceMap[tag];
  }
}

// STEP 1: Process humanities/places.yaml (300 tags)
for (const [tag, info] of Object.entries({ ...places })) {
  const t = tag.toLowerCase();

  // 1. Body ornaments & piercings & tattoos
  if (t === 'barbell piercing' || t === 'bridge piercing' || t === 'barcode tattoo') {
    moveTag(places, tag, 'body_ornament');
  }
  // 2. Body traits
  else if (t === 'bare back' || t === 'single bare leg' || t === 'single bare foot' || t === 'handlebar mustache' || t === 'capybara ears') {
    moveTag(places, tag, 'traits');
  }
  // 3. Clothing & Uniforms
  else if (
    t.includes('uniform') || t.includes('swimsuit') || t.includes('tabard') ||
    t === 'puffy long sleeves' || t === 'bridgeless bra' || t === 'hospital gown' ||
    t === 'barber cape' || t === 'tape maebari'
  ) {
    moveTag(places, tag, 'clothing_styles');
  }
  // 4. Weapons
  else if (t === 'barrett m82' || t === 'm1918 bar' || t === 'fabarm fp6' || t === 'barrel shroud' || t === 'double barrels') {
    moveTag(places, tag, 'weapons');
  }
  // 5. Vehicles
  else if (t === 'subaru impreza' || t === 'subaru wrx' || t === 'mazda mx-5') {
    moveTag(places, tag, 'vehicles');
  }
  // 6. Creatures
  else if (t === 'barnacle' || t === 'barn owl' || t === 'mogeko (species)') {
    moveTag(places, tag, 'creatures');
  }
  // 7. Professions & Human roles
  else if (
    t === 'bartender' || t === 'barista' || t === 'barber' || t === 'housewife' ||
    t === 'merchant' || t === 'store clerk' || t === 'school nurse' || t === 'hostage' ||
    t === 'barbarian' || t === 'bard' || t === 'dancer (fire emblem: three houses)' ||
    t === 'barbarian set (zelda)'
  ) {
    moveTag(places, tag, 'humantype');
  }
  // 8. Actions & poses
  else if (
    t === 'roundhouse kick' || t === 'barking' || t === 'on mushroom' ||
    t === 'sitting on mushroom' || t === 'against door' || t === 'tabard lift' ||
    t === 'shopping' || t === 'grilling' || t === 'ganbare ganbare (itou life)' ||
    t === 'ganbaruzoi' || t === 'human tower'
  ) {
    moveTag(places, tag, 'actions');
  }
  // 9. Natural scenery
  else if (t === 'valley' || t === 'whirlpool') {
    moveTag(places, tag, 'scenery');
  }
  // 10. UI & Composition format
  else if (t === 'health bar' || t === 'progress bar' || t === 'signal bar' || t === 'status bar' || t === 'taskbar') {
    moveTag(places, tag, 'format');
  }
  // 11. Meta / Software / Style / Media
  else if (
    t.includes('photoshop') || t.includes('artstation') || t.includes('gumroad') ||
    t.includes('playstation') || t.includes('subaru (brand)') || t.includes('(tarot)') ||
    t.includes('(style)') || t.includes('(idolmaster)') || t.includes('(love live!)') ||
    t.includes('(blue archive)') || t.includes('(league of legends)') || t.includes('(umamusume)') ||
    t === 'summary' || t === 'academic test' || t.includes('logo') || t.includes('emblem') ||
    t.includes('(cosplay)') || t === 'late for school' || t === 'guilty gear strive x tower records' ||
    t === 'stage connection' || t === 'school connection'
  ) {
    moveTag(places, tag, 'artistic_license');
  }
  // 12. Props & items & furniture
  else if (
    t.includes('candy bar') || t.includes('ice cream bar') || t.includes('bar soap') ||
    t === 'barbell' || t === 'crowbar' || t === 'rebar' || t === 'billiard ball' || t === 'cue stick' ||
    t === 'barrel' || t === 'sake barrel' || t === 'spool' || t === 'school briefcase' || t === 'postage stamp' ||
    t === 'traffic cone' || t === 'drum (container)' || t === 'stationery' || t === 'gold bar' ||
    t === 'whammy bar' || t === 'church bell' || t === 'shrine bell' || t === 'doormat' || t === 'doorknob' ||
    t === 'doorbell' || t === 'door chain' || t === 'door handle' || t === 'board eraser' || t === 'barcode scanner' ||
    t === 'handlebar' || t === 'pool of blood' || t === 'saliva pool' || t === 'kitchen range' || t === 'kitchen hood' ||
    t === 'barre chord' || t === 'electrokinesis' || t === 'barricade' || t === 'boom barrier' || t === 'traffic barrier' ||
    t === 'roadblock' || t === 'stage curtains' || t === 'barre' || t === 'grill' || t === 'bishop (chess)' ||
    t === 'shopping basket' || t === 'horizontal bar' || t === 'barber pole' || t === 'billiards' || t === 'school desk' ||
    t === 'bar stool' || t === 'pool ladder' || t === 'model building' || t === 'computer tower'
  ) {
    moveTag(places, tag, 'props');
  }
}

console.log('Places remaining tags:', Object.keys(places).length);

// STEP 2: Extract ornaments from props.yaml into body_ornament
const propsContent = loadedDocs.props.content;
const ornamentInProps = [
  'ring', 'wedding ring', 'multiple rings', 'thumb ring', 'toe ring', 'nose ring',
  'ornate ring', 'gold ring', 'silver ring', 'diamond ring', 'skull ring', 'pinky ring',
  'middle ring', 'mega ring', 'holy ring', 'millennium ring', 'flower ring', 'emblem ring',
  'breast rings', 'thigh ring', 'crystal necklace', 'diamond necklace', 'silver necklace',
  'cross pendant', 'pendant earring', 'key choker', 'acorn pendant', 'star pendant',
  'inverted cross necklace', 'spiked necklace', 'lock necklace', 'bat necklace',
  'snowflake pendant', 'flower brooch', 'corsage', 'flower anklet', 'o-ring arm strap',
  'z-ring', 'pendant watch', 'star color pendant', 'rectangular earrings', 'silver earrings',
  'hanafuda earrings', 'sun earrings', 'crown earrings', 'inverted cross earrings',
  'large earrings', 'ofuda earrings', 'ankh earrings', 'soyombo earrings', 'apple earrings',
  'hourglass earrings'
];

ornamentInProps.forEach(tag => {
  if (propsContent[tag]) {
    moveTag(propsContent, tag, 'body_ornament');
  }
});

// Move misplaced actions out of props.yaml
const actionsInProps = [
  'covering privates', 'covering own mouth', 'covering one eye', 'covering ass',
  'whispering', 'pouring onto self', 'putting on earrings', 'necklace pull',
  'necklace in mouth', 'pendant removed'
];

actionsInProps.forEach(tag => {
  if (propsContent[tag]) {
    moveTag(propsContent, tag, 'actions');
  }
});

// STEP 3: Extract ornaments from general_elements into body_ornament
const genContent = loadedDocs.general_elements.content;
const ornamentsInGen = [
  // Piercings
  'corset piercing', 'cheek piercing', 'chin piercing', 'neck piercing',
  'eyelid piercing', 'lorum piercing', 'spike piercing', 'piercing hole',
  'safety pin piercing', 'side labret piercing', 'eye piercing', 'forehead piercing',
  // Bracelets & Anklets
  'fur bracelet', 'frilled bracelet', 'chain bracelet', 'silver bracelet',
  'leaf bracelet', 'metal bracelet', 'single bracelet', 'jade bracelet',
  'gold anklet', 'frilled anklet', 'fur anklet', 'unworn bracelet',
  // Bandages
  'bandage on knee', 'bandaged ankle', 'bandaged knees', 'black bandages',
  'bandaged torso', 'red bandage', 'loose bandages', 'bandage on neck',
  'bandaged waist', 'bandage on cheek',
  // Tattoos
  'skull tattoo', 'spade tattoo', 'bat tattoo', 'anchor tattoo', 'scorpion tattoo',
  'crescent tattoo', 'tiger tattoo', 'pig tattoo', 'eye tattoo', 'hip tattoo',
  'red tattoo', 'head tattoo', 'midriff tattoo', 'wrist tattoo', 'blue tattoo',
  'paw print tattoo', 'character tattoo', 'paw tattoo', 'musical note tattoo',
  'tattoo sleeve', 'cheek tattoo', 'square tattoo', 'no tattoo'
];

ornamentsInGen.forEach(tag => {
  if (genContent[tag]) {
    moveTag(genContent, tag, 'body_ornament');
  }
});

// Also check scale.yaml for multiple piercings, multiple bracelets, multiple tattoos, multiple anklets
const scalePath = 'data/tags/image-composition/scale.yaml';
const scaleDoc = loadYaml(scalePath);
['multiple piercings', 'multiple bracelets', 'multiple tattoos', 'multiple anklets'].forEach(tag => {
  if (scaleDoc.content && scaleDoc.content[tag]) {
    loadedDocs.body_ornament.content[tag] = scaleDoc.content[tag];
    delete scaleDoc.content[tag];
  }
});
saveYaml(scalePath, scaleDoc);

// STEP 4: Save all updated documents
placesDoc.content = places;
saveYaml(placesPath, placesDoc);

for (const [k, f] of Object.entries(targetFiles)) {
  saveYaml(f, loadedDocs[k]);
}

console.log('Migration completed successfully!');
console.log('body_ornament total tags now:', Object.keys(loadedDocs.body_ornament.content).length);
console.log('places remaining tags:', Object.keys(places).length);
