import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const Inventory = sequelize.define("Inventory", {
    quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    product_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "products",
            key: "id",
        },
    },
    customer_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: "customers",
            key: "id",
        },
    },
}, {
    tableName: "inventories",
    timestamps: true,
});

export default Inventory;
