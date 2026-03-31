
db.categories.insertMany([
  { name: "Сэндвичи", description: "Горячие и холодные фирменные сэндвичи" },
  { name: "Напитки", description: "Кофе, чай, лимонады, холодные напитки" },
  { name: "Десерты", description: "Лёгкие сладкие десерты" }
])

let catSandwich = db.categories.findOne({ name: "Сэндвичи" })._id
let catDrinks   = db.categories.findOne({ name: "Напитки" })._id
let catDessert  = db.categories.findOne({ name: "Десерты" })._id



db.dishes.insertMany([
  { 
    name: "Классический бутерброд",
    description: "Хрустящий хлеб, ветчина, сыр, салат, фирменный соус",
    price: 5.50,
    is_available: true,
    calories: 320,
    category_id: catSandwich
  },
  { 
    name: "Бутерброд с курицей",
    description: "Запечённая курица, соус ранч, хрустящая зелень",
    price: 6.20,
    is_available: true,
    calories: 410,
    category_id: catSandwich
  },
  {
    name: "Бутерброд с тунцом",
    description: "Тунец в соусе, огурец, салат айсберг",
    price: 6.70,
    is_available: true,
    calories: 360,
    category_id: catSandwich
  },
  { 
    name: "Кофе латте",
    description: "Нежный молочный кофе",
    price: 3.10,
    is_available: true,
    calories: 110,
    category_id: catDrinks
  },
  { 
    name: "Домашний лимонад",
    description: "Лимон, мята, сахарный сироп",
    price: 2.80,
    is_available: true,
    calories: 90,
    category_id: catDrinks
  },
  {
    name: "Чизкейк ванильный",
    description: "Мягкий сырный десерт",
    price: 4.40,
    is_available: true,
    calories: 300,
    category_id: catDessert
  }
])

let dishClassic  = db.dishes.findOne({ name: "Классический бутерброд" })._id
let dishChicken  = db.dishes.findOne({ name: "Бутерброд с курицей" })._id
let dishLatte    = db.dishes.findOne({ name: "Кофе латте" })._id



db.tables.insertMany([
  { number: 1, seats: 2, status: "Свободен" },
  { number: 2, seats: 2, status: "Занят" },
  { number: 3, seats: 4, status: "Зарезервирован" }
])

let table1 = db.tables.findOne({ number: 1 })._id

db.staff.insertOne({
    full_name: "Бражкина Юлия",
    username: "braga",
    birth_date: new Date("1972-11-19"),
    experience: 10,
    phone: "+79998887766",
    email: "braga@buterbro.com",
    role: "admin",
    city: "Москва",
    salary: 140000.99
    })

db.staff.insertMany([
  { 
    full_name: "Иванов Иван",
    username: "ivanov",
    birth_date: new Date("1990-05-10"),
    experience: 5,
    phone: "+79990000001",
    email: "ivanov@buterbro.com",
    role: "waiter",
    city: "Москва",
    salary: 45000.10
  },
  { 
    full_name: "Петров Пётр",
    username: "petrov",
    birth_date: new Date("1985-02-20"),
    experience: 8,
    phone: "+79990000002",
    email: "petrov@buterbro.com",
    role: "cook",
    city: "Москва",
    salary: 60000.10
  },
  { 
    full_name: "Сидорова Анна",
    username: "sidorova",
    birth_date: new Date("1993-09-12"),
    experience: 3,
    phone: "+79990000003",
    email: "sidorova@buterbro.com",
    role: "manager",
    city: "Москва",
    salary: 70000.10
  }
])

let waiterIvan = db.staff.findOne({ full_name: "Иванов Иван" })._id



db.clients.insertMany([
  {
    name: "Алексей",
    birth_date: new Date("1997-06-01"),
    phone: "+79998887766",
    email: "alexey@example.com",
    status: "normal"
  },
  {
    name: "Мария",
    birth_date: new Date("1995-04-27"),
    phone: null,
    email: "maria@example.com",
    status: "gold"
  }
])

let clientAlex = db.clients.findOne({ name: "Алексей" })._id



db.orders.insertOne({
  table_id: table1,
  table_number: 1,
  waiter_id: waiterIvan,
  waiter_name: "Иванов Иван",
  client_id: clientAlex,
  status: "Открыт",
  order_date: new Date(),
  closed_at: null,
  payment_method: null,
  total_items: 3,
  total_price: 14.80,
  notes: "Без лука в классическом бутерброде",
  items: [
    {
      dish_id: dishClassic,
      name: "Классический бутерброд",
      price: 5.50,
      quantity: 1,
      total: 5.50
    },
    {
      dish_id: dishChicken,
      name: "Бутерброд с курицей",
      price: 6.20,
      quantity: 1,
      total: 6.20
    },
    {
      dish_id: dishLatte,
      name: "Кофе латте",
      price: 3.10,
      quantity: 1,
      total: 3.10
    }
  ]
})

