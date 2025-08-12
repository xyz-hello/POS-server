import express from 'express';
import db from '../../models/db.js';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} from '../../controllers/adminControllers/UserController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Public routes: username/email availability check
router.get('/check-username', async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'Username is required' });

    try {
        const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Protect all routes below with authentication
router.use(authenticateToken);

// CRUD routes
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
