// filepath: src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Routes
import authRoutes from "./routes/auth.route.js";
import customerRoutes from "./routes/superadminRoutes/customer.routes.js";
import adminUserRoutes from "./routes/adminRoutes/user.routes.js";
import productRoutes from "./routes/adminRoutes/product.routes.js";

// Models + DB connection
import { sequelize } from "./models/index.js";

dotenv.config();
const app = express();

// ===============================
// Middleware
// ===============================
app.use(cors());
app.use(express.json());

// ---------------- Serve uploaded files ----------------
app.use("/uploads", express.static(path.join(process.cwd(), "uploads"))); // serve uploads folder

// ===============================
// Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/superadmin/customers", customerRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/products", productRoutes);

// ===============================
// Global error handler
// ===============================
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ===============================
// Start server + DB sync
// ===============================
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    // 1️⃣ Authenticate DB connection
    await sequelize.authenticate();
    console.log("✅ Database connected...");

    // 2️⃣ Sync all models with DB (creates/updates tables)
    await sequelize.sync({ alter: true }); // safe in dev; use { force: true } only if you want to drop tables
    console.log("✅ Models synchronized...");

    // 3️⃣ Start Express server only after DB is ready
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1); // stop process if DB fails
  }
})();
