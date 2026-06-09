const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function restoreIcedDrinks() {
  console.log('Restoring iced matcha drinks...');

  const { error: err1 } = await supabase
    .from('menu_items')
    .update({ name: 'Матча айс лате', image: '/ice_matcha_latte.png' })
    .eq('id', 'drink-1781016722628677');
  
  if (err1) console.error('Error restoring latte:', err1);
  else console.log('Restored Матча айс лате');

  const { error: err2 } = await supabase
    .from('menu_items')
    .update({ name: 'Матча айс орандж', image: '/ice_matcha_orange.png' })
    .eq('id', 'drink-1781016722737285');

  if (err2) console.error('Error restoring orange:', err2);
  else console.log('Restored Матча айс орандж');
}

restoreIcedDrinks();
