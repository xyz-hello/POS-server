// controllers/authController.js
const db = require('../models/db'); // Your mysql connection pool

const loginUser = (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT username, user_type FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('❌ Login error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }

    if (results.length > 0) {
      // Map user_type integer to role string
      let role = 'user';
      const userType = results[0].user_type;

      if (userType === 0) role = 'superadmin';
      else if (userType === 1) role = 'admin';

      return res.json({ success: true, role, message: 'Login success' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });
};

module.exports = {
  loginUser,
};
