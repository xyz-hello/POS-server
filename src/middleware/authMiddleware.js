// filepath: src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import db from '../config/db.mysql.config.js';
import { USER_TYPES } from '../controllers/authController.js';

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
    console.log("Raw JWT token:", token);
    console.log("Decoded JWT payload:", decoded);
    console.log("Decoded user ID:", decoded.id);

    // Fetch fresh user data from DB
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

    // Map numeric role to string
    const roleName = Object.keys(USER_TYPES).find(
      key => USER_TYPES[key] === user.user_type
    );

    // Attach full user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      user_type: user.user_type, // numeric for checks
      role: roleName,            // string for readability
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
 * Example: authorizeRole([USER_TYPES.SUPERADMIN, USER_TYPES.ADMIN])
 */
export const authorizeRole = (allowedRoles = []) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.user_type)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
  }
  next();
};

