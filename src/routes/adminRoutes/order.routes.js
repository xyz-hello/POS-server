import express from "express";
import { createOrder, getOrderById, getOrderAnalytics, getAllOrders } from "../../controllers/adminControllers/orderController.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders (summary)
router.get("/", authenticateToken, getAllOrders);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
router.post("/", authenticateToken, createOrder);

// @route   GET /api/orders/analytics
// @desc    Get order analytics
// @access  Private
router.get("/analytics", authenticateToken, getOrderAnalytics);

// @route   GET /api/orders/:id
// @desc    Get order details by ID
// @access  Private
router.get("/:id", authenticateToken, getOrderById);

export default router;