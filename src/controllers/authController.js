import db from '../config/db.mysql.config.js'; //MYSQL connection 
import bcrypt from 'bcrypt'; //hashing PW
import jwt from 'jsonwebtoken'; //JWT creation

// Define user roles
export const USER_TYPES = {
  SUPERADMIN: 0, // top-level privileges
  ADMIN: 1,      // manage users, settings
  MANAGER: 2,    // mid-level management
  CASHIER: 3,    // POS operations only
  CUSTOMER_USER: 4 // linked to customer account
};

/**
 * Login controller
 * Validates user credentials, checks customer status (if not superadmin),
 * and returns JWT token + user info
 */
export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Fetch user by username
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    if (user.status === 'DELETED') {
      return res.status(403).json({ message: 'User account has been deleted.' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Non-superadmins must be linked to an active customer
    if (user.user_type !== USER_TYPES.SUPERADMIN) {
      if (!user.customer_id) {
        return res.status(400).json({ message: 'User is not linked to a customer account.' });
      }

      const [customerRows] = await db.execute(
        'SELECT status FROM customers WHERE id = ?',
        [user.customer_id]
      );

      if (customerRows.length === 0) {
        return res.status(404).json({ message: 'Associated customer not found.' });
      }

      if (customerRows[0].status !== 'ACTIVE') {
        return res.status(403).json({ message: 'Customer account is not active.' });
      }
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
        customer_id: user.customer_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24hr' }
    );

    // Map numeric role to string for frontend readability
    const roleName = Object.keys(USER_TYPES).find(
      key => USER_TYPES[key] === user.user_type
    );

    // Send response
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        user_type: user.user_type, // numeric for backend checks
        role: roleName,            // string for frontend (e.g., "ADMIN")
        email: user.email,
        customer_id: user.customer_id || null,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
