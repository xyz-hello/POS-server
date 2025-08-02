import express from 'express';
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomer,
  updateCustomerStatus,
} from '../../controllers/superadminControllers/customerController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getCustomers);               // Fetch customers
router.post('/', authenticateToken, createCustomer);            // Create customer
router.delete('/:id', authenticateToken, deleteCustomer);       // Delete customer
router.put('/:id', authenticateToken, updateCustomer);          // Update customer
router.put('/:id/status', authenticateToken, updateCustomerStatus); // Update status

export default router;
