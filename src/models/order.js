import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const Order = sequelize.define("Order", {
    order_number: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    payment_method: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM("PENDING", "PAID", "CANCELLED"),
        defaultValue: "PENDING",
    },
}, {
    tableName: "orders",
    timestamps: true,
});

export default Order;
