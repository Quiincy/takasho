const fs = require('fs');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const supabase = createClient(
  'https://fgwvgdvniinvprkckhri.supabase.co',
  'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'
);

const outDir = path.join(__dirname, 'public', 'dishes');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 300000 }, (res) => { // 5 min timeout per image
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Status: ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

const categoryPrompts = {
  pizza: "A delicious professional food photography of a whole pizza, top down view, high quality, dark background, cinematic lighting. Ingredients: ",
  sushi: "A delicious professional food photography of premium sushi rolls on a dark slate plate, cinematic lighting. Ingredients: ",
  burgers: "A delicious professional food photography of a gourmet juicy burger on a wooden board, cinematic lighting. Ingredients: ",
  shawarma: "A delicious professional food photography of a juicy shawarma wrap cut in half, dark background, cinematic lighting. Ingredients: ",
  soups: "A delicious professional food photography of a bowl of hot soup, top view, cinematic lighting. Ingredients: ",
  hot_appetizer: "A delicious professional food photography of a hot appetizer dish, cinematic lighting. Ingredients: ",
  crisps: "A delicious professional food photography of crispy fried snacks, cinematic lighting. Ingredients: ",
  beer_app: "A delicious professional food photography of beer snacks on a wooden board, cinematic lighting. Ingredients: ",
  salad: "A delicious professional food photography of a fresh salad in a bowl, cinematic lighting. Ingredients: ",
  drinks: "A delicious professional food photography of a refreshing drink in a glass, cinematic lighting. Ingredients: ",
  na_drinks: "A delicious professional food photography of a refreshing non-alcoholic drink with ice, cinematic lighting. Ingredients: ",
  deserts: "A delicious professional food photography of a sweet dessert on a plate, cinematic lighting. Ingredients: "
};

async function run() {
  const { data: items } = await supabase.from('menu_items').select('*');
  console.log(`Found ${items.length} items.`);
  
  let successCount = 0;
  const LIMIT = 10; // Генеруємо рівно по 10 картинок за один запуск
  
  for (const item of items) {
    if (successCount >= LIMIT) {
      console.log(`Досягнуто ліміту на цей запуск (${LIMIT} картинок).`);
      break;
    }

    const fileName = `${item.id}.jpg`;
    const dest = path.join(outDir, fileName);
    
    // Пропускаємо, якщо страва вже має унікальну згенеровану картинку
    if (fs.existsSync(dest) && item.image === `/dishes/${fileName}`) {
       continue;
    }

    const catPrompt = categoryPrompts[item.category_id] || "Professional food photography of ";
    const fullPrompt = `${catPrompt} ${item.name}. ${item.description || ''}`;
    const encodedPrompt = encodeURIComponent(fullPrompt) + '?width=800&height=800&nologo=true';
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;
    
    try {
        console.log(`[START] Generating image for ${item.name}...`);
        await downloadImage(url, dest);
        
        // update db
        const dbImagePath = `/dishes/${fileName}`;
        await supabase.from('menu_items').update({ image: dbImagePath }).eq('id', item.id);
        console.log(`[OK] Успішно згенеровано для: ${item.name}`);
        successCount++;
        
        // Пауза 2 секунди між запитами, щоб не блокували так швидко
        await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
        console.error(`[ERROR] ${item.name}: ${err.message}`);
        if (err.message.includes('402')) {
           console.log("❌ Досягнуто ліміту безкоштовних запитів сервісу (Status 402). Спробуйте запустити скрипт пізніше (завтра).");
           break;
        }
    }
  }
  
  console.log(`\n✅ Готово! Скрипт успішно згенерував ${successCount} нових картинок цього разу.`);
}

run();
