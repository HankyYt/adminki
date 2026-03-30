let ivanov = db.staff.findOne({username: "ivanov"})._id
let petrov = db.staff.findOne({username: "petrov"})._id
let sidorova = db.staff.findOne({username: "sidorova"})._id
const appUsername = process.env.MONGO_APP_USERNAME || "braga"
const appPassword = process.env.MONGO_APP_PASSWORD || "012"
let appStaff = db.staff.findOne({username: appUsername})

function ensureUser(username, password, roles, staffId) {
    if (db.getUser(username) === null) {
        db.createUser({
            user: username,
            pwd: password,
            roles: roles,
            customData: {
                staff_id: staffId
            }
        })
    }
}

ensureUser("ivanov", "123", [{ role: "waiter", db: "buterbro" }], ivanov)
ensureUser("petrov", "456", [{ role: "cook", db: "buterbro" }], petrov)
ensureUser("sidorova", "789", [{ role: "manager", db: "buterbro" }], sidorova)

if (appStaff === null) {
    throw new Error(`Mongo app user "${appUsername}" must match an existing staff.username`)
}

ensureUser(appUsername, appPassword, [{ role: "administrator", db: "buterbro" }], appStaff._id)
