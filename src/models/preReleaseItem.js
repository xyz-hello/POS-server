import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const PreReleaseItem = sequelize.define("PreReleaseItem", {
    pre_release_id: { type: DataTypes.BIGINT, allowNull: false }, // FK to PreRelease
    product_id: { type: DataTypes.BIGINT, allowNull: false }, // FK to Product
    qty: { type: DataTypes.INTEGER, allowNull: false },
}, {
    timestamps: false,
    tableName: "pre_release_items"
});

export default PreReleaseItem;
