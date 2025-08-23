import express from 'express';
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomer,
  updateCustomerStatus,
} from '../../controllers/superadminControllers/customerController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requestLogger } from '../../middleware/Logger.js';

const router = express.Router();

// Apply authentication and logging to all protected routes
router.use(authenticateToken, requestLogger);

// Public-like routes (if any) can also use logger
router.get('/', getCustomers);                      // Get all customers
router.post('/', createCustomer);                   // Create customer + user
router.delete('/:id', deleteCustomer);              // Delete customer
router.put('/:id', updateCustomer);                 // Update customer fields
router.put('/:id/status', updateCustomerStatus);    // Change status (ACTIVE/INACTIVE/DELETED)

export default router;
