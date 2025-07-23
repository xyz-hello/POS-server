import express from 'express';
import {
  getCustomers,
  deleteCustomer,
  updateCustomer,
  createCustomer, // ✅ NEW
} from '../../controllers/superadminControllers/customerController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getCustomers);
router.post('/', authenticateToken, createCustomer); // ✅ NEW
router.delete('/:id', authenticateToken, deleteCustomer);
router.put('/:id', authenticateToken, updateCustomer); // for edit

export default router;
