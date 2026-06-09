
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  const { data: items, error: err1 } = await supabase
    .from('menu_items')
    .select('id, name, subcategory_ids')
    .ilike('name', '%матча%');
    
  if (err1) {
    console.error(err1);
    return;
  }

  const coffeeId = '4f0e81ff-4ece-46cd-9d92-f6472c6a0222';

  for (const item of items) {
    if (item.subcategory_ids && item.subcategory_ids.includes(coffeeId)) {
      const newIds = item.subcategory_ids.filter(id => id !== coffeeId);
      console.log(`Fixing ${item.name}...`);
      
      const { error: err2 } = await supabase
        .from('menu_items')
        .update({ subcategory_ids: newIds })
        .eq('id', item.id);
        
      if (err2) {
        console.error(`Failed to update ${item.name}:`, err2);
      } else {
        console.log(`Successfully removed coffee from ${item.name}`);
      }
    }
  }
}

fix();
