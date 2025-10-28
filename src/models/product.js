import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const Product = sequelize.define("Product", {
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        get() {
            const rawValue = this.getDataValue("price");
            return rawValue === null ? null : Number(rawValue);
        },
    },
    unit_type: { type: DataTypes.STRING },
    product_code: { type: DataTypes.STRING, unique: true },
    image_url: { type: DataTypes.STRING },
    customer_id: { type: DataTypes.BIGINT, allowNull: false }, // link product to customer
    status: { type: DataTypes.ENUM("ACTIVE", "INACTIVE", "DELETED"), defaultValue: "ACTIVE" },
}, {
    tableName: "products",
    timestamps: true,
});

export default Product;
