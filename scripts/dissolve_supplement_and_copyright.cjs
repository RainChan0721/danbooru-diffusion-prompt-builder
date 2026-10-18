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

// -------------------------------------------------------------
// PART 1: Delete "作品" (Copyright) category
// -------------------------------------------------------------
console.log('--- Part 1: Removing Copyright (作品) category ---');
const copyrightDir = 'data/tags/copyright';
if (fs.existsSync(copyrightDir)) {
  fs.rmSync(copyrightDir, { recursive: true, force: true });
  console.log('Deleted data/tags/copyright directory');
}

// -------------------------------------------------------------
// PART 2: Clean and resolve interactions.yaml
// -------------------------------------------------------------
console.log('--- Part 2: Resolving interactions.yaml ---');
const interactionsPath = 'data/tags/human/interactions.yaml';
const actionsDoc = loadYaml('data/tags/human/actions.yaml');
actionsDoc.name = '动作与互动';

if (fs.existsSync(interactionsPath)) {
  const interDoc = loadYaml(interactionsPath);
  const interTags = interDoc.content || {};
  
  const propsDoc = loadYaml('data/tags/items/props.yaml');
  const faceDoc = loadYaml('data/tags/human/face.yaml');
  const traitsDoc = loadYaml('data/tags/human/traits.yaml');
  const artisticDoc = loadYaml('data/tags/artistic-license.yaml');

  for (const [tag, info] of Object.entries(interTags)) {
    const t = tag.toLowerCase();
    if (t === 'heterochromatic eyewear' || t === 'humpty lock (shugo chara!)' || t === 'yaoi (object)' || t === 'yuri (object)') {
      propsDoc.content[tag] = info;
    } else if (t === 'no heterochromia' || t === 'yurie mouth') {
      faceDoc.content[tag] = info;
    } else if (t === 'huge claws') {
      traitsDoc.content[tag] = info;
    } else if (t === 'japan-korea yuri (meme)' || t === 'killkiss (bang dream!)' || t === 'happy shijo shugi!') {
      artisticDoc.content[tag] = info;
    } else {
      // True interaction tags: hetero, forced hug, surprise hug, miko embrace, kissing head, rejected kiss, kiss from behind, hug invitation, dolls kissing, frieren blowing a kiss
      actionsDoc.content[tag] = info;
    }
  }

  saveYaml('data/tags/items/props.yaml', propsDoc);
  saveYaml('data/tags/human/face.yaml', faceDoc);
  saveYaml('data/tags/human/traits.yaml', traitsDoc);
  saveYaml('data/tags/artistic-license.yaml', artisticDoc);
  saveYaml('data/tags/human/actions.yaml', actionsDoc);

  fs.unlinkSync(interactionsPath);
  console.log('Interactions migrated and interactions.yaml deleted!');
}

