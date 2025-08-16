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

// ===================
// Public Routes
// ===================

// Check if username exists
export const checkUsernameAvailability = async (req, res) => {
    const { username } = req.query;

    if (!username) {
        // Client did not provide a username
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        // Query DB for existing username
        const [rows] = await db.query('SELECT id FROM users WHERE username = ?', [username]);
        // Respond whether username exists
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Check if email exists
export const checkEmailAvailability = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        // Client did not provide an email
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Query DB for existing email
        const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        // Respond whether email exists
        res.json({ exists: rows.length > 0 });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ===================
// Protected Routes
// ===================

// GET all users — filtered by customer_id unless SuperAdmin
export const getUsers = async (req, res) => {
    try {
        let query = `SELECT id, username, email, user_type, status, customer_id 
                     FROM users 
                     WHERE status != "DELETED"`;
        const params = [];

        // Non-SuperAdmin users only see their own customers and certain roles
        if (req.user.user_type !== roleMap.SuperAdmin) {
            query += ' AND customer_id = ?';
            params.push(req.user.customer_id);
            query += ' AND user_type IN (?, ?)';
            params.push(roleMap.Cashier, roleMap.Manager);
        }

        const [rows] = await db.query(query, params);

        // Map user_type integer back to role string
        res.status(200).json({
            success: true,
            data: rows.map(user => ({
                ...user,
                role: Object.keys(roleMap).find(key => roleMap[key] === user.user_type) || 'Unknown',
            })),
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch users.' });
    }
};

// CREATE user
export const createUser = async (req, res) => {
    try {
        const { username, email, role, password } = req.body;

        // Validate required fields
        if (!username || !email || !role || !password)
            return res.status(400).json({ message: 'Missing required fields.' });

        // Validate email format
        if (!emailRegex.test(email))
            return res.status(400).json({ message: 'Invalid email.' });

        // Validate password complexity
        if (!passwordRegex.test(password))
            return res.status(400).json({
                message: 'Password must be 6-14 chars, include uppercase, lowercase, number, and symbol.',
            });

        // Map role string to integer
        const user_type = roleMap[role];
        if (user_type === undefined)
            return res.status(400).json({ message: 'Invalid role.' });

        // Check if username/email already exists
        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: 'Username or email already exists.' });

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Assign customer_id and created_by from logged-in user
        const customer_id = req.user.customer_id || null;
        const created_by = req.user.id;

        // Insert user into DB
        await db.query(
            `INSERT INTO users (username, email, user_type, password, status, customer_id, created_by)
             VALUES (?, ?, ?, ?, 'ACTIVE', ?, ?)`,
            [username, email, user_type, hashedPassword, customer_id, created_by]
        );

        // Respond success
        res.status(201).json({ message: 'User created successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create user.' });
    }
};

// UPDATE user
export const updateUser = async (req, res) => {
    const userId = req.params.id;
    try {
        const { username, email, role, password } = req.body;

        // Fetch the target user's customer_id
        const [targetUsers] = await db.query('SELECT customer_id FROM users WHERE id = ?', [userId]);
        if (targetUsers.length === 0)
            return res.status(404).json({ message: 'User not found.' });
        const targetCustomerId = targetUsers[0].customer_id;

        // Authorization: non-SuperAdmin cannot update users outside their customer
        if (req.user.user_type !== roleMap.SuperAdmin && targetCustomerId !== req.user.customer_id)
            return res.status(403).json({ message: 'Unauthorized to update this user.' });

        // Validate required fields
        if (!username || !email || !role)
            return res.status(400).json({ message: 'Missing required fields.' });

        if (!emailRegex.test(email))
            return res.status(400).json({ message: 'Invalid email.' });

        const user_type = roleMap[role];
        if (user_type === undefined)
            return res.status(400).json({ message: 'Invalid role.' });

        // Check for username/email conflicts
        const [existing] = await db.query(
            'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
            [username, email, userId]
        );
        if (existing.length > 0)
            return res.status(409).json({ message: 'Username or email already in use.' });

        let query, params;
        if (password) {
            if (!passwordRegex.test(password))
                return res.status(400).json({
                    message: 'Password must be 6-14 chars, include uppercase, lowercase, number, and symbol.',
                });
            const hashedPassword = await bcrypt.hash(password, 10);
            query = 'UPDATE users SET username = ?, email = ?, user_type = ?, password = ? WHERE id = ?';
            params = [username, email, user_type, hashedPassword, userId];
        } else {
            query = 'UPDATE users SET username = ?, email = ?, user_type = ? WHERE id = ?';
            params = [username, email, user_type, userId];
        }

        // Update user in DB
        await db.query(query, params);

        res.json({ message: 'User updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user.' });
    }
};

// SOFT DELETE user
export const deleteUser = async (req, res) => {
    const userId = req.params.id;
    try {
        // Fetch target user's customer_id
        const [targetUsers] = await db.query('SELECT customer_id FROM users WHERE id = ?', [userId]);
        if (targetUsers.length === 0)
            return res.status(404).json({ message: 'User not found.' });
        const targetCustomerId = targetUsers[0].customer_id;

        // Authorization: non-SuperAdmin cannot delete users outside their customer
        if (req.user.user_type !== roleMap.SuperAdmin && targetCustomerId !== req.user.customer_id)
            return res.status(403).json({ message: 'Unauthorized to delete this user.' });

        // Soft delete by updating status
        await db.query('UPDATE users SET status = ? WHERE id = ?', ['DELETED', userId]);

        res.json({ message: 'User deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user.' });
    }
};

// UPDATE user status (ACTIVE / INACTIVE / DELETED)
export const updateUserStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: 'Status is required.' });
    }

    try {
        const [result] = await db.query(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({
            message: 'User status updated successfully.',
            userId: id,
            status,
        });
    } catch (error) {
        console.error('Error updating user status:', error.message);
        res.status(500).json({ message: 'Internal server error while updating status.' });
    }
};
