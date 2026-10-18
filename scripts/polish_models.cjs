const fs = require('fs');
const yaml = require('js-yaml');

const filePath = 'data/tags/image-composition/general-elements.yaml';
const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));

const modelDictionary = {
  'h&k psg1': 'PSG-1狙击步枪',
  'h&k g36': 'G36突击步枪',
  'ak-74': 'AK-74突击步枪',
  'ppsh-41': 'PPSh-41冲锋枪',
  'h&k g3': 'G3自动步枪',
  'aks-74u': 'AKS-74U短突击步枪',
  'h&k mp5k': 'MP5K冲锋枪',
  'qbz-95': '95式自动步枪',
  'bt-42': 'BT-42突击炮',
  'ak-74m': 'AK-74M突击步枪',
  'ipod nano': 'iPod nano播放器',
  'kv-2': 'KV-2重型坦克',
  'm203': 'M203榴弹发射器',
  'm16a2': 'M16A2突击步枪',
  'ntw-20': 'NTW-20反器材狙击步枪',
  'fn fnc': 'FN FNC自动步枪',
  'aa-12': 'AA-12自动霰弹枪',
  't-34-85': 'T-34-85中型坦克',
  'rpk-16': 'RPK-16轻机枪',
  '9a-91': '9A-91微型突击步枪',
  'ak-15': 'AK-15突击步枪',
  'h&k g36c': 'G36C紧凑型步枪',
  'fn f2000': 'FN F2000突击步枪',
  'ptrd-41': 'PTRD-41反坦克步枪',
  'm16a4': 'M16A4突击步枪',
  'vsk-94': 'VSK-94微声狙击步枪',
  'kel-tec rfb': 'RFB无托半自动步枪',
  'aks-74': 'AKS-74突击步枪',
  'sv-98': 'SV-98狙击步枪',
  'h&k g41': 'G41突击步枪',
  'qbz-97': '97式自动步枪',
  'at4': 'AT4反坦克火箭筒',
  'ar-10': 'AR-10自动步枪',
  'ar-57': 'AR-57冲锋枪',
  'c4': 'C4塑胶炸药',
  'sr-3mp': 'SR-3MP紧凑型突击步枪',
  'fg42': 'FG42伞兵步枪',
  'qbu-88': '88式狙击步枪',
  'ak 5': 'Ak 5突击步枪',
  't-72': 'T-72主战坦克',
  'p416': 'P416突击步枪',
  'cbj-ms': 'CBJ-MS单兵防卫武器',
  'h&k hk417': 'HK417自动步枪',
  'kv-1': 'KV-1重型坦克',
  't-90': 'T-90主战坦克',
  'h&k xm8': 'XM8突击步枪',
  'm240': 'M240通用机枪',
  'sr-25': 'SR-25狙击步枪',
  'ptrs-41': 'PTRS-41反坦克步枪',
  'h&k sl8': 'SL8半自动运动步枪',
  'lr-300': 'LR-300突击步枪',
  't-55': 'T-55主战坦克',
  'aek-971': 'AEK-971突击步枪',
  'kac-pdw': 'KAC PDW单兵防卫武器',
  'mac-10/11': 'MAC-10/11冲锋枪',
  'h&k p30': 'P30手枪',
  'cs/ls06': 'CS/LS06滚筒冲锋枪',
  'em-2': 'EM-2突击步枪',
  'b&t mp9': 'MP9微型冲锋枪',
  'dp-27': 'DP-27大盘机枪',
  'dsr-50': 'DSR-50反器材狙击步枪',
  'h&k hk33': 'HK33自动步枪',
  '^v^': '开心颜文字(^v^)',
  '^3^': '亲亲颜文字(^3^)',
  '0w0': '猫眼颜文字(0w0)',
  'x<': '闭眼颜文字(x<)',
  'c4': 'C4炸药'
};

for (const [tag, name] of Object.entries(modelDictionary)) {
  if (doc.content[tag]) {
    doc.content[tag].name = name;
  }
}

fs.writeFileSync(filePath, yaml.dump(doc, { indent: 2, lineWidth: -1, noRefs: true }), 'utf8');

// Also update xbox in props
const propsPath = 'data/tags/items/props.yaml';
const propsDoc = yaml.load(fs.readFileSync(propsPath, 'utf8'));
if (propsDoc.content['xbox 360']) {
  propsDoc.content['xbox 360'].name = 'Xbox 360游戏主机';
  fs.writeFileSync(propsPath, yaml.dump(propsDoc, { indent: 2, lineWidth: -1, noRefs: true }), 'utf8');
}

console.log('Model dictionary and symbols translated!');
