import bcrypt from 'bcrypt';
import db from '../../models/db.js';

// Validation regexes
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,14}$/;

// Map roles to user_type integers
const roleMap = {
    SuperAdmin: 0,
    Admin: 1,
    Cashier: 2,
    Manager: 3,
};

// GET users — filter by customer_id unless SuperAdmin
export const getUsers = async (req, res) => {
    try {
        let query = `SELECT id, username, email, user_type, status, customer_id 
                     FROM users 
                     WHERE status != "DELETED"`;
        const params = [];

        if (req.user.user_type !== roleMap.SuperAdmin) {
            // Filter to only users under the same customer_id
            query += ' AND customer_id = ?';
            params.push(req.user.customer_id);

            // Only allow cashier and manager roles for non-superadmin users
            query += ' AND user_type IN (?, ?)';
            params.push(roleMap.Cashier, roleMap.Manager);
        }

        const [rows] = await db.query(query, params);

        res.status(200).json({
            success: true,
            data: rows.map(user => ({
                ...user,
                role: Object.keys(roleMap).find(key => roleMap[key] === user.user_type) || 'Unknown',
            })),
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
};

// CREATE user
export const createUser = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;

        if (!username || !email || !role || !password) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email.' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                message: 'Password must be 6-14 chars, include uppercase, lowercase, number, and symbol.',
            });
        }

        const user_type = roleMap[role];
        if (user_type === undefined) {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const customer_id = req.user.customer_id || null;
        const created_by = req.user.id;

        await db.query(
            `INSERT INTO users (username, email, user_type, password, status, customer_id, created_by)
       VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)`,
            [username, email, user_type, hashedPassword, customer_id, created_by]
        );

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

// UPDATE user
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, role, password } = req.body;

        const [targetUsers] = await db.query('SELECT customer_id FROM users WHERE id = ?', [userId]);
        if (targetUsers.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const targetCustomerId = targetUsers[0].customer_id;

        if (req.user.user_type !== roleMap.SuperAdmin && targetCustomerId !== req.user.customer_id) {
            return res.status(403).json({ message: 'Unauthorized to update this user.' });
        }

        if (!username || !email || !role) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email.' });
        }

        const user_type = roleMap[role];
        if (user_type === undefined) {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        const [existing] = await db.query(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username or email already in use.' });
        }

        let query, params;

        if (password) {
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message: 'Password must be 6-14 chars, include uppercase, lowercase, number, and symbol.',
                });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET username = ?, email = ?, user_type = ?, password = ? WHERE id = ?';
            params = [username, email, user_type, hashedPassword, userId];
        } else {
            query = 'UPDATE users SET username = ?, email = ?, user_type = ? WHERE id = ?';
            params = [username, email, user_type, userId];
        }

        await db.query(query, params);
        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

// SOFT DELETE user
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        const [targetUsers] = await db.query('SELECT customer_id FROM users WHERE id = ?', [userId]);
        if (targetUsers.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }
        const targetCustomerId = targetUsers[0].customer_id;

        if (req.user.user_type !== roleMap.SuperAdmin && targetCustomerId !== req.user.customer_id) {
            return res.status(403).json({ message: 'Unauthorized to delete this user.' });
        }

        await db.query('UPDATE users SET status = ? WHERE id = ?', ['DELETED', userId]);
        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};
