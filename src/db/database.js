const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
const config = require("./config.json");

let db;

if (config["db-type"] === "sqlite") {
    db = new Sequelize({
        dialect: "sqlite",
        storage: "database.sqlite",
        logging: false
    });
} else if (config["db-type"] === "mysql") {
    db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
        host: process.env.MYSQL_HOST,
        dialect: "mysql",
        logging: false
    });
} else if (config["db-type"] === "mongodb") {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => console.log("Connected to MongoDB"));
}

module.exports = db;