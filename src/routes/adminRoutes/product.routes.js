// routes/admin/productRoutes.js
import express from "express";
import {
    createProduct,
    updateInventory,
    getProducts,
    updateProduct,
} from "../../controllers/adminControllers/productController.js";
import upload from "../../middleware/uploadMiddleware.js";

const router = express.Router();

// ---------------- Routes ----------------

// Fetch all products (with inventory info)
router.get("/", getProducts);

// Add new product (with optional image)
router.post("/", upload.single("image"), createProduct);

// Edit existing product (with optional image)
router.put("/:id", upload.single("image"), updateProduct);

// Update inventory (increment/decrement)
router.patch("/:productId/inventory", updateInventory);

export default router;
