import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Define user roles
export const USER_TYPES = {
  SUPERADMIN: 0,
  ADMIN: 1,
  CUSTOMER_USER: 2,
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    if (user.status === 'DELETED') {
      return res.status(403).json({ message: 'User account has been deleted.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Use the constant from USER_TYPES object here
    if (user.user_type !== USER_TYPES.SUPERADMIN) {
      if (!user.customer_id) {
        return res.status(400).json({ message: 'User is not linked to a customer account.' });
      }

      const [customerRows] = await db.execute('SELECT status FROM customers WHERE id = ?', [user.customer_id]);
      if (customerRows.length === 0) {
        return res.status(404).json({ message: 'Associated customer not found.' });
      }

      if (customerRows[0].status !== 'ACTIVE') {
        return res.status(403).json({ message: 'Customer account is not active.' });
      }
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
        customer_id: user.customer_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
        customer_id: user.customer_id || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
