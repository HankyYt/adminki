
db.categories.insertMany([
  { name: "РЎСЌРЅРґРІРёС‡Рё", description: "Р“РѕСЂСЏС‡РёРµ Рё С…РѕР»РѕРґРЅС‹Рµ С„РёСЂРјРµРЅРЅС‹Рµ СЃСЌРЅРґРІРёС‡Рё" },
  { name: "РќР°РїРёС‚РєРё", description: "РљРѕС„Рµ, С‡Р°Р№, Р»РёРјРѕРЅР°РґС‹, С…РѕР»РѕРґРЅС‹Рµ РЅР°РїРёС‚РєРё" },
  { name: "Р”РµСЃРµСЂС‚С‹", description: "Р›С‘РіРєРёРµ СЃР»Р°РґРєРёРµ РґРµСЃРµСЂС‚С‹" }
])

let catSandwich = db.categories.findOne({ name: "РЎСЌРЅРґРІРёС‡Рё" })._id
let catDrinks   = db.categories.findOne({ name: "РќР°РїРёС‚РєРё" })._id
let catDessert  = db.categories.findOne({ name: "Р”РµСЃРµСЂС‚С‹" })._id



db.dishes.insertMany([
  { 
    name: "РљР»Р°СЃСЃРёС‡РµСЃРєРёР№ Р±СѓС‚РµСЂР±СЂРѕРґ",
    description: "РҐСЂСѓСЃС‚СЏС‰РёР№ С…Р»РµР±, РІРµС‚С‡РёРЅР°, СЃС‹СЂ, СЃР°Р»Р°С‚, С„РёСЂРјРµРЅРЅС‹Р№ СЃРѕСѓСЃ",
    price: 5.50,
    is_available: true,
    calories: 320,
    category_id: catSandwich
  },
  { 
    name: "Р‘СѓС‚РµСЂР±СЂРѕРґ СЃ РєСѓСЂРёС†РµР№",
    description: "Р—Р°РїРµС‡С‘РЅРЅР°СЏ РєСѓСЂРёС†Р°, СЃРѕСѓСЃ СЂР°РЅС‡, С…СЂСѓСЃС‚СЏС‰Р°СЏ Р·РµР»РµРЅСЊ",
    price: 6.20,
    is_available: true,
    calories: 410,
    category_id: catSandwich
  },
  {
    name: "Р‘СѓС‚РµСЂР±СЂРѕРґ СЃ С‚СѓРЅС†РѕРј",
    description: "РўСѓРЅРµС† РІ СЃРѕСѓСЃРµ, РѕРіСѓСЂРµС†, СЃР°Р»Р°С‚ Р°Р№СЃР±РµСЂРі",
    price: 6.70,
    is_available: true,
    calories: 360,
    category_id: catSandwich
  },
  { 
    name: "РљРѕС„Рµ Р»Р°С‚С‚Рµ",
    description: "РќРµР¶РЅС‹Р№ РјРѕР»РѕС‡РЅС‹Р№ РєРѕС„Рµ",
    price: 3.10,
    is_available: true,
    calories: 110,
    category_id: catDrinks
  },
  { 
    name: "Р”РѕРјР°С€РЅРёР№ Р»РёРјРѕРЅР°Рґ",
    description: "Р›РёРјРѕРЅ, РјСЏС‚Р°, СЃР°С…Р°СЂРЅС‹Р№ СЃРёСЂРѕРї",
    price: 2.80,
    is_available: true,
    calories: 90,
    category_id: catDrinks
  },
  {
    name: "Р§РёР·РєРµР№Рє РІР°РЅРёР»СЊРЅС‹Р№",
    description: "РњСЏРіРєРёР№ СЃС‹СЂРЅС‹Р№ РґРµСЃРµСЂС‚",
    price: 4.40,
    is_available: true,
    calories: 300,
    category_id: catDessert
  }
])

let dishClassic  = db.dishes.findOne({ name: "РљР»Р°СЃСЃРёС‡РµСЃРєРёР№ Р±СѓС‚РµСЂР±СЂРѕРґ" })._id
let dishChicken  = db.dishes.findOne({ name: "Р‘СѓС‚РµСЂР±СЂРѕРґ СЃ РєСѓСЂРёС†РµР№" })._id
let dishLatte    = db.dishes.findOne({ name: "РљРѕС„Рµ Р»Р°С‚С‚Рµ" })._id



