
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('menu_subcategories')
    .select('*')
    .in('id', ['abe23804-2a74-4892-a809-573cb0424c39', 'aaf45456-8919-4b1c-9850-4b555a00b281']);
    
  if (error) console.error(error);
  console.dir(data, { depth: null });
}

check();
