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

const menuData = [
  {
    id: 'banquet-hot',
    category: 'Гарячі страви та закуски',
    emoji: '🔥',
    items: [
      { name: 'Картопля по-селянськи', price: 120 },
      { name: 'Лаваш з сиром', price: 170 },
      { name: 'Хлібний кошик', price: 120 },
      { name: 'Соус', price: 50 },
      { name: 'Деруни з грибами', price: 180 },
      { name: 'Деруни з сметаною', price: 150 },
      { name: 'Деруни по-шотландськи', price: 250 },
      { name: 'Крила Баффало', price: 200 },
      { name: 'Ребра BBQ', price: 220 },
      { name: 'Стейки з свинини', price: 220 },
      { name: 'Татакі з Тунця та Лосося', price: 250 },
      { name: 'Шашличок на шпажці з свинини', price: 220 },
      { name: 'Шашличок на шпажці з курячий', price: 170 },
      { name: 'Люля кебаб з баранини', price: 180 },
      { name: 'Курка з соусом чеддер та шпінатом', price: 260 },
      { name: 'М\'ясна пательня ( м\'ясо з овочами )', price: 280 },
      { name: 'Млинці з мясом', price: 170 },
      { name: 'Овочі гриль', price: 250 },
      { name: 'Шампіньйони з беконом', price: 150 },
      { name: 'Шпінат тушкований', price: 150 },
    ]
  },
  {
    id: 'banquet-cold',
    category: 'Холодні закуски',
    emoji: '🧀',
    items: [
      { name: 'Фермерське сало', price: 220 },
      { name: 'Бастурма вірменська', price: 150 },
      { name: 'Ковбаска по-домашньому', price: 200 },
      { name: 'Плато європейських сирів', price: 450 },
      { name: 'Буженина', price: 200 },
      { name: 'Фруктове плато', price: 350 },
      { name: 'Мясна нарізка', price: 550 },
      { name: 'Філе оселедця', price: 250 },
      { name: 'Свіжі овочі', price: 300 },
      { name: 'Тарталетка з жульєном', price: 70 },
      { name: 'Брускетта з лососем', price: 80 },
      { name: 'Брускетта з сирним асорті', price: 80 },
      { name: 'Брускетта з креветкою', price: 80 },
      { name: 'Брускетта з тунцем', price: 80 },
      { name: 'Брускетта з червоною ікрою', price: 80 },
      { name: 'Брускетта з тушкованою свининою', price: 80 },
    ]
  },
  {
    id: 'banquet-salads',
    category: 'Салати',
    emoji: '🥗',
    items: [
      { name: 'Салат Чука з горіховим соусом', price: 150 },
      { name: 'Салат з креветкою смаженою', price: 370 },
      { name: 'Цезар з куркою', price: 320 },
      { name: 'Салат з лососем гравлакс', price: 350 },
      { name: 'Атлантік з тунцем', price: 330 },
      { name: 'Грецький', price: 250 },
    ]
  },
  {
    id: 'banquet-snacks',
    category: 'Закуски',
    emoji: '🍟',
    items: [
      { name: 'Грінки з сиром', price: 150 },
      { name: 'Грибочки мариновані', price: 200 },
      { name: 'Соління від бабусі', price: 350 },
      { name: 'Рол Філадельфія', price: 350 },
      { name: 'Рол Каліфорнія', price: 350 },
      { name: 'Сирні палички', price: 180 },
      { name: 'Креветки темпура', price: 200 },
      { name: 'Нагетси', price: 170 },
      { name: 'Цибулеві кільця', price: 150 },
      { name: 'Кільця кальмарів', price: 160 },
      { name: 'Мідії хіяші', price: 190 },
      { name: 'Фрі', price: 120 },
      { name: 'Картопля по-селянськи', price: 120 },
    ]
  }
];

async function seed() {
  console.log('Inserting categories...');
  for (let i = 0; i < menuData.length; i++) {
    const section = menuData[i];
    const { error } = await supabase.from('menu_categories').upsert({
      id: section.id,
      name: section.category,
      emoji: section.emoji,
      sort_order: 900 + i
    });
    if (error) console.error('Error inserting category', section.id, error);
    else console.log('Inserted category', section.id);

    console.log(`Inserting items for ${section.category}...`);
    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      const { error: itemErr } = await supabase.from('menu_items').upsert({
        id: `${section.id}-item-${j}`,
        category_id: section.id,
        name: item.name,
        price: item.price,
        description: null,
        weight: '',
        image: '/pizza.png',
        is_available: true,
        sort_order: j
      });
      if (itemErr) console.error('Error inserting item', item.name, itemErr);
    }
  }
  console.log('Done!');
}

seed();
