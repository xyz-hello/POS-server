import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const PreRelease = sequelize.define("PreRelease", {
    id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: { type: DataTypes.BIGINT, allowNull: false }, // Cashier/tenant who did the pre-release
    store_id: { type: DataTypes.BIGINT, allowNull: false }, // Store receiving the stock
    remarks: { type: DataTypes.TEXT },
    photo_url: { type: DataTypes.STRING },
    status: { type: DataTypes.ENUM("PENDING", "APPROVED", "REJECTED"), defaultValue: "PENDING" },
}, {
    timestamps: true,
    tableName: "pre_releases"
});

export default PreRelease;
