// filepath: src/routes/adminRoutes/productRoutes.js
import express from "express";
import {
    createProduct,
    updateInventory,
    getProducts,
    updateProduct,
    deleteProduct,
} from "../../controllers/adminControllers/productController.js";
import upload from "../../middleware/uploadMiddleware.js";
import { authenticateToken, authorizeRole } from "../../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Protect all routes ----------------
router.use(authenticateToken); // require JWT
router.use(authorizeRole([1])); // allow only Admin (numeric role)

// Fetch all products
router.get("/", getProducts);

// Add new product
router.post("/", upload.single("image"), createProduct);

// Edit existing product
router.put("/:id", upload.single("image"), updateProduct);

// Update inventory
router.patch("/:productId/inventory", updateInventory);

// Delete product (soft delete)
router.delete("/:id", deleteProduct);

export default router;
