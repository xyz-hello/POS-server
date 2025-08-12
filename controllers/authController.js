import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { username, password } = req.body;

  // Basic input validation
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    // Fetch user by username; parameterized query prevents SQL injection
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND status != "DELETED"', [username]);

    // If user not found, send generic invalid credentials message (avoid user enumeration)
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const user = rows[0];

    // Compare hashed password with plain password from request
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Sign JWT token with user info needed for authorization
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
        customer_id: user.customer_id, // include customer_id for role-based filtering
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send token and user info back to client (omit password)
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
        customer_id: user.customer_id,
      },
    });
  } catch (error) {
    // Log error server-side for debugging
    console.error('Login error:', error);

    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
