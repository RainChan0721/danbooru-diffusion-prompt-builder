const fs = require('fs');
const yaml = require('js-yaml');

const filePath = 'data/tags/human/body_ornament.yaml';
const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));

const translations = {
  'spike piercing': '尖刺穿孔',
  'piercing hole': '穿孔痕迹',
  'safety pin piercing': '别针穿孔',
  'side labret piercing': '侧唇钉',
  'eye piercing': '眼部穿孔',
  'forehead piercing': '前额穿刺',
  'chain bracelet': '链式手镯',
  'silver bracelet': '银手镯',
  'leaf bracelet': '叶形手链',
  'metal bracelet': '金属手镯',
  'single bracelet': '单手镯',
  'jade bracelet': '玉镯',
  'gold anklet': '金脚链',
  'frilled anklet': '荷叶边脚链',
  'fur anklet': '毛皮脚环',
  'unworn bracelet': '取下的手镯',
  'black bandages': '黑色绷带',
  'bandaged torso': '躯干绷带',
  'red bandage': '红色绷带',
  'loose bandages': '松弛绷带',
  'bandage on neck': '颈部绷带',
  'bandaged waist': '腰部绷带',
  'bandage on cheek': '脸颊绷带',
  'eye tattoo': '眼部纹身',
  'hip tattoo': '髋部纹身',
  'red tattoo': '红色纹身',
  'head tattoo': '头部纹身',
  'midriff tattoo': '腹部纹身',
  'wrist tattoo': '手腕纹身',
  'blue tattoo': '蓝色纹身',
  'paw print tattoo': '爪印纹身',
  'character tattoo': '文字/符号纹身',
  'paw tattoo': '爪印纹身',
  'musical note tattoo': '音符纹身',
  'tattoo sleeve': '花臂纹身',
  'cheek tattoo': '脸颊纹身',
  'square tattoo': '方块纹身',
  'multiple tattoos': '多处纹身',
  'multiple anklets': '多条脚链',
  'bridge piercing': '鼻梁穿刺',
  'nose ring': '鼻环',
  'lorum piercing': '耻骨穿刺'
};

for (const [tag, name] of Object.entries(translations)) {
  if (doc.content[tag]) {
    doc.content[tag].name = name;
  }
}

fs.writeFileSync(filePath, yaml.dump(doc, { indent: 2, lineWidth: -1, noRefs: true }), 'utf8');
console.log('Translations applied to body_ornament.yaml!');
