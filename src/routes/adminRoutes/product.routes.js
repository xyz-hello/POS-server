import express from "express";
import {
    createProduct,
    updateInventory,
    getProducts,
    updateProduct,
} from "../../controllers/adminControllers/productController.js";
import upload from "../../middleware/uploadMiddleware.js";
import { authenticateToken, authorizeRole } from "../../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Protect all routes ----------------
router.use(authenticateToken); // require JWT
router.use(authorizeRole(["admin"])); // only admin can access (superadmin sees separately)

// Fetch all products (Admin sees only their own)
router.get("/", getProducts);

// Add new product (with optional image)
router.post("/", upload.single("image"), createProduct);

// Edit existing product (with optional image)
router.put("/:id", upload.single("image"), updateProduct);

// Update inventory (increment/decrement)
router.patch("/:productId/inventory", updateInventory);

export default router;
