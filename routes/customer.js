const express = require('express');
const router = express.Router();
const db = require('../models/db');

// CREATE: POST /api/customers
router.post('/', (req, res) => {
  const { name, system_type, status } = req.body;

  if (!name || !system_type || !status) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const query = 'INSERT INTO customers (name, system_type, status) VALUES (?, ?, ?)';
  db.query(query, [name, system_type, status], (err, result) => {
    if (err) {
      console.error('Insert error:', err);
      return res.status(500).json({ error: 'Failed to add customer' });
    }

    res.status(201).json({ id: result.insertId, name, system_type, status });
  });
});

// READ: GET /api/customers
router.get('/', (req, res) => {
  db.query('SELECT * FROM customers', (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch customers' });
    res.json(results);
  });
});

// UPDATE: PUT /api/customers/:id
router.put('/:id', (req, res) => {
  const { name, system_type, status } = req.body;
  const { id } = req.params;

  const query = 'UPDATE customers SET name = ?, system_type = ?, status = ? WHERE id = ?';
  db.query(query, [name, system_type, status, id], (err, result) => {
    if (err) {
      console.error('Update error:', err);
      return res.status(500).json({ error: 'Failed to update customer' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ id, name, system_type, status });
  });
});

// DELETE: DELETE /api/customers/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM customers WHERE id = ?';
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Failed to delete customer' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, message: 'Customer deleted' });
  });
});

module.exports = router;
