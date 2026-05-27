const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgwvgdvniinvprkckhri.supabase.co',
  'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'
);

async function check() {
  const { data: cats } = await supabase.from('menu_categories').select('*');
  console.log('Categories in DB:');
  cats.forEach(c => console.log(`- ${c.name} (${c.id})`));

  const { data: items } = await supabase.from('menu_items').select('*');
  console.log('\nItems per category:');
  const catCounts = {};
  items.forEach(i => {
    catCounts[i.category_id] = (catCounts[i.category_id] || 0) + 1;
  });
  console.log(catCounts);
}
check();
