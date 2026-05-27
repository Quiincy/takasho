const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data_full.json', 'utf8'));

function addParents(node, parent) {
    node.parent = parent;
    if (node.children) {
        node.children.forEach(c => addParents(c, node));
    }
}
addParents(data.document, null);

function getTexts(node) {
    let texts = [];
    if (node.type === 'TEXT') texts.push(node.characters.trim().replace(/\n/g, ' '));
    if (node.children) node.children.forEach(c => texts.push(...getTexts(c)));
    return texts.filter(t => t.length > 0);
}

let priceNodes = [];
function findPrices(node) {
    if (node.type === 'TEXT' && /грн/i.test(node.characters)) {
        priceNodes.push(node);
    }
    if (node.children) node.children.forEach(findPrices);
}
findPrices(data.document);

let uniqueItems = new Set();
let results = [];

priceNodes.forEach(priceNode => {
    let p = priceNode.parent;
    while(p && p.type !== 'INSTANCE' && p.type !== 'FRAME' && p.type !== 'COMPONENT') {
        p = p.parent;
    }
    if (p) {
        if (!uniqueItems.has(p.id)) {
            uniqueItems.add(p.id);
            let texts = getTexts(p);
            results.push(texts);
        }
    }
});

fs.writeFileSync('menu_items.json', JSON.stringify(results, null, 2));
console.log('Saved ' + results.length + ' menu items');
