import { DataTypes } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

const Customer = sequelize.define(
    "Customer",
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        system_type: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "DELETED",
        },
        theme: {
            type: DataTypes.STRING(50),
            allowNull: false,
            defaultValue: "light",
        },
        logo: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: "URL or path to the customer logo",
        },
    },
    {
        tableName: "customers",
        timestamps: true, // Enable createdAt and updatedAt
        underscored: true,
    }
);

export default Customer;
