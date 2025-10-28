import express from "express";
import { authenticateToken } from "../../middleware/authMiddleware.js";
import { getCurrentCustomer, updateCurrentCustomerTheme } from "../../controllers/customerController.js";

const router = express.Router();

// Get current authenticated customer
router.get("/me", authenticateToken, getCurrentCustomer);

// Update current authenticated customer's theme
router.patch("/me/theme", authenticateToken, updateCurrentCustomerTheme);

export default router;
