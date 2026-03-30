function ensureRole(roleName, privileges, inheritedRoles) {
    if (db.getRole(roleName, { showPrivileges: true }) === null) {
        db.createRole({
            role: roleName,
            privileges: privileges,
            roles: inheritedRoles
        })
    }
}

ensureRole("administrator", [
    {
        resource: { db: "buterbro", collection: "" },
        actions: ["find", "insert", "update", "remove"]
    }
], [
    {
        role: "userAdmin",
        db: "buterbro"
    }
])

ensureRole("manager", [
    {
        resource: { db: "buterbro", collection: "dishes" },
        actions: ["find", "insert", "update", "remove"]
    },
    {
        resource: { db: "buterbro", collection: "orders" },
        actions: ["find", "insert", "update", "remove"]
    },
    {
        resource: { db: "buterbro", collection: "tables" },
        actions: ["find", "update"]
    }
], [])

ensureRole("waiter", [
    {
        resource: { db: "buterbro", collection: "orders" },
        actions: ["find", "insert", "update"]
    },
    {
        resource: { db: "buterbro", collection: "tables" },
        actions: ["find", "update"]
    },
    {
        resource: { db: "buterbro", collection: "dishes" },
        actions: ["find"]
    }
], [])

ensureRole("guest", [
    {
        resource: { db: "buterbro", collection: "dishes" },
        actions: ["find"]
    },
    {
        resource: { db: "buterbro", collection: "categories" },
        actions: ["find"]
    }
], [])

ensureRole("onlineUser", [
    {
        resource: { db: "buterbro", collection: "orders" },
        actions: ["find", "insert"]
    },
    {
        resource: { db: "buterbro", collection: "dishes" },
        actions: ["find"]
    },
    {
        resource: { db: "buterbro", collection: "categories" },
        actions: ["find"]
    }
], [])
