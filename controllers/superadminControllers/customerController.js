import db from '../../models/db.js';

// Get all customers
export const getCustomers = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers');
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ message: 'Server error while fetching customers.' });
  }
};

// Delete a customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ message: 'Server error while deleting customer.' });
  }
};

// Update a customer
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, system_type, status } = req.body;

  if (!name || !system_type || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE customers SET name = ?, system_type = ?, status = ? WHERE id = ?',
      [name, system_type, status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({ message: 'Customer updated successfully.' });
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ message: 'Server error while updating customer.' });
  }
};

// Create a new customer
export const createCustomer = async (req, res) => {
  const { name, system_type, status } = req.body;

  if (!name || !system_type || !status) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO customers (name, system_type, status) VALUES (?, ?, ?)',
      [name, system_type, status]
    );

    res.status(201).json({ message: 'Customer added successfully.', customerId: result.insertId });
  } catch (err) {
    console.error('Error adding customer:', err.message);
    res.status(500).json({ message: 'Server error while adding customer.' });
  }
};
