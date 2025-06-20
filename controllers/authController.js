const db = require('../models/db');

const loginUser = (req, res) => {
  const { username, password } = req.body;

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error('❌ Login error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      res.json({ message: 'Login success' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
};

module.exports = {
  loginUser
};
