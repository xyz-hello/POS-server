import express from 'express';
import db from '../../models/db.js';

const router = express.Router();

/**
 * GET all cashiers for Admin
 * URL: GET /api/admin/users
 */
router.get('/', async (req, res) => {
    try {
        // Fetch only cashiers (role 2)
        const [rows] = await db.query(
            'SELECT id, username, email, status, user_type FROM users WHERE user_type = ?',
            [2]
        );

        res.status(200).json({
            success: true,
            data: rows.map(user => ({
                ...user,
                role: 'Cashier' // Always label as Cashier for clarity
            }))
        });
    } catch (err) {
        console.error('Error fetching cashiers:', err);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
});

export default router;
