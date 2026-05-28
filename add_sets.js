const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fgwvgdvniinvprkckhri.supabase.co',
  'sb_publishable_LBB3RuPR6BAG2-NkcRIzmA_9GJXbvJx'
);

const sets = [
  {
    id: 'sushi-set-3',
    category_id: 'sushi',
    name: 'Сет №3',
    description: 'Золотий дракон, Філадельфія лосось, Каліфорнія креветка + подарунок вино 1.0 (Кількість суші – 24 шт)',
    price: 1000,
    weight: '1500 г',
    image: '/sushi_set2.png',
    is_available: true,
  },
  {
    id: 'sushi-set-4',
    category_id: 'sushi',
    name: 'Сет №4',
    description: 'Запечений рол креветка, Каліфорнія вугор, Філадельфія лосось + подарунок вино 1.0 (Кількість суші – 24 шт)',
    price: 1000,
    weight: '1500 г',
    image: '/sushi_set2.png',
    is_available: true,
  },
  {
    id: 'sushi-set-5',
    category_id: 'sushi',
    name: 'Сет №5',
    description: 'Красний дракон, Каліфорнія тунець, Гарячий рол лосось + подарунок вино 1.0 (Кількість суші – 24 шт)',
    price: 1000,
    weight: '1500 г',
    image: '/sushi_set2.png',
    is_available: true,
  },
  {
    id: 'sushi-set-6',
    category_id: 'sushi',
    name: 'Сет №6',
    description: 'Філадельфія лосось, Каліфорнія лосось, Київ рол лосось з пармезаном, Нігірі лосось + подарунок вино 1.0 (Кількість суші – 27 шт)',
    price: 1100,
    weight: '1700 г',
    image: '/sushi_set2.png',
    is_available: true,
  },
  {
    id: 'sushi-set-7',
    category_id: 'sushi',
    name: 'Сет №7',
    description: 'Якудза рол, Роял рол з печеним лососем, Макі тунець, Макі лосось + подарунок вино 1.0 (Кількість суші – 32 шт)',
    price: 1000,
    weight: '1500 г',
    image: '/sushi_set2.png',
    is_available: true,
  }
];

async function addSets() {
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(sets, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Successfully updated sets with image:', data.length);
  }
}

addSets();
