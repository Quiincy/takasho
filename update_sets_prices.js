const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgwvgdvniinvprkckhri.supabase.co',
  'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'
);

async function updatePrices() {
  const { data: d1, error: e1 } = await supabase
    .from('menu_items')
    .update({ price: 1200 })
    .ilike('name', 'Сет №1%')
    .select();

  const { data: d2, error: e2 } = await supabase
    .from('menu_items')
    .update({ price: 1300 })
    .ilike('name', 'Сет №2%')
    .select();

  console.log('Updated Сет 1:', d1, e1);
  console.log('Updated Сет 2:', d2, e2);
}

updatePrices();
