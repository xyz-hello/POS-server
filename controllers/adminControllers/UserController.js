import bcrypt from 'bcrypt';
import db from '../../models/db.js';

// Validation regexes
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,14}$/;

// Map roles to user_type integers — adjust per your system
const roleMap = {
    Admin: 1,
    Cashier: 2,
    Manager: 3,
    SuperAdmin: 4,
};

// Get all users (modify query/filter if needed)
export const getUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, email, user_type, status FROM users WHERE status != "DELETED"'
        );
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

// Create new user
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
                message:
                    'Password must be 6-14 characters and include uppercase, lowercase, number, and symbol.',
            });
        }

        const user_type = roleMap[role];
        if (!user_type) {
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

        await db.query(
            'INSERT INTO users (username, email, user_type, password, status) VALUES (?, ?, ?, ?, ?)',
            [username, email, user_type, hashedPassword, 'ACTIVE']
        );

        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { username, email, role, password } = req.body;

        if (!username || !email || !role) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email.' });
        }

        const user_type = roleMap[role];
        if (!user_type) {
            return res.status(400).json({ message: 'Invalid role.' });
        }

        // Check if username/email already used by another user
        const [existing] = await db.query(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        if (existing.length > 0) {
            return res.status(409).json({ message: 'Username or email already in use.' });
        }

        let query;
        let params;

        if (password) {
            if (!passwordRegex.test(password)) {
                return res.status(400).json({
                    message:
                        'Password must be 6-14 characters and include uppercase, lowercase, number, and symbol.',
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

// Soft-delete user by setting status = 'DELETED'
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Check if user exists
        const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        await db.query('UPDATE users SET status = ? WHERE id = ?', ['DELETED', userId]);

        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};
