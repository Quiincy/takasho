const fs = require('fs');

const data = JSON.parse(fs.readFileSync('figma_data_full.json', 'utf8'));

let texts = [];

function extractText(node, path) {
  if (node.visible === false) return;
  if (node.type === 'TEXT') {
    texts.push({ 
        path: path + '/' + node.name,
        text: node.characters, 
        x: Math.round(node.absoluteBoundingBox?.x || 0), 
        y: Math.round(node.absoluteBoundingBox?.y || 0) 
    });
  }
  if (node.children) {
    for (const child of node.children) {
      extractText(child, path + '/' + node.name);
    }
  }
}

extractText(data.document, 'root');

// sort texts by Y, then by X
texts.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 15) return a.x - b.x;
    return a.y - b.y;
});

fs.writeFileSync('extracted_texts_full.json', JSON.stringify(texts, null, 2));
console.log('Saved ' + texts.length + ' text nodes');
