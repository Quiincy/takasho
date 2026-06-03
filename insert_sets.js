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

const sets = [
  {
    id: 'sushi-set-3',
    category_id: 'sushi',
    name: 'Сет № 3',
    description: 'Золотий дракон, Філадельфія лосось, Каліфорнія креветка + подарунок вино 1.0. Кількість суші: 24 шт.',
    price: 1000,
    weight: '1500 г',
    sort_order: 300,
    is_available: true,
    image: '/pizza.png'
  },
  {
    id: 'sushi-set-4',
    category_id: 'sushi',
    name: 'Сет № 4',
    description: 'Запечений рол креветка, Каліфорнія вугор, Філадельфія лосось + подарунок вино 1.0. Кількість суші: 24 шт.',
    price: 1000,
    weight: '1500 г',
    sort_order: 310,
    is_available: true,
    image: '/pizza.png'
  },
  {
    id: 'sushi-set-5',
    category_id: 'sushi',
    name: 'Сет № 5',
    description: 'Красний дракон, Каліфорнія тунець, Гарячий рол лосось + подарунок вино 1.0. Кількість суші: 24 шт.',
    price: 1000,
    weight: '1500 г',
    sort_order: 320,
    is_available: true,
    image: '/pizza.png'
  },
  {
    id: 'sushi-set-6',
    category_id: 'sushi',
    name: 'Сет № 6',
    description: 'Філадельфія лосось, Каліфорнія лосось, Київ рол лосось з пармезаном, Нігірі лосось + подарунок вино 1.0. Кількість суші: 27 шт.',
    price: 1100,
    weight: '1700 г',
    sort_order: 330,
    is_available: true,
    image: '/pizza.png'
  },
  {
    id: 'sushi-set-7',
    category_id: 'sushi',
    name: 'Сет № 7',
    description: 'Якудза рол, Роял рол з печеним лососем, Макі тунець, Макі лосось + подарунок вино 1.0. Кількість суші: 32 шт.',
    price: 1000,
    weight: '1500 г',
    sort_order: 340,
    is_available: true,
    image: '/pizza.png'
  }
];

async function insert() {
  for (const set of sets) {
      // Delete old if exists
      await supabase.from('menu_items').delete().eq('id', set.id);
  }
  
  const { data, error } = await supabase.from('menu_items').insert(sets);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully inserted all 5 sets!');
  }
}

insert();
