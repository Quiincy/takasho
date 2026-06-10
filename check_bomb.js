
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name, image')
    .ilike('name', '%бомба%');
    
  if (error) console.error(error);
  console.dir(data, { depth: null });
}

check();
