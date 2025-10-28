// Express route for updating user theme
import express from 'express';
import db from '../config/db.mysql.config.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
const router = express.Router();

// Update theme for logged-in user
router.put('/theme', authenticateToken, async (req, res) => {
    const { theme } = req.body;
    if (!theme) return res.status(400).json({ error: 'Theme is required' });
    try {
        console.log('Theme update request:', { theme, userId: req.user.id, userType: req.user.user_type, customerId: req.user.customer_id });
        // Exclude superadmin (user_type === 0) from persistence; acknowledge without DB write
        if (req.user.user_type === 0) {
            return res.status(200).json({ success: true, theme, note: 'Superadmin theme not persisted' });
        }
        if (!req.user.customer_id) {
            console.error('No customer_id found for user:', req.user.id);
            return res.status(400).json({ error: 'No customer_id found for user.' });
        }
        const [result] = await db.execute(
            'UPDATE customers SET theme = ? WHERE id = ?',
            [theme, req.user.customer_id]
        );
        console.log('DB update result:', result);
        if (result.affectedRows === 0) {
            console.error('Customer not found for theme update:', req.user.customer_id);
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ success: true, theme });
    } catch (err) {
        console.error('Theme update error:', err);
        res.status(500).json({ error: 'Failed to update theme', details: err.message });
    }
});

// Get theme for logged-in user
router.get('/theme', authenticateToken, async (req, res) => {
    try {
        const { user_type, customer_id, id } = req.user || {};
        // Exclude superadmin (user_type === 0) from theme scoping; return default
        if (user_type === 0) {
            return res.status(200).json({ theme: 'navy' });
        }
        // Optionally, support ?customerId=123 to inspect a specific customer's theme for non-superadmin (guarded)
        const requestedCid = req.query.customerId ? Number(req.query.customerId) : undefined;
        const cid = customer_id || requestedCid;

        if (!cid) {
            console.log('GET /api/user/theme: no customer_id; returning default for user', id);
            return res.status(200).json({ theme: 'navy' });
        }

        const [rows] = await db.execute(
            'SELECT theme FROM customers WHERE id = ?',
            [cid]
        );
        const theme = rows.length ? rows[0].theme : null;
        console.log(`Customer ${cid} theme in use:`, theme);
        return res.json({ theme: theme || 'navy' });
    } catch (err) {
        console.error('Failed to get theme:', err);
        return res.status(500).json({ error: 'Failed to get theme', details: err.message });
    }
});

// Get logo for logged-in user
router.get('/logo', authenticateToken, async (req, res) => {
    try {
        const { customer_id } = req.user;
        if (!customer_id) {
            return res.status(400).json({ error: 'No customer_id found for user.' });
        }
        const [rows] = await db.execute('SELECT logo FROM customers WHERE id = ?', [customer_id]);
        if (!rows.length || !rows[0].logo) {
            return res.status(404).json({ error: 'Logo not found.' });
        }
        const logoUrl = `/uploads/${rows[0].logo}`;
        res.json({ logo: logoUrl });
    } catch (err) {
        console.error('Failed to get logo:', err);
        res.status(500).json({ error: 'Failed to get logo', details: err.message });
    }
});

export default router;
