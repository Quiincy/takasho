const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanNames() {
  const { data: drinks, error } = await supabase
    .from('menu_items')
    .select('id, name')
    .eq('category_id', 'drinks');

  if (error) {
    console.error(error);
    return;
  }

  for (const drink of drinks) {
    let newName = drink.name
      .replace(/\s*0\.[3458][35]?\s*/g, ' ')
      .replace(/\s*1\.0\s*/g, ' ')
      .replace(/\s*1,0\s*/g, ' ')
      .replace(/\s*0,[3458][35]?\s*/g, ' ')
      .replace(/\s*1\s*л/gi, ' ')
      .replace(/\s*0\.5\s*л/gi, ' ')
      .replace(/\s*ж\/б\s*/gi, ' ')
      .trim();
      
    // remove multiple spaces
    newName = newName.replace(/\s{2,}/g, ' ');

    if (newName !== drink.name) {
      console.log(`Will rename: "${drink.name}" -> "${newName}"`);
      await supabase.from('menu_items').update({ name: newName }).eq('id', drink.id);
    }
  }
  console.log('Done!');
}

cleanNames();
