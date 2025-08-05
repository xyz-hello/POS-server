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

router.get('/', authenticateToken, getCustomers);                      // Get all customers
router.post('/', authenticateToken, createCustomer);                   // Create customer + user
router.delete('/:id', authenticateToken, deleteCustomer);              // Soft-delete or real delete
router.put('/:id', authenticateToken, updateCustomer);                 // Update customer fields
router.put('/:id/status', authenticateToken, updateCustomerStatus);    // Change status (ACTIVE/INACTIVE/DELETED)

export default router;
