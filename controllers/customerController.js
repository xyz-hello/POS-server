const db = require('../models/db');

const getAllCustomers = (req, res) => {
  const sql = 'SELECT id, name, status FROM customers';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Customers fetch error:', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
    res.json(results);
  });
};

module.exports = {
  getAllCustomers,
};
