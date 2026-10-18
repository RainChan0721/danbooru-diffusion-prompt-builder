const fs = require('fs');
const yaml = require('js-yaml');

function loadYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function saveYaml(filePath, data) {
  fs.writeFileSync(filePath, yaml.dump(data, { indent: 2, lineWidth: -1, noRefs: true }), 'utf8');
}

const actionsDoc = loadYaml('data/tags/human/actions.yaml');
const actions = actionsDoc.content || {};

const propsDoc = loadYaml('data/tags/items/props.yaml');
const compDoc = loadYaml('data/tags/image-composition/composition.yaml');
const headDoc = loadYaml('data/tags/human/head_ornament.yaml');
const traitsDoc = loadYaml('data/tags/human/traits.yaml');
const weaponsDoc = loadYaml('data/tags/items/weapons.yaml');
const vehiclesDoc = loadYaml('data/tags/items/vehicles.yaml');
const artisticDoc = loadYaml('data/tags/artistic-license.yaml');

// 1. Move non-action tags
const moves = [
  ['playstation 4', artisticDoc],
  ['playstation 5', artisticDoc],
  ['playstation 2', artisticDoc],
  ['kill la kill final episode scissor blade relay (meme)', artisticDoc],
  ['self cosplay', artisticDoc],
  ['luminosite eternelle', artisticDoc],
  ['walker (robot)', vehiclesDoc],
  ['cleaning rag', propsDoc],
  ['full composition', compDoc],
  ['juxtaposition', compDoc],
  ['pointed crown', headDoc],
  ['huge eyebrows', traitsDoc],
  ['huge pectorals', traitsDoc],
  ['splat dualies (splatoon)', weaponsDoc],
  ['dapple dualies (splatoon)', weaponsDoc]
];

for (const [tag, targetDoc] of moves) {
  if (actions[tag]) {
    targetDoc.content[tag] = actions[tag];
    delete actions[tag];
  }
}

// 2. Translations for genuine actions
const translations = {
  'frieren blowing a kiss': '芙莉莲飞吻',
  'kissing head': '亲吻头部',
  'rejected kiss': '拒绝接吻',
  'forced hug': '强行拥抱',
  'surprise hug': '突袭拥抱',
  'kiss from behind': '从背后亲吻',
  'hug invitation': '拥抱邀请',
  'dolls kissing': '玩偶接吻',
  'hugging object': '抱着物品',
  'reaching towards viewer': '向观众伸手',
  'nervous sweating': '紧张流汗',
  'holding own hair': '手抓自己的头发',
  'holding removed eyewear': '手持摘下的眼镜',
  'sitting on throne': '坐在王座上',
  'rabbit pose': '兔耳动作/手势',
  'hugging doll': '抱着洋娃娃',
  'holding popsicle': '拿着冰棍',
  'elbow carry': '用肘夹带',
  'holding cotton candy': '拿着棉花糖',
  'bowlegged pose': '罗圈腿/内八姿势',
  'holding behind back': '手持藏于背后',
  'holding detached head': '手捧断头',
  'holding crepe': '拿着可丽饼',
  'looking through own legs': '从自己胯下看',
  'hugging tail': '抱着尾巴',
  'holding watermelon': '拿着西瓜',
  'holding burger': '拿着汉堡',
  'holding with feet': '用脚抓取',
  'playing guitar': '弹吉他',
  'hugging book': '抱紧书本',
  'holding ice cream cone': '拿着蛋筒冰淇淋',
  'holding flute': '吹/持长笛',
  'holding crowbar': '手持撬棍',
  'holding mahjong tile': '手持麻将牌',
  'reaching towards another': '向他人伸手',
  'holding pregnancy test': '手持验孕棒',
  'pose imitation': '模仿姿势',
  'holding milk carton': '拿着牛奶盒',
  'holding barcode scanner': '手持条形码扫描枪',
  'holding own leg': '手抱自己的腿',
  'pointing melee weapon': '近战武器指向',
  'holding bass guitar': '手持贝斯'
};

for (const [tag, name] of Object.entries(translations)) {
  if (actions[tag]) {
    actions[tag].name = name;
  }
}

// Save all updated documents
saveYaml('data/tags/human/actions.yaml', actionsDoc);
saveYaml('data/tags/items/props.yaml', propsDoc);
saveYaml('data/tags/image-composition/composition.yaml', compDoc);
saveYaml('data/tags/human/head_ornament.yaml', headDoc);
saveYaml('data/tags/human/traits.yaml', traitsDoc);
saveYaml('data/tags/items/weapons.yaml', weaponsDoc);
saveYaml('data/tags/items/vehicles.yaml', vehiclesDoc);
saveYaml('data/tags/artistic-license.yaml', artisticDoc);

console.log('Cleaned actions and applied translations successfully!');
