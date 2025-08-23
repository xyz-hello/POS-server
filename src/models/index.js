// Import all models and define associations here
import sequelize from "../config/db.mysql.config.js";
import User from "./user.model.js";

// Define associations here
User.belongsTo(User, { foreignKey: "created_by", as: "creator" });

// Add other models and associations as needed
export { sequelize, User };
