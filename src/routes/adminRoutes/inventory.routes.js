// filepath: src/routes/adminRoutes/inventory.routes.js
import express from "express";
import { getInventory, updateInventory } from "../../controllers/adminControllers/inventoryController.js";
import { authenticateToken, authorizeRole } from "../../middleware/authMiddleware.js";

const router = express.Router();

// Only admins and superadmins can access
router.get("/", authenticateToken, authorizeRole(["admin", "superadmin"]), getInventory);
router.put("/:productId", authenticateToken, authorizeRole(["admin", "superadmin"]), updateInventory);

export default router;
