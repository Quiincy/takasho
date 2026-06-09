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
  
  for (const wine of wines) {
    let newPrice = null;
    if (wine.weight.includes('500')) {
      newPrice = 70;
    } else if (wine.weight.includes('1000') || wine.weight.includes('1 л')) {
      newPrice = 100;
    }
    
    if (newPrice) {
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({ price: newPrice })
        .eq('id', wine.id);
      if (updateError) console.error("Update error:", updateError);
      else console.log(`Updated ${wine.name} (${wine.weight}) to ${newPrice} грн`);
    }
  }
}

updateWines();
