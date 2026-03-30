// 1
db.categories.find()

// 2
let category = db.categories.findOne({ name: "Напитки" })._id
db.dishes.find({ category_id: category })

// 3
db.dishes.find({ name: /бутер/i })

// 4
let clientId = db.clients.findOne()._id
let tableId = db.tables.findOne()._id
let staff = db.staff.findOne({ role: "waiter" })
let dish = db.dishes.findOne()

db.orders.insertOne({
    client_id: clientId,
    table_id: tableId,
    table_number: 1,
    waiter_id: staff._id,
    waiter_name: staff.full_name,
    status: "Открыт",
    order_date: new Date(),
    closed_at: null,
    payment_method: null,
    notes: null,
    total_items: 1,
    total_price: dish.price,
    items: [
        {
            dish_id: dish._id,
            name: dish.name,
            price: dish.price,
            quantity: 1,
            total: dish.price
            }
        ]
    })

// 5
let client = db.clients.findOne({ email: "alexey@example.com" })
db.orders.find({ client_id: clientId })

// 6
let order = db.orders.findOne({ status: "Открыт" })

db.orders.updateOne(
    { _id: order._id },
    { $set: { status: "Готов" } }
    )

// 7
let monthsAgo = new Date()
monthsAgo.setMonth(monthsAgo.getMonth() - 3)

db.orders.aggregate([
    {
        $match: {
            order_date: { $gte: monthsAgo },
            status: { $in: ["Закрыт", "Готов"] }
            }
        },
    {   $unwind: "$items" },
    {
        $group: {
            _id: "$items.dish_id",
            name: { $first: "$items.name" },
            total_sold: { $sum: "$items.quantity" },
            total_revenue: { $sum: "$items.total" }
            }
        },
    {   $sort: { total_sold: -1, total_revenue: -1 } }
    ])

// 8
let minOrders = 0

db.orders.aggregate([
    {
        $group: {
            _id: "$client_id",
            total_orders: { $sum: 1 }
            }
        },
    {   $match: { total_orders: { $gt: minOrders } } },
    {
        $lookup: {
            from: "clients",
            localField: "_id",
            foreignField: "_id",
            as: "client"
            }
        },
    {   $unwind: "$client" }
    ])

// 9
let start = new Date("2026-01-01")
let end = new Date("2026-06-01")

db.orders.aggregate([
    {
        $match: {
            order_date: { $gte: start, $lte: end }
            }
        },
    {   $unwind: "$items" },
    {
        $lookup: {
            from: "dishes",
            localField: "items.dish_id",
            foreignField: "_id",
            as: "dish"
            }
        },
    {   $unwind: "$dish" },
    {
        $lookup: {
            from: "categories",
            localField: "dish.category_id",
            foreignField: "_id",
            as: "category"
            }
        },
    {   $unwind: "$category" },
    {
        $group: {
            _id: "$category._id",
            category_name: { $first: "$category.name" },
            sold_count: { $sum: "$items.quantity" }
            }
        },
    {   $sort: { sold_count: -1 } }
    ])

// 10
start = new Date("2026-01-01")
end = new Date("2026-06-01")

let sold = db.orders.aggregate([
    {
        $match: {
            order_date: { $gte: start, $lt: end },
            status: { $in: ["Закрыт", "Готов"] }
            }
        },
    {   $unwind: "$items" },
    {
        $group: {
            _id: "$items.product_id"
            }
        }
    ]).toArray().map(x => x._id)

db.dishes.find(
    { _id: { $nin: sold } },
    { _id: 0, name: 1, description: 1 }
    )