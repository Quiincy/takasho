const fs = require('fs');

const data = JSON.parse(fs.readFileSync('figma_data_full.json', 'utf8'));

const categories = {
  '1:64': 'pizza',
  '7:278': 'sushi',
  '7:385': 'burgers',
  '7:436': 'shawarma',
  '7:859': 'soups',
  '7:487': 'hot_appetizer',
  '7:538': 'crisps',
  '7:594': 'beer_app',
  '7:645': 'salad',
  '7:702': 'drinks',
  '7:753': 'na_drinks',
  '7:804': 'deserts'
};

const categoryNames = {
  'pizza': 'Піца',
  'sushi': 'Суші',
  'burgers': 'Бургери',
  'shawarma': 'Шаурма',
  'soups': 'Перші страви',
  'hot_appetizer': 'Гарячі закуски',
  'crisps': 'Хрустке і швидке',
  'beer_app': 'Закуски до пива',
  'salad': 'Салати',
  'drinks': 'Алкогольні напої',
  'na_drinks': 'Б/А напої',
  'deserts': 'Десерти'
};

function extractNodes(rootId) {
    let target = null;
    function findNode(node) {
        if (node.id === rootId) target = node;
        if (!target && node.children) node.children.forEach(findNode);
    }
    findNode(data.document);
    return target;
}

function getTextsWithPositions(node) {
    let list = [];
    function walk(n) {
        if (n.type === 'TEXT') {
            list.push({
                text: n.characters.trim().replace(/\n/g, ' '),
                x: n.absoluteBoundingBox?.x || 0,
                y: n.absoluteBoundingBox?.y || 0,
                fontSize: n.style?.fontSize || 0,
                fontWeight: n.style?.fontWeight || 400
            });
        }
        if (n.children) n.children.forEach(walk);
    }
    walk(node);
    return list.filter(t => t.text.length > 0);
}

let allItems = [];

for (const [id, catId] of Object.entries(categories)) {
    let frame = extractNodes(id);
    if (!frame) continue;
    
    let texts = getTextsWithPositions(frame);
    
    // Group by Y
    texts.sort((a, b) => a.y - b.y);
    
    let rows = [];
    let currentRow = [];
    let lastY = texts[0]?.y;
    for (let t of texts) {
        if (Math.abs(t.y - lastY) > 15) {
            if (currentRow.length > 0) {
                currentRow.sort((a, b) => a.x - b.x);
                rows.push(currentRow);
            }
            currentRow = [];
            lastY = t.y;
        }
        currentRow.push(t);
    }
    if (currentRow.length > 0) {
        currentRow.sort((a, b) => a.x - b.x);
        rows.push(currentRow);
    }

    let currentItemRows = [];
    for (let r of rows) {
        currentItemRows.push(r);
        let rowText = r.map(x => x.text).join(' ');
        if (rowText.includes('грн') || rowText.match(/\d+\s*грн/i)) {
            let title = "";
            let price = 0;
            let weight = "";
            let desc = "";
            
            let allItemTexts = currentItemRows.flat();
            
            let priceNode = allItemTexts.find(t => t.text.match(/^\d+$/) && allItemTexts.some(tt => tt.text.includes('грн')));
            if (!priceNode) {
               let combined = allItemTexts.find(t => t.text.match(/\d+\s*грн/i));
               if (combined) {
                   let m = combined.text.match(/(\d+)\s*грн/i);
                   if (m) price = parseInt(m[1]);
               }
            } else {
               price = parseInt(priceNode.text);
            }
            
            let possibleTitles = currentItemRows[0].filter(t => t.text !== 'Нове!' && t.text !== 'Акція!');
            title = possibleTitles[0]?.text || currentItemRows[0][0].text;
            
            let descNodes = allItemTexts.filter(t => 
                t.text !== title && 
                !t.text.includes('грн') && 
                t.text !== price.toString() &&
                t.text !== 'Нове!' && t.text !== 'Акція!' &&
                t.text !== 'Тицяй, щоб повернутись до переліку розділів' &&
                t.text !== 'Скануй щоб подивитись'
            );
            
            let weightNode = descNodes.find(t => t.text.match(/^(\d+(?:\.\d+)?)\s*(г|мл|л|шт)$/i));
            if (weightNode) {
                weight = weightNode.text;
                descNodes = descNodes.filter(t => t !== weightNode);
            } else {
                // sometimes weight is like "500 г"
                weightNode = descNodes.find(t => t.text.toLowerCase().includes(' г') || t.text.toLowerCase().includes(' мл'));
                if (weightNode && weightNode.text.length < 10) {
                    weight = weightNode.text;
                    descNodes = descNodes.filter(t => t !== weightNode);
                }
            }
            
            desc = descNodes.map(t => t.text).join(' ');
            
            if (price > 0 && title && title !== "грн") {
                allItems.push({
                    categoryId: catId,
                    title: title.replace(/'/g, "''").replace(/\n/g, " "),
                    desc: desc.replace(/'/g, "''").replace(/\n/g, " "),
                    price: price,
                    weight: weight || '',
                });
            }
            
            currentItemRows = [];
        }
    }
}

let sql = `-- =========================================================
-- АВТОМАТИЧНО ЗГЕНЕРОВАНЕ МЕНЮ З FIGMA
-- =========================================================

INSERT INTO menu_categories (id, name, emoji, sort_order) VALUES
`;
let catSql = [];
let idx = 10;
for (const [id, name] of Object.entries(categoryNames)) {
    catSql.push(`  ('${id}', '${name}', '🍽️', ${idx})`);
    idx += 10;
}
sql += catSql.join(',\n') + '\nON CONFLICT (id) DO NOTHING;\n\n';

sql += `INSERT INTO menu_items (id, category_id, name, description, price, weight, is_available) VALUES\n`;

let itemSql = [];
allItems.forEach((item, index) => {
    let safeId = `${item.categoryId}-${index + 1}`;
    itemSql.push(`  ('${safeId}', '${item.categoryId}', '${item.title}', '${item.desc}', ${item.price}, '${item.weight}', true)`);
});

sql += itemSql.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET price = EXCLUDED.price, description = EXCLUDED.description, name = EXCLUDED.name, weight = EXCLUDED.weight, category_id = EXCLUDED.category_id;\n';

fs.writeFileSync('menu_generated.sql', sql);
console.log('Done, generated ' + allItems.length + ' items');
