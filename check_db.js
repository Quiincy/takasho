const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgwvgdvniinvprkckhri.supabase.co',
  'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'
);

async function test() {
  const { data: cats, error: err1 } = await supabase.from('menu_categories').select('*');
  const { data: items, error: err2 } = await supabase.from('menu_items').select('*');
  
  console.log('Categories:', cats?.length || 0, 'Error:', err1);
  console.log('Items:', items?.length || 0, 'Error:', err2);
}

test();
