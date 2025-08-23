import express from 'express';
import {
    checkUsernameAvailability,
    checkEmailAvailability,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
} from '../../controllers/adminControllers/UserController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { requestLogger } from '../../middleware/Logger.js';

const router = express.Router();

// ===================
// Public routes (no auth)
// ===================
router.get('/check-username', requestLogger, checkUsernameAvailability);
router.get('/check-email', requestLogger, checkEmailAvailability);

// ===================
// Protected routes
// ===================
router.use(authenticateToken); // attach req.user first
router.use(requestLogger);     // then log with actual user

router.get('/', getUsers); //get all users (under ?)
router.post('/', createUser); //create a user
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.put('/:id/status', updateUserStatus); //change status to inactive/active



export default router;
