import express from "express";
import {
    getInventory,
    updateInventory,
} from "../../controllers/adminControllers/inventoryController.js";
import {
    authenticateToken,
    authorizeRole,
} from "../../middleware/authMiddleware.js";

const router = express.Router();

// Only allow superadmin (0) and admin (1)
router.get("/", authenticateToken, authorizeRole([1]), getInventory);
router.put("/:productId", authenticateToken, authorizeRole([1]), updateInventory);

export default router;
