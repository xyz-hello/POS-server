// filepath: src/controllers/authController.js
import db from '../config/db.mysql.config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { addToken, removeToken, hasToken } from '../utils/refresh.token.store.js';

export const USER_TYPES = {
  SUPERADMIN: 0,
  ADMIN: 1,
  CUSTOMER_USER: 2,
};

// ---------------- Login ----------------
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid credentials.' });

    const user = rows[0];

    if (user.status === 'DELETED') {
      return res.status(403).json({ message: 'User account has been deleted.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

    // Check customer linkage for admin
    if (user.user_type !== USER_TYPES.SUPERADMIN) {
      if (!user.customer_id) {
        return res.status(400).json({ message: 'User is not linked to a customer account.' });
      }
      const [customerRows] = await db.execute('SELECT status FROM customers WHERE id = ?', [user.customer_id]);
      if (!customerRows.length) return res.status(404).json({ message: 'Associated customer not found.' });
      if (customerRows[0].status !== 'ACTIVE') return res.status(403).json({ message: 'Customer account is not active.' });
    }

    // ---------------- Tokens ----------------
    const accessToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
        customer_id: user.customer_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' } // short-lived
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' } // long-lived
    );

    // Store refresh token
    addToken(refreshToken);

    res.status(200).json({
      message: 'Login successful',
      accessToken,
      refreshToken,
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

// ---------------- Refresh Access Token ----------------
export const refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: 'Refresh token missing.' });

  if (!hasToken(token)) return res.status(403).json({ message: 'Refresh token invalid or revoked.' });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    // Issue new access token
    const accessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ accessToken });
  } catch (err) {
    console.error('Refresh token error:', err.message);
    res.status(403).json({ message: 'Invalid or expired refresh token.' });
  }
};

// ---------------- Logout ----------------
export const logout = (req, res) => {
  const { token } = req.body;
  if (token) removeToken(token);
  res.json({ message: 'Logged out successfully' });
};
