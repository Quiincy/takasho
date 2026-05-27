const fs = require('fs');
const data = JSON.parse(fs.readFileSync('figma_data_full.json', 'utf8'));

data.document.children.forEach(page => {
    console.log("PAGE:", page.name);
    if (page.children) {
        page.children.forEach(frame => {
            console.log("  FRAME:", frame.name, "id:", frame.id);
        });
    }
});
