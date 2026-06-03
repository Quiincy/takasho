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

const menuData = JSON.parse(fs.readFileSync('takasho_menu.json', 'utf8'));

async function seed() {
  console.log('Deleting old menu_items...');
  const { error: delItemsErr } = await supabase.from('menu_items').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
  if (delItemsErr) { console.error('Error deleting items:', delItemsErr); return; }

  console.log('Deleting old categories...');
  const { error: delCatsErr } = await supabase.from('menu_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delCatsErr) { console.error('Error deleting categories:', delCatsErr); return; }

  console.log('Inserting new categories and items...');
  for (let i = 0; i < menuData.length; i++) {
    const cat = menuData[i];
    console.log(`Adding category: ${cat.name}`);
    
    // Insert category
    const { data: newCat, error: catErr } = await supabase.from('menu_categories').insert({
      id: cat.id,
      name: cat.name,
      sort_order: i * 10
    }).select().single();

    if (catErr) {
        console.error('Error inserting category:', catErr);
        continue;
    }

    // Prepare items
    const itemsToInsert = cat.items.map((item, index) => ({
      id: `${cat.id}-${index}`,
      category_id: cat.id,
      name: item.name,
      description: item.description || null,
      price: item.price || 0,
      weight: item.weight || '',
      sort_order: index * 10,
      is_available: true,
      image: '/pizza.png'
    }));

    if (itemsToInsert.length > 0) {
        const { error: itemErr } = await supabase.from('menu_items').insert(itemsToInsert);
        if (itemErr) {
           console.error(`Error inserting items for ${cat.name}:`, itemErr);
        } else {
           console.log(` -> Added ${itemsToInsert.length} items`);
        }
    }
  }

  console.log('Seed completed successfully!');
}

seed();
