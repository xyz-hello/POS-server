// filepath: src/routes/adminRoutes/inventory.routes.js
import express from "express";
import { getInventory } from "../../controllers/adminControllers/inventoryController.js";
import { authenticateToken, authorizeRole } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Only admins and superadmins can access inventory
router.get("/", authenticateToken, authorizeRole(["admin", "superadmin"]), getInventory);

export default router;
