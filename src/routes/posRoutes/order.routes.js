// filepath: src/routes/adminRoutes/order.routes.js
import express from "express";
import { createOrder, getOrderById } from "../../controllers/adminControllers/orderController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js"; // use the correct export name

const router = express.Router();

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post("/", authenticateToken, createOrder);

// @route   GET /api/orders/:id
// @desc    Get order details by ID
// @access  Private
router.get("/:id", authenticateToken, getOrderById);

export default router;
