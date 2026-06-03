const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixNames() {
  const { data: items } = await supabase.from('menu_items').select('*').ilike('name', 'Сет № %');
  
  for (const item of items) {
     const newName = item.name.replace('Сет № ', 'Сет №');
     await supabase.from('menu_items').update({ name: newName }).eq('id', item.id);
     console.log(`Renamed "${item.name}" to "${newName}"`);
  }
  
  console.log('Fixed set names!');
}

fixNames();
