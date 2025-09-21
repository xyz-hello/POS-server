import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const Inventory = sequelize.define("Inventory", {
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
}, {
    tableName: "inventories",
    timestamps: true,
});

export default Inventory;
