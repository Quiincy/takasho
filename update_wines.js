require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateWines() {
  const { data: wines, error: fetchError } = await supabase
    .from('menu_items')
    .select('*')
    .ilike('name', '%вино%');
    
  if (fetchError) {
    console.error("Fetch error:", fetchError);
    return;
  }
  
  console.log("Found wines:", wines);
  
  for (const wine of wines) {
    let newPrice = null;
    if (wine.name.includes('0.5')) {
      newPrice = 70;
    } else if (wine.name.includes('1.0') || wine.name.includes('1 л')) {
      newPrice = 100;
    }
    
    if (newPrice) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ price: newPrice })
        .eq('id', wine.id);
      if (updateError) console.error("Update error:", updateError);
      else console.log(`Updated ${wine.name} to ${newPrice} грн`);
    }
  }
}

updateWines();
