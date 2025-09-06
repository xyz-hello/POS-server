import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";
import Product from "./product.js";

const Inventory = sequelize.define("Inventory", {
    quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: "Inventories",
    timestamps: true,
});

// Associations
Product.hasOne(Inventory, { foreignKey: "product_id", onDelete: "CASCADE" });
Inventory.belongsTo(Product, { foreignKey: "product_id" });

export default Inventory;
