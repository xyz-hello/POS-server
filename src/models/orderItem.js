import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";
import Order from "./order.js";
import Product from "./product.js"; // lowercase if your file is product.js

const OrderItem = sequelize.define("OrderItem", {
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Order, key: "id" },
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: Product, key: "id" },
    },
    qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
}, {
    tableName: "order_items",
    timestamps: true,
});

// Associations
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// IMPORTANT: link to Product
OrderItem.belongsTo(Product, { foreignKey: "product_id" });

export default OrderItem;
