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

async function updateWeights() {
  const { error: err1 } = await supabase
    .from('menu_items')
    .update({ weight: '2000 г' })
    .eq('name', 'Сет №1');
    
  if (err1) console.error('Error updating Set 1:', err1);
  else console.log('Updated weight for Сет №1');

  const { error: err2 } = await supabase
    .from('menu_items')
    .update({ weight: '2000 г' })
    .eq('name', 'Сет №2');
    
  if (err2) console.error('Error updating Set 2:', err2);
  else console.log('Updated weight for Сет №2');
}

updateWeights();
