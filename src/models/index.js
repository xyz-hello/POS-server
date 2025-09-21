import sequelize from "../config/db.sequelize.config.js";
import User from "./user.model.js";
import Product from "./product.js";
import Inventory from "./inventory.js";
import Order from "./order.js";
import OrderItem from "./orderItem.js";

// ----------------- Associations -----------------

// User <-> Orders
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

// Product <-> Inventory (1:1, but we allow hasOne or hasMany depending on design)
Product.hasOne(Inventory, { foreignKey: "product_id", as: "inventory" });
Inventory.belongsTo(Product, { foreignKey: "product_id", as: "product" });

// Order <-> OrderItems (1:N)
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "items" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Product <-> OrderItems (1:N)
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "orderItems" });
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });

export {
    sequelize,
    User,
    Product,
    Inventory,
    Order,
    OrderItem,
};
