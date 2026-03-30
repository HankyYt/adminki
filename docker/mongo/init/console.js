    db.createCollection("dishes",{
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["category_id", "name", "description", "price", "is_available", "calories"],
                properties: {
                    category_id: {
                        bsonType: "objectId"
                    },
                    name: {
                        bsonType: "string",
                        minLength: 2,
                        maxLength: 100,
                        description: "Название позиции"
                    },
                    description: {
                        bsonType: "string",
                        description: "Ингредиенты в составе блюда"
                    },
                    price: {
                        bsonType: "double",
                        minimum: 0,
                        description: "Стоимость блюда"
                    },
                    is_available: {
                        bsonType: "bool",
                        description: "Доступность блюда"
                    },
                    calories: {
                        bsonType: "int",
                        minimum: 0,
                        description: "Количество калорий в блюде"
                    }
                }
            }
        }
    })
    db.createCollection("categories",{
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["name", "description"],
                properties: {
                    name: {
                        bsonType: "string",
                        minLength: 2,
                        maxLength: 50
                    },
                    description: {
                        bsonType: "string"
                    }
                }
            }
        }
    })
    db.createCollection("tables",{
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["number", "seats", "status"],
                properties: {
                    number: {
                        bsonType: "int",
                        minimum: 1,
                        description: "Номер столика"
                    },
                    seats: {
                        bsonType: "int",
                        minimum: 1,
                        description: "Количество мест за столом"
                    },
                    status: {
                        enum: ["Свободен", "Занят", "Зарезервирован"],
                        description: "Состояние столика"
                    }
                }
            }
        }
    })
    db.createCollection("staff",{
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["full_name", "birth_date", "experience", "phone", "email", "role", "city", "salary"],
                properties: {
                    full_name: {
                        bsonType: "string",
                        minLength: 3,
                        maxLength: 100,
                        description: "Полное имя сотрудника"
                    },
                    username: {
                        bsonType: "string",
                        minLength: 3,
                        description: "Логин пользователя в системе"
                    },
                    birth_date: {
                        bsonType: "date"
                    },
                    experience: {
                        bsonType: "int",
                        minimum: 0,
                        description: "Опыт работы"
                    },
                    phone: {
                        bsonType: "string"
                    },
                    email: {
                        bsonType: "string"
                    },
                    role: {
                        enum: ["waiter", "manager", "admin", "cook"]
                    },
                    city: {
                        bsonType: "string"
                    },
                    salary:{
                        bsonType: "double",
                        minimum: 0
                    }
                }
            }
        }
    })
    db.createCollection("orders", {
        validator: {
            $jsonSchema: {
                bsonType: "object",
                required: ["table_id", "table_number", "waiter_id", "status", "order_date", "items", "total_price"],
                properties: {
                    table_id: {
                        bsonType: "objectId",
                        description: "ID столика"
                    },
                    table_number: {
                        bsonType: "int",
                        minimum: 1,
                        description: "Номер столика"
                    },
                    waiter_id: {
                        bsonType: "objectId",
                        description: "Официант"
                    },
                    waiter_name: {
                        bsonType: "string",
                        description: "Имя официанта"
                    },
                    client_id: {
                        bsonType: ["objectId", "null"],
                        description: "Клиент (если активировал свою бонусную карту)"
                    },
                    status: {
                        enum: ["Открыт", "Готовится", "Готов", "Закрыт", "Отменен"],
                        description: "Статус заказа"
                    },
                    order_date: {
                        bsonType: "date",
                        description: "Дата создания заказа"
                    },
                    closed_at: {
                        bsonType: ["date", "null"],
                        description: "Время закрытия заказа"
                    },
                    payment_method: {
                        enum: ["cash", "card", "online", null],
                        description: "Способ оплаты"
                    },
                    total_items: {
                        bsonType: "int",
                        minimum: 0
                    },
                    total_price: {
                        bsonType: "double",
                        minimum: 0
                    },
                    notes: {
                        bsonType: ["string", "null"]
                    },
                    items: {
                        bsonType: "array",
                        minItems: 1,
                        items: {
                            bsonType: "object",
                            required: ["dish_id", "name", "price", "quantity", "total"],
                            properties: {
                                dish_id: {
                                    bsonType: "objectId"
                                },
                                name: {
                                    bsonType: "string"
                                },
                                price: {
                                    bsonType: "double",
                                    minimum: 0
                                },
                                quantity: {
                                    bsonType: "int",
                                    minimum: 1
                                },
                                total: {
                                    bsonType: "double",
                                    minimum: 0
                                }
                            }
                        }
                    }
                }
            }
        }
    })
    db.createCollection("clients", {
        validator: {
            $jsonSchema:{
                bsonType: "object",
                required: ["name", "birth_date", "email", "status"],
                properties: {
                    name: {
                        bsonType: "string",
                        description: "Имя клиента"
                    },
                    birth_date: {
                        bsonType: "date",
                        description: "Дата рождения клиента"
                    },
                    phone: {
                        bsonType: ["string", "null"],
                        description: "Номер телефона клиента"
                    },
                    email: {
                        bsonType: "string",
                        description: "Адрес электронной почты клиента"
                    },
                    status: {
                        enum: ["normal", "gold", "premium"],
                        description: "Уровень в реферальной системе"
                    }
                }
            }
        }
    })
    db.staff.createIndex({ username: 1 }, { unique: true })