// -------------------------------------------------------------
// PART 3: Disassemble action-supplement.yaml into proper files
// -------------------------------------------------------------
console.log('--- Part 3: Disassembling action-supplement.yaml ---');
const actionSuppPath = 'data/tags/human/posture/action-supplement.yaml';
if (fs.existsSync(actionSuppPath)) {
  const suppDoc = loadYaml(actionSuppPath);
  const suppTags = suppDoc.content || {};

  const clothingDoc = loadYaml('data/tags/human/clothing-styles.yaml');
  const headDoc = loadYaml('data/tags/human/head_ornament.yaml');
  const bodyDoc = loadYaml('data/tags/human/body_ornament.yaml');
  const propsDoc = loadYaml('data/tags/items/props.yaml');
  const creaturesDoc = loadYaml('data/tags/items/creatures.yaml');
  const artisticDoc = loadYaml('data/tags/artistic-license.yaml');
  const effectsDoc = loadYaml('data/tags/image-composition/effects.yaml');
  const r18PosDoc = loadYaml('data/tags/restricted/r18-positions.yaml');
  const traitsDoc = loadYaml('data/tags/human/traits.yaml');

  let countClothes = 0;
  let countActions = 0;
  let countProps = 0;
  let countMeta = 0;
  let countCreatures = 0;
  let countR18 = 0;
  let countHead = 0;

  for (const [tag, info] of Object.entries(suppTags)) {
    const t = tag.toLowerCase();

    // 1. Scrunchies -> head ornament
    if (t.includes('scrunchie')) {
      headDoc.content[tag] = info;
      countHead++;
    }
    // 2. Cross ornaments
    else if (t === 'cross hair ornament') {
      headDoc.content[tag] = info;
      countHead++;
    } else if (t === 'cross necklace') {
      bodyDoc.content[tag] = info;
    } else if (t === 'cross earrings') {
      headDoc.content[tag] = info;
      countHead++;
    }
    // 3. Clothes / Swimsuits / Sleeves / Costumes / Uniforms
    else if (
      t.includes('swimsuit') || t.includes('sleeves') || t.includes('bikini') ||
      t.includes('dress') || t.includes('skirt') || t.includes('uniform') ||
      t.includes('costume') || t.includes('bunny') || t.includes('clothes') ||
      t.includes('sock') || t.includes('glove') || t.includes('hat') ||
      t.includes('coat') || t.includes('jacket') || t.includes('shirt') ||
      t.includes('pants') || t.includes('swimwear') || t.includes('open fly')
    ) {
      clothingDoc.content[tag] = info;
      countClothes++;
    }
    // 4. R18 positions
    else if (t.includes('cowgirl position') || t === 'reach-around' || t === 'pet play') {
      r18PosDoc.content[tag] = info;
      countR18++;
    }
    // 5. Meta / Crossover / Gameplay / Media
    else if (
      t.includes('crossover') || t.includes('gameplay') || t.includes('cross-section') ||
      t.includes('(cosplay)') || t === 'look-alike' || t.includes('logo') ||
      t.includes('meta') || t === 'stand (jojo)'
    ) {
      artisticDoc.content[tag] = info;
      countMeta++;
    }
    // 6. Creatures & fantasy races
    else if (t === 'butterfly' || t === 'blue butterfly' || t === 'erune' || t === 'alien') {
      creaturesDoc.content[tag] = info;
      countCreatures++;
    }
    // 7. Physical props, furniture, devices, items
    else if (
      t.includes('stand') || t.includes('player') || t.includes('display') ||
      t.includes('walkie-talkie') || t.includes('chandelier') || t.includes('helmet') ||
      t.includes('card') || t.includes('swim ring') || t.includes('cross') ||
      t.includes('sweatdrops') || t.includes('microphone') || t.includes('candlestand')
    ) {
      if (t.includes('sweatdrops')) {
        effectsDoc.content[tag] = info;
      } else {
        propsDoc.content[tag] = info;
      }
      countProps++;
    }
    // 8. Body traits / expressions
    else if (t.includes('pupils') || t === 'smiley face' || t === 'false smile' || t === 'toe scrunch') {
      traitsDoc.content[tag] = info;
    }
    // 9. All remaining holding, carrying, posing, interacting -> actions.yaml
    else {
      actionsDoc.content[tag] = info;
      countActions++;
    }
  }

  saveYaml('data/tags/human/clothing-styles.yaml', clothingDoc);
  saveYaml('data/tags/human/head_ornament.yaml', headDoc);
  saveYaml('data/tags/human/body_ornament.yaml', bodyDoc);
  saveYaml('data/tags/items/props.yaml', propsDoc);
  saveYaml('data/tags/items/creatures.yaml', creaturesDoc);
  saveYaml('data/tags/artistic-license.yaml', artisticDoc);
  saveYaml('data/tags/image-composition/effects.yaml', effectsDoc);
  saveYaml('data/tags/restricted/r18-positions.yaml', r18PosDoc);
  saveYaml('data/tags/human/traits.yaml', traitsDoc);
  saveYaml('data/tags/human/actions.yaml', actionsDoc);

  console.log(`Disassembled action-supplement tags:
    - Clothes moved: ${countClothes}
    - Head ornaments (scrunchies etc): ${countHead}
    - Actions moved to actions.yaml: ${countActions}
    - Props & items moved: ${countProps}
    - Meta moved: ${countMeta}
    - Creatures moved: ${countCreatures}
    - R18 positions: ${countR18}`);

  fs.unlinkSync(actionSuppPath);
  const postureDir = 'data/tags/human/posture';
  if (fs.existsSync(postureDir)) {
    fs.rmdirSync(postureDir);
    console.log('Removed empty data/tags/human/posture directory');
  }
}

console.log('Migration script complete!');
