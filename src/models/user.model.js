import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.sequelize.config.js";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    user_type: {
      type: DataTypes.TINYINT,
      allowNull: false,
      comment: "0=SuperAdmin, 1=Admin, 2=Cashier, 3=Manager",
    },
    customer_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "customers",
        key: "id",
      },
    },
    status: {
      type: DataTypes.STRING(45),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
    created_by: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true, // Sequelize will use createdAt/updatedAt
    createdAt: "created_at", // map to DB column
    updatedAt: "updated_at", // map to DB column
  }
);

export default User;