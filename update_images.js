const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const categoriesToUpdate = ['deserts', 'soups', 'salad', 'hot_appetizer', 'pizza', 'sushi'];
  for (const catId of categoriesToUpdate) {
    const { data: items } = await supabase
      .from('menu_items')
      .select('id, name')
      .eq('category_id', catId)
      .order('sort_order');
      
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const imgPath = `/dishes/${catId}-${i}.png`;
        if (fs.existsSync(`public${imgPath}`)) {
          console.log(`Updating ${item.name} with ${imgPath}`);
          await supabase
            .from('menu_items')
            .update({ image: imgPath })
            .eq('id', item.id);
        } else {
           console.log(`Skipped ${item.name}, no image ${imgPath}`);
        }
      }
    }
  }

  // Handle drinks specially since there are 7 in DB but 2 images
  const { data: drinks } = await supabase.from('menu_items').select('id, name').eq('category_id', 'drinks');
  if (drinks) {
     for (const drink of drinks) {
         let img = '/dishes/drinks-0.png'; // Water default
         if (['кола', 'фанта', 'спрайт'].some(d => drink.name.toLowerCase().includes(d))) {
             img = '/dishes/drinks-1.png'; // Cola/soda glass
         }
         console.log(`Updating drink ${drink.name} with ${img}`);
         await supabase.from('menu_items').update({ image: img }).eq('id', drink.id);
     }
  }

  console.log('Images updated!');
}

run();
