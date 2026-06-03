const fs = require('fs');
const data = JSON.parse(fs.readFileSync('extracted_texts_full.json', 'utf8'));

// Filter only valid nodes
const validNodes = data.filter(n => n.path.startsWith('root/Document/Menu - online'));

let categoryNames = {};
// Infer category names
validNodes.forEach(node => {
  const parts = node.path.split('/');
  if (parts.length >= 6 && parts[4] !== 'list' && parts[4] !== 'Header') {
    if (parts[3] === parts[4].toLowerCase() || parts[3] === parts[4] || (parts[3]==='pizza' && parts[4]==='Pizza')) {
       categoryNames[parts[3]] = node.text.trim();
    }
  }
});

let menu = {};

validNodes.forEach(node => {
  const parts = node.path.split('/');
  if (parts[4] === 'list') {
    const categoryId = parts[3];
    
    // Ignore hidden categories from Menu Start
    const hiddenCategories = ['doner', 'beer appetizer', 'na drinks'];
    if (hiddenCategories.includes(categoryId.toLowerCase())) return;

    const itemId = parts[5];
    
    if (!menu[categoryId]) menu[categoryId] = { name: categoryNames[categoryId] || categoryId, items: {} };
    if (!menu[categoryId].items[itemId]) menu[categoryId].items[itemId] = [];
    
    menu[categoryId].items[itemId].push(node);
  }
});

let parsedMenu = [];

for (const [catId, cat] of Object.entries(menu)) {
  let category = {
    id: catId.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: cat.name,
    items: []
  };
  
  for (const [itemId, nodes] of Object.entries(cat.items)) {
    // Sort nodes vertically, then horizontally
    nodes.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 15) return a.x - b.x;
      return a.y - b.y;
    });

    // Find all price nodes to establish dish boundaries
    // A price node is one whose path contains '/price/' and whose text is a number
    let priceNodes = nodes.filter(n => n.path.includes('/price/') && /^\d+$/.test(n.text.trim()));
    // Sort them top-to-bottom
    priceNodes.sort((a, b) => a.y - b.y);

    if (priceNodes.length === 0) continue;

    // We will group nodes by the closest price node's Y coordinate above them (or very close)
    let dishesMap = new Map();
    priceNodes.forEach(pn => dishesMap.set(pn, []));

    nodes.forEach(n => {
       // Find the right price node bucket for this text node
       // It belongs to the price node that is closest to it vertically AND priceNode.y <= n.y + 15
       let bestBucket = null;
       let bestDiff = Infinity;
       for (const pn of priceNodes) {
           const diff = n.y - pn.y;
           if (diff > -15 && diff < bestDiff) {
               bestDiff = diff;
               bestBucket = pn;
           }
       }
       if (bestBucket) {
           dishesMap.get(bestBucket).push(n);
       }
    });

    // Process each bucket as a separate dish
    for (const [pn, bucketNodes] of dishesMap.entries()) {
        let item = { name: '', description: '', price: parseInt(pn.text.trim()), weight: '' };
        
        const ignoreList = ['нове!', 'акція!', 'грн', 'text', '!', 'hit', pn.text.trim().toLowerCase()];
        
        bucketNodes.forEach(n => {
            if (n === pn) return; // skip the price node itself
            
            const text = n.text.trim();
            const lower = text.toLowerCase();
            if (!text || ignoreList.includes(lower)) return;
            
            if (/^\d+\s*(г|мл|шт|л)\.?$/i.test(text)) {
                item.weight = text;
            } else if (text !== 'грн') {
                if (!item.name) {
                    item.name = text;
                } else {
                    if (item.description) item.description += ' ';
                    item.description += text;
                }
            }
        });

        // Clean up formatting issues like " Royal Рол "
        if (item.name) {
            item.name = item.name.replace(/^! \//, '').trim();
            if (item.name.startsWith('!/')) item.name = item.name.substring(2).trim();
            if (item.name.startsWith('! /')) item.name = item.name.substring(3).trim();
            
            category.items.push(item);
        }
    }
  }
  
  parsedMenu.push(category);
}

fs.writeFileSync('takasho_menu.json', JSON.stringify(parsedMenu, null, 2));
console.log(`Saved ${parsedMenu.length} categories.`);
