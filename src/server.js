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
import inventoryRoutes from "./routes/adminRoutes/inventory.routes.js";
import posProductRoutes from "./routes/posRoutes/product.routes.js";
import orderRoutes from "./routes/adminRoutes/order.routes.js";
import uploadRoutes from "./routes/superadminRoutes/upload.route.js";


// Models + DB connection
import { sequelize } from "./models/index.js";

dotenv.config();
const app = express();

// ===============================
// Middleware
// ===============================

// Enable CORS for React frontend
app.use(cors({
  origin: "http://localhost:3000", // React frontend URL
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

// Parse JSON body
app.use(express.json());

// Serve uploaded files (make sure this folder exists)
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ===============================
// POS Routes
// ===============================
app.use("/api/pos", posProductRoutes);

// ===============================
// Other Routes
// ===============================
app.use("/api/auth", authRoutes);
app.use("/api/superadmin/customers", customerRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/inventory", inventoryRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/uploads", uploadRoutes);
import userThemeRoutes from "./routes/userTheme.js";

// ===============================
// Global error handler
// ===============================
app.use((err, req, res, next) => {
  console.error("Error:", err.stack || err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ===============================
// Start server + DB sync
app.use("/api/user", userThemeRoutes);
// ===============================
const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected...");

    // Sync models safely (auto-alter tables to match models)
    await sequelize.sync({ alter: true });
    console.log("✅ Models synchronized (altered)...");

    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
})();
