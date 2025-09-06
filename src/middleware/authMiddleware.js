// filepath: src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import db from '../config/db.mysql.config.js'; // MySQL2 connection for legacy users table

/**
 * Authenticate JWT token and attach user info to req.user
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user from DB to get customer_id, status, etc.
    const [rows] = await db.execute(
      'SELECT id, username, email, user_type, customer_id, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: 'User not found.' });
    }

    const user = rows[0];

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'User account inactive or deleted.' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type === 0 ? 'superadmin' : 'admin', // 0=SuperAdmin, 1=Admin
      customer_id: user.customer_id,
    };

    next();
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Role-based authorization middleware
 * Example: authorizeRole(['superadmin'])
 */
export const authorizeRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.user_type)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
  }
  next();
};
