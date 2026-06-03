const fs = require('fs');
const data = JSON.parse(fs.readFileSync('extracted_texts_full.json', 'utf8'));

const caliNodes = data.filter(n => n.path.startsWith('root/Document/Menu - online/doner/list'));
caliNodes.sort((a,b) => a.y - b.y);

caliNodes.forEach(n => {
    console.log(`y: ${Math.round(n.y)}, x: ${Math.round(n.x)}, text: ${n.text}`);
});
