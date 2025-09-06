// src/models/inventory.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";
import Product from "./product.js";

const Inventory = sequelize.define(
    "Inventory",
    {
        quantity: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        tableName: "Inventories",
        timestamps: true,
    }
);

// Associations
Product.hasOne(Inventory, { foreignKey: "product_id", as: "Inventory" });
Inventory.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export default Inventory;
