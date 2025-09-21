import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const OrderItem = sequelize.define("OrderItem", {
    order_id: { type: DataTypes.INTEGER, allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
}, {
    tableName: "order_items",
    timestamps: true,
});

export default OrderItem;
