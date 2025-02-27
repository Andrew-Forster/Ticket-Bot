const { PrismaClient } = require("@prisma/client");
const mongoose = require("mongoose");
const config = require("../config/config.json");

class DB {
  constructor() {
    this.db = null;
    this.config = config;
    this._initializeDB();
  }

  _initializeDB() {
    if (this.config["db_type"] === "sqlite" || this.config["db_type"] === "mysql") {
      this.db = new PrismaClient();
    } else if (this.config["db_type"] === "mongodb") {
      mongoose
        .connect(process.env.MONGO_URI)
        .then(() => console.log("Connected to MongoDB"))
        .catch((err) => console.error("MongoDB connection error:", err));
    }
  }

  async startDB() {
    if (this.config["db_type"] === "sqlite" || this.config["db_type"] === "mysql") {
      try {
        await this.db.$connect();
        console.log(`Connected to ${this.config["db_type"]}`);
      } catch (err) {
        console.error(`${this.config["db_type"]} connection error:`, err);
      }
    }
  }

  // CRUD operations for Prisma and MongoDB
  async find(mongoModel, model, id) {
    if (this.config.db_type === "mongodb") {
      return await mongoModel.findById(id);
    } else if (this.config.db_type === "mysql" || this.config.db_type === "sqlite") {
      return await this.db[model].findUnique({ where: { id: parseInt(id) } });
    }
    throw new Error("Unsupported database type.");
  }

  async findAll(mongoModel, model, query) {
    if (this.config.db_type === "mongodb") {
      return await mongoModel.find(query);
    } else if (this.config.db_type === "mysql" || this.config.db_type === "sqlite") {
      return await this.db[model].findMany({ where: query });
    }
    throw new Error("Unsupported database type.");
  }

  async get(mongoModel, model, query) {
    if (this.config.db_type === "mongodb") {
      return await mongoModel.findOne(query);
    } else if (this.config.db_type === "mysql" || this.config.db_type === "sqlite") {
      return await this.db[model].findFirst({ where: query });
    }
    throw new Error("Unsupported database type.");
  }

  async getAll(mongoModel, model, query) {
    if (this.config.db_type === "mongodb") {
      return await mongoModel.find(query);
    } else if (this.config.db_type === "mysql" || this.config.db_type === "sqlite") {
      return await this.db[model].findMany({ where: query });
    }
    throw new Error("Unsupported database type.");
  }

  async delete(mongoModel, model, id) {
    if (this.config.db_type === "mongodb") {
      return await mongoModel.deleteOne({ _id: id });
    } else if (this.config.db_type === "mysql" || this.config.db_type === "sqlite") {
      return await this.db[model].delete({ where: { id: parseInt(id) } });
    }
    throw new Error("Unsupported database type.");
  }

  async create(mongoModel, model, data) {
    if (this.config.db_type === "mongodb") {
      return await mongoModel.create(data);
    } else if (this.config.db_type === "mysql" || this.config.db_type === "sqlite") {
      return await this.db[model].create({ data });
    }
    throw new Error("Unsupported database type.");
  }
}

module.exports = DB;