db.tables.insertMany([
  { number: 1, seats: 2, status: "РЎРІРѕР±РѕРґРµРЅ" },
  { number: 2, seats: 2, status: "Р—Р°РЅСЏС‚" },
  { number: 3, seats: 4, status: "Р—Р°СЂРµР·РµСЂРІРёСЂРѕРІР°РЅ" }
])

let table1 = db.tables.findOne({ number: 1 })._id

db.staff.insertOne({
    full_name: "Р‘СЂР°Р¶РєРёРЅР° Р®Р»РёСЏ",
    username: "braga",
    birth_date: new Date("1972-11-19"),
    experience: 10,
    phone: "+79998887766",
    email: "braga@buterbro.com",
    role: "admin",
    city: "РњРѕСЃРєРІР°",
    salary: 140000.99
    })

db.staff.insertMany([
  { 
    full_name: "РРІР°РЅРѕРІ РРІР°РЅ",
    username: "ivanov",
    birth_date: new Date("1990-05-10"),
    experience: 5,
    phone: "+79990000001",
    email: "ivanov@buterbro.com",
    role: "waiter",
    city: "РњРѕСЃРєРІР°",
    salary: 45000.10
  },
  { 
    full_name: "РџРµС‚СЂРѕРІ РџС‘С‚СЂ",
    username: "petrov",
    birth_date: new Date("1985-02-20"),
    experience: 8,
    phone: "+79990000002",
    email: "petrov@buterbro.com",
    role: "cook",
    city: "РњРѕСЃРєРІР°",
    salary: 60000.10
  },
  { 
    full_name: "РЎРёРґРѕСЂРѕРІР° РђРЅРЅР°",
    username: "sidorova",
    birth_date: new Date("1993-09-12"),
    experience: 3,
    phone: "+79990000003",
    email: "sidorova@buterbro.com",
    role: "manager",
    city: "РњРѕСЃРєРІР°",
    salary: 70000.10
  }
])

let waiterIvan = db.staff.findOne({ full_name: "РРІР°РЅРѕРІ РРІР°РЅ" })._id



db.clients.insertMany([
  {
    name: "РђР»РµРєСЃРµР№",
    birth_date: new Date("1997-06-01"),
    phone: "+79998887766",
    email: "alexey@example.com",
    status: "normal"
  },
  {
    name: "РњР°СЂРёСЏ",
    birth_date: new Date("1995-04-27"),
    phone: null,
    email: "maria@example.com",
    status: "gold"
  }
])

let clientAlex = db.clients.findOne({ name: "РђР»РµРєСЃРµР№" })._id



db.orders.insertOne({
  table_id: table1,
  table_number: 1,
  waiter_id: waiterIvan,
  waiter_name: "РРІР°РЅРѕРІ РРІР°РЅ",
  client_id: clientAlex,
  status: "РћС‚РєСЂС‹С‚",
  order_date: new Date(),
  closed_at: null,
  payment_method: null,
  total_items: 3,
  total_price: 14.80,
  notes: "Р‘РµР· Р»СѓРєР° РІ РєР»Р°СЃСЃРёС‡РµСЃРєРѕРј Р±СѓС‚РµСЂР±СЂРѕРґРµ",
  items: [
    {
      dish_id: dishClassic,
      name: "РљР»Р°СЃСЃРёС‡РµСЃРєРёР№ Р±СѓС‚РµСЂР±СЂРѕРґ",
      price: 5.50,
      quantity: 1,
      total: 5.50
    },
    {
      dish_id: dishChicken,
      name: "Р‘СѓС‚РµСЂР±СЂРѕРґ СЃ РєСѓСЂРёС†РµР№",
      price: 6.20,
      quantity: 1,
      total: 6.20
    },
    {
      dish_id: dishLatte,
      name: "РљРѕС„Рµ Р»Р°С‚С‚Рµ",
      price: 3.10,
      quantity: 1,
      total: 3.10
    }
  ]
})

