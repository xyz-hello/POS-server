// backend/models/Product.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const Product = sequelize.define("Product", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2), // stored as DECIMAL
        allowNull: false,
        get() {
            const rawValue = this.getDataValue("price");
            return rawValue === null ? null : Number(rawValue); // always return as number
        },
    },
    unit_type: {
        type: DataTypes.STRING,
    },
    product_code: {
        type: DataTypes.STRING,
        unique: true,
    },
    image_url: {
        type: DataTypes.STRING,
    },
});

export default Product;
