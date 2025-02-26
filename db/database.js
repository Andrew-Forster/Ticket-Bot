const { Sequelize } = require("sequelize");
const mongoose = require("mongoose");
const config = require("../config/config.json");

class DB {
  constructor() {
    this.db = null;
    this.config = config;
    this._initializeDB();
  }

  _initializeDB() {
    if (this.config["db_type"] === "sqlite") {
      this.db = new Sequelize({
        dialect: "sqlite",
        storage: "database.sqlite",
        logging: false,
      });
    } else if (this.config["db_type"] === "mysql") {
      this.db = new Sequelize(
        process.env.MYSQL_DATABASE,
        process.env.MYSQL_USER,
        process.env.MYSQL_PASSWORD,
        {
          host: process.env.MYSQL_HOST,
          dialect: "mysql",
          logging: false,
        }
      );
    } else if (this.config["db_type"] === "mongodb") {
      mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
    }
  }

  async startDB() {
    if (
      this.config["db_type"] === "sqlite" ||
      this.config["db_type"] === "mysql"
    ) {
      try {
        await this.db.authenticate();
        console.log(`Connected to ${this.config["db_type"]}`);
        await this.db.sync();
      } catch (err) {
        console.error(`${this.config["db_type"]} connection error:`, err);
      }
    }
  }

  // CRUD operations for MongoDB and Sequelize
  async find(model, id) {
    if (this.config.db_type === "mongodb") {
      return await model.findById(id);
    } else if (
      this.config.db_type === "mysql" ||
      this.config.db_type === "sqlite"
    ) {
      return await model.findOne({ where: { id } });
    }
    throw new Error("Unsupported database type.");
  }

  async get(model, query) {
    if (this.config.db_type === "mongodb") {
      return await model.findOne(query);
    } else if (
      this.config.db_type === "mysql" ||
      this.config.db_type === "sqlite"
    ) {
      return await model.findOne({ where: query });
    }
    throw new Error("Unsupported database type.");
  }

  async getId(model, id) {
    if (this.config.db_type === "mongodb") {
      return await model._id;
    } else if (
      this.config.db_type === "mysql" ||
      this.config.db_type === "sqlite"
    ) {
      return await model.id;
    }
    throw new Error("Unsupported database type.");
  }

  async create(model, data) {
    if (this.config.db_type === "mongodb") {
      return await model.create(data);
    } else if (
      this.config.db_type === "mysql" ||
      this.config.db_type === "sqlite"
    ) {
      return await model.create(data);
    }
    throw new Error("Unsupported database type.");
  }

  async update(model, id, data) {
    if (this.config.db_type === "mongodb") {
      return await model.findByIdAndUpdate(id, data);
    } else if (
      this.config.db_type === "mysql" ||
      this.config.db_type === "sqlite"
    ) {
      return await model.update(data, { where: { id } });
    }
    throw new Error("Unsupported database type.");
  }

  async delete(model, id) {
    if (this.config.db_type === "mongodb") {
      return await model.deleteOne({ _id: id });
    } else if (
      this.config.db_type === "mysql" ||
      this.config.db_type === "sqlite"
    ) {
      return await model.destroy({ where: { id } });
    }
    throw new Error("Unsupported database type.");
  }
}

module.exports = DB;
