const fs = require('fs');

const texts = JSON.parse(fs.readFileSync('extracted_texts_full.json', 'utf8'));
const validTexts = texts.filter(t => t.text.trim().length > 0 && typeof t.y === 'number');

validTexts.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 15) return a.x - b.x;
    return a.y - b.y;
});

let lines = [];
let currentLine = [];
let lastY = validTexts[0].y;

for (let t of validTexts) {
    if (Math.abs(t.y - lastY) > 15) {
        if (currentLine.length > 0) {
            lines.push(currentLine.map(x => x.text.trim().replace(/\n/g, ' ')).join(' | '));
        }
        currentLine = [];
        lastY = t.y;
    }
    currentLine.push(t);
}
if (currentLine.length > 0) {
    lines.push(currentLine.map(x => x.text.trim().replace(/\n/g, ' ')).join(' | '));
}

fs.writeFileSync('menu_lines.txt', lines.join('\n'));
console.log('Done, wrote ' + lines.length + ' lines');
