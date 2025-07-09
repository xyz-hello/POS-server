const express = require('express');
const router = express.Router();
const db = require('../models/db');

// POST /api/customers
router.post('/', (req, res) => {
  const { name, systemType, status } = req.body;

  if (!name || !systemType || !status) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const query = 'INSERT INTO customers (name, system_type, status) VALUES (?, ?, ?)';
  db.query(query, [name, systemType, status], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Failed to add customer' });
    }

    res.status(201).json({ id: result.insertId, name, system_type: systemType, status });
  });
});

// GET /api/customers
router.get('/', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch customers' });
    res.json(results);
  });
});

module.exports = router;
