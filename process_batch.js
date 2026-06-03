const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const env = fs.readFileSync('.env.local', 'utf8').split('\n');
env.forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) process.env[match[1]] = match[2];
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const artifactDir = '/Users/quincy/.gemini/antigravity-ide/brain/2654258c-4c20-41de-96d6-ade45d6b7cc8';
const publicDir = path.join(__dirname, 'public', 'dishes');

if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

async function processBatch() {
  const files = fs.readdirSync(artifactDir).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
  
  for (const file of files) {
    let itemId = null;
    if (file.startsWith('sauces')) itemId = 'crisps-8';
    else if (file.startsWith('mega_bomb')) itemId = 'deserts-1';
    
    if (itemId) {
       const destName = `${itemId}.png`;
       const destPath = path.join(publicDir, destName);
       const srcPath = path.join(artifactDir, file);
       
       fs.copyFileSync(srcPath, destPath);
       fs.unlinkSync(srcPath);
       
       const dbImagePath = `/dishes/${destName}`;
       await supabase.from('menu_items').update({ image: dbImagePath }).eq('id', itemId);
       console.log(`Updated ${itemId} with image ${dbImagePath}`);
    }
  }
}

processBatch();
