const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const suspicious = [];

function checkFile(filePath) {
  try {
    const d = yaml.load(fs.readFileSync(filePath, 'utf8'));
    if (!d || !d.content) return;
    for (const [tag, info] of Object.entries(d.content)) {
      const name = (info.name || '').toLowerCase();
      const t = tag.toLowerCase();
      
      // 1. pussy -> 猫
      if (t.includes('pussy') && (name.includes('猫') || name.includes('小猫'))) {
        suspicious.push({ tag, name: info.name, reason: 'pussy translated as 猫', file: filePath });
      }
      // 2. cock -> 公鸡
      if (t.includes('cock') && !t.includes('cocktail') && !t.includes('peacock') && !t.includes('shuttlecock') && !t.includes('cocker') && name.includes('鸡')) {
        suspicious.push({ tag, name: info.name, reason: 'cock translated as 鸡/公鸡', file: filePath });
      }
      // 3. facial -> 面部护理 / 洗脸
      if (t.includes('facial') && (name.includes('护理') || name.includes('美容') || name.includes('洗脸'))) {
        suspicious.push({ tag, name: info.name, reason: 'facial translated as 护理/美容', file: filePath });
      }
      // 4. nut -> 坚果 (in NSFW context)
      if (t.includes('nut') && !t.includes('minute') && !t.includes('donut') && !t.includes('chestnut') && !t.includes('peanut') && !t.includes('walnut') && !t.includes('coconut') && name.includes('坚果') && (filePath.includes('restricted') || filePath.includes('human'))) {
        suspicious.push({ tag, name: info.name, reason: 'nut translated as 坚果 in NSFW', file: filePath });
      }
      // 5. tit -> 山雀 / 鸟 (when meaning breasts)
      if ((t.includes('tit') || t.includes('tits')) && !t.includes('title') && !t.includes('attitude') && !t.includes('entity') && !t.includes('petite') && (name.includes('山雀') || name.includes('鸟')) && (filePath.includes('human') || filePath.includes('restricted'))) {
        suspicious.push({ tag, name: info.name, reason: 'tits translated as 鸟/山雀 in human context', file: filePath });
      }
    }
  } catch (e) {}
}

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f.endsWith('.yaml')) checkFile(full);
  });
}

walk('data/tags');
console.log('Suspicious translations found:', suspicious.length);
suspicious.forEach(s => console.log(` - [${s.file.replace(/\\/g, '/')}] ${s.tag} -> ${s.name} (${s.reason})`));
