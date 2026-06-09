
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: subcats, error: err1 } = await supabase
    .from('menu_subcategories')
    .select('*')
    .eq('category_id', 'drinks');
    
  if (err1) console.error(err1);
  console.log("Drink Subcategories:");
  console.dir(subcats, { depth: null });

  const { data: items, error: err2 } = await supabase
    .from('menu_items')
    .select('id, name, subcategory_ids')
    .ilike('name', '%матча%');
    
  if (err2) console.error(err2);
  console.log("Matcha items:");
  console.dir(items, { depth: null });
}

check();
