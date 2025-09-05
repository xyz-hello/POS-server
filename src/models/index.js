import sequelize from "../config/db.sequelize.config.js";
import User from "./user.model.js";
import Product from "../models/product.js";
import Inventory from "./Inventory.js";

// User relations
User.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Product/Inventory relations already defined in Inventory.js

export { sequelize, User, Product, Inventory };
