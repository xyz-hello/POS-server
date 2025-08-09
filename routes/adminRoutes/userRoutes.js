import express from 'express';
import db from '../../models/db.js';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
} from '../../controllers/adminControllers/UserController.js';

const router = express.Router();

// CRUD routes
router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Check if username exists (query param ?username=)
router.get('/check-username', async (req, res) => {
    const username = req.query.username?.trim().toLowerCase();

    if (!username) {
        return res.status(400).json({ message: 'Username query parameter is required.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id FROM users WHERE LOWER(username) = ?',
            [username]
        );
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Error checking username existence:', error);
        res.status(500).json({ message: 'Server error checking username.' });
    }
});

// Check if email exists (query param ?email=)
router.get('/check-email', async (req, res) => {
    const email = req.query.email?.trim().toLowerCase();

    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required.' });
    }

    try {
        const [rows] = await db.query(
            'SELECT id FROM users WHERE LOWER(email) = ?',
            [email]
        );
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        console.error('Error checking email existence:', error);
        res.status(500).json({ message: 'Server error checking email.' });
    }
});

export default router;
