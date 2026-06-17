import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

// ONE-TIME seed route — removes itself after use
// Call: POST /api/seed-menu
export async function POST() {
  const supabase = await createClient();

  const categories = [
    { id: 'pizza',   name: 'Піца',              emoji: '🍕', sort_order: 1 },
    { id: 'sushi',   name: 'Суші & Роли',        emoji: '🍣', sort_order: 2 },
    { id: 'burgers', name: 'Бургери',             emoji: '🍔', sort_order: 3 },
    { id: 'hotdogs', name: 'Хот-Доги',            emoji: '🌭', sort_order: 4 },
    { id: 'soup',    name: 'Перші страви',         emoji: '🍲', sort_order: 5 },
    { id: 'hot',     name: 'Гарячі закуски',       emoji: '🔥', sort_order: 6 },
    { id: 'crispy',  name: 'Хрустке і швидке',     emoji: '⚡', sort_order: 7 },
    { id: 'salads',  name: 'Салати',               emoji: '🥗', sort_order: 8 },
    { id: 'drinks',  name: 'Напої',                emoji: '🥤', sort_order: 9 },
    { id: 'desserts',name: 'Десерти',              emoji: '🍰', sort_order: 10 },
  ];

  const items = [
    // PIZZA
    { id:'pizza-1', category_id:'pizza',   name:'Шотландська',         price:280, weight:'450 г', image:'/pizza_shotlandska.png',  description:'Томлена свинина з маринованим огірком, цибулею, соусом фірмовим, сир', sort_order:1 },
    { id:'pizza-2', category_id:'pizza',   name:'Морська',             price:320, weight:'450 г', image:'/pizza_morska.png',        description:'Лосось, мідії, соус альфредо, сир моцарелла, помідор черрі', sort_order:2 },
    { id:'pizza-3', category_id:'pizza',   name:'Філадельфія лосось',  price:320, weight:'450 г', image:'/pizza_philadelphia.png',  description:'Лосось, крем-сир, огірок, каперси, цибуля червона, соус', sort_order:3 },
    { id:'pizza-4', category_id:'pizza',   name:'Дует',                price:320, weight:'450 г', image:'/pizza_duet.png',          description:'Креветки, американський бекон, моцарелла, соус фірмовий, помідор', sort_order:4 },
    { id:'pizza-5', category_id:'pizza',   name:'Пеппероні',           price:280, weight:'450 г', image:'/pizza_pepperoni.png',     description:'Ковбаска пеппероні, соус томатний, сир моцарелла, спеції', sort_order:5 },
    { id:'pizza-6', category_id:'pizza',   name:'Чотири сири',         price:290, weight:'450 г', image:'/pizza_four_cheese.png',   description:'Моцарелла, пармезан, чеддер, дор-блю, соус вершковий', sort_order:6 },
    { id:'pizza-7', category_id:'pizza',   name:'Барбекю',             price:290, weight:'450 г', image:'/pizza_bbq.png',           description:'Курка, бекон, соус BBQ, червона цибуля, моцарелла', sort_order:7 },
    { id:'pizza-8', category_id:'pizza',   name:'Маргарита',           price:220, weight:'400 г', image:'/pizza_margarita.png',     description:'Класичний томатний соус, моцарелла, базилік', sort_order:8 },

    // SUSHI
    { id:'sushi-1',  category_id:'sushi', name:'Сет Преміум',          price:1500, weight:'1200 г', image:'/sushi_set2.png',             description:'Асорті преміальних ролів — Каліфорнія, Філадельфія, Дракон', sort_order:1 },
    { id:'sushi-2',  category_id:'sushi', name:'Каліфорнія',           price:350,  weight:'280 г',  image:'/sushi_california.png',       description:'Краб, авокадо, огірок, ікра тобіко, кунжут', sort_order:2 },
    { id:'sushi-3',  category_id:'sushi', name:'Філадельфія класик',   price:380,  weight:'280 г',  image:'/sushi_philadelphia.png',     description:'Лосось, крем-сир Філадельфія, огірок', sort_order:3 },
    { id:'sushi-4',  category_id:'sushi', name:'Дракон',               price:420,  weight:'300 г',  image:'/sushi_dragon.png',           description:'Лосось зовні, угор, авокадо, соус спайсі', sort_order:4 },
    { id:'sushi-5',  category_id:'sushi', name:'Якудза',               price:390,  weight:'290 г',  image:'/sushi_yakuza.png',           description:'Тунець, авокадо, огірок, ікра, соус унагі', sort_order:5 },
    { id:'sushi-6',  category_id:'sushi', name:'Запечений рол',        price:400,  weight:'300 г',  image:'/sushi_baked.png',            description:'Краб, сир, запечена шапка з лосося та вершкового соусу', sort_order:6 },
    { id:'sushi-7',  category_id:'sushi', name:'Гарячий рол',         price:380,  weight:'280 г',  image:'/sushi_hot.png',              description:'Смажений у клярі рол з лососем та кунжутом', sort_order:7 },
    { id:'sushi-8',  category_id:'sushi', name:'Шаурма рол',          price:370,  weight:'290 г',  image:'/sushi_shawarma.png',         description:'Курка, болгарський перець, соус часниковий, сир', sort_order:8 },
    { id:'sushi-9',  category_id:'sushi', name:'Бургер рол',          price:360,  weight:'280 г',  image:'/sushi_burger.png',           description:'Яловичина, сир чеддер, цибуля, соус BBQ', sort_order:9 },
    { id:'sushi-10', category_id:'sushi', name:'Том Ям рол',          price:410,  weight:'300 г',  image:'/sushi_tomyam_roll.png',      description:'Креветки, гостре молоко, лемонграс, кінза', sort_order:10 },
    { id:'sushi-11', category_id:'sushi', name:'Темпура Цезар',       price:430,  weight:'310 г',  image:'/sushi_tempura_caesar.png',   description:'Курка темпура, лист салату, соус цезар, сир', sort_order:11 },
    { id:'sushi-12', category_id:'sushi', name:'Темпура зі шпинатом', price:400,  weight:'300 г',  image:'/sushi_tempura_spinach.png',  description:'Шпинат, крем-сир, краб, сир в клярі', sort_order:12 },
    { id:'sushi-13', category_id:'sushi', name:'Маки',                price:290,  weight:'240 г',  image:'/sushi_maki.png',             description:'Класичні маки: лосось або огірок', sort_order:13 },
    { id:'sushi-14', category_id:'sushi', name:'Нігірі',              price:320,  weight:'240 г',  image:'/sushi_nigiri.png',           description:'Рис з лососем або тунцем, соєвий соус', sort_order:14 },
    { id:'sushi-15', category_id:'sushi', name:'Хіяші',               price:370,  weight:'280 г',  image:'/sushi_hiyashi.png',          description:'Холодний рол з огірком, авокадо, кунжутом', sort_order:15 },
    { id:'sushi-16', category_id:'sushi', name:'Київський',           price:390,  weight:'290 г',  image:'/sushi_kyiv.png',             description:'Курка по-київськи в ролі: крем-сир, зелень, сир', sort_order:16 },
    { id:'sushi-17', category_id:'sushi', name:'Роял',                price:450,  weight:'310 г',  image:'/sushi_royal.png',            description:'Угор, лосось, авокадо, ікра тобіко двох видів', sort_order:17 },
    { id:'sushi-set-3', category_id:'sushi', name:'Сет №3',           price:1000, weight:'1500 г', image:'/sushi_set2.png',             description:'Золотий дракон, Філадельфія лосось, Каліфорнія креветка + подарунок вино 1.0 (Кількість суші – 24 шт)', sort_order:18 },
    { id:'sushi-set-4', category_id:'sushi', name:'Сет №4',           price:1000, weight:'1500 г', image:'/sushi_set2.png',             description:'Запечений рол креветка, Каліфорнія вугор, Філадельфія лосось + подарунок вино 1.0 (Кількість суші – 24 шт)', sort_order:19 },
    { id:'sushi-set-5', category_id:'sushi', name:'Сет №5',           price:1000, weight:'1500 г', image:'/sushi_set2.png',             description:'Красний дракон, Каліфорнія тунець, Гарячий рол лосось + подарунок вино 1.0 (Кількість суші – 24 шт)', sort_order:20 },
    { id:'sushi-set-6', category_id:'sushi', name:'Сет №6',           price:1100, weight:'1700 г', image:'/sushi_set2.png',             description:'Філадельфія лосось, Каліфорнія лосось, Київ рол лосось з пармезаном, Нігірі лосось + подарунок вино 1.0 (Кількість суші – 27 шт)', sort_order:21 },
    { id:'sushi-set-7', category_id:'sushi', name:'Сет №7',           price:1000, weight:'1500 г', image:'/sushi_set2.png',             description:'Якудза рол, Роял рол з печеним лососем, Макі тунець, Макі лосось + подарунок вино 1.0 (Кількість суші – 32 шт)', sort_order:22 },

    // BURGERS
    { id:'burger-1', category_id:'burgers', name:'Гамбургер',          price:180, weight:'350 г', image:'/burger_hamburger.png',  description:'Соковита котлета, свіжі овочі, соус Бургер, булочка бріош', sort_order:1 },
    { id:'burger-2', category_id:'burgers', name:'Чізбургер',          price:210, weight:'380 г', image:'/burger_cheeseburger.png',description:'Котлета, сир чеддер, цибуля, корнішони, гірчиця, кетчуп', sort_order:2 },
    { id:'burger-3', category_id:'burgers', name:'Джайнт Бургер',      price:260, weight:'480 г', image:'/burger_giant.png',      description:'Подвійна котлета, бекон, подвійний сир, хрусткий салат', sort_order:3 },

    // HOTDOGS
    { id:'hotdog-1', category_id:'hotdogs', name:'Класичний хот-дог',  price:120, weight:'220 г', image:'/hotdog_classic.png',  description:'Сосиска, гірчиця, кетчуп, цибуля смажена', sort_order:1 },
    { id:'hotdog-2', category_id:'hotdogs', name:'Корн-дог',          price:140, weight:'200 г', image:'/hotdog_corndog.png',  description:'Сосиска в кукурудзяному тісті, соус медово-гірчичний', sort_order:2 },
  ];

  // Upsert categories
  const { error: catErr } = await supabase
    .from('menu_categories')
    .upsert(categories, { onConflict: 'id' });

  if (catErr) return NextResponse.json({ error: 'Categories: ' + catErr.message }, { status: 500 });

  // Upsert items
  const { error: itemErr } = await supabase
    .from('menu_items')
    .upsert(items.map(i => ({ ...i, is_available: true })), { onConflict: 'id' });

  if (itemErr) return NextResponse.json({ error: 'Items: ' + itemErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, categories: categories.length, items: items.length });
}
