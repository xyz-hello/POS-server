import db from '../models/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials (wrong password)' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        user_type: user.user_type,
        email: user.email,
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
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};
