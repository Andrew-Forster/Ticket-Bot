const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
const config = require("../config/config.json");

let db;

if (config["db_type"] === "sqlite") {
    db = new Sequelize({
        dialect: "sqlite",
        storage: "database.sqlite",
        logging: false
    });
} else if (config["db_type"] === "mysql") {
    db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        dialect: "mysql",
        logging: false
    });
} else if (config["db_type"] === "mongodb") {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch(err => console.error("MongoDB connection error:", err));
}

async function startDB() {
    if (config["db_type"] === "sqlite") {
        await db.authenticate().then(() => console.log("Connected to SQLite")).catch(err => console.error("SQLite connection error:", err));
        await db.sync();
    } else if (config["db_type"] === "mysql") {
        await db.authenticate().then(() => console.log("Connected to MySQL")).catch(err => console.error("MySQL connection error:", err));
        await db.sync();
    } else if (config["db_type"] === "mongodb") {}
}

module.exports = { db, startDB };