const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgwvgdvniinvprkckhri.supabase.co',
  'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'
);

async function run() {
  const { data, error } = await supabase.from('menu_items').select('name, image').limit(15);
  if (error) console.error(error);
  console.log(data);
}
run();
