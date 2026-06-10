
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function update() {
  const { data, error } = await supabase
    .from('menu_items')
    .update({ image: '/dishes/deserts-1-new.png' })
    .eq('id', 'deserts-1');
    
  if (error) console.error(error);
  else console.log('Successfully updated image path to bypass cache.');
}

update();
