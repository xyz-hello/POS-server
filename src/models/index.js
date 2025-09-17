import sequelize from "../config/db.sequelize.config.js";
import User from "./user.model.js";
import Product from "./product.js";
import Inventory from "./Inventory.js";
import Order from "./order.js";
import OrderItem from "./orderItem.js";

// User
User.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Inventory <-> Product
Inventory.belongsTo(Product, { foreignKey: "product_id", as: "inventoryProduct" });
Product.hasMany(Inventory, { foreignKey: "product_id", as: "inventories" });

// OrderItem <-> Product
OrderItem.belongsTo(Product, { foreignKey: "product_id", as: "orderedProduct" });
Product.hasMany(OrderItem, { foreignKey: "product_id", as: "productOrders" });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id", as: "orderItems" });
OrderItem.belongsTo(Order, { foreignKey: "order_id", as: "order" });

// Order <-> User
User.hasMany(Order, { foreignKey: "user_id", as: "orders" });
Order.belongsTo(User, { foreignKey: "user_id", as: "user" });

export { sequelize, User, Product, Inventory, Order, OrderItem };
