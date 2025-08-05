import db from '../../models/db.js';
import bcrypt from 'bcrypt';

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

// Create a new customer and linked user account
export const createCustomer = async (req, res) => {
  const { name, system_type, status, email } = req.body;

  // Validate required fields
  if (!name || !system_type || !status) {
    return res.status(400).json({ message: 'Missing required fields (name, system_type, status).' });
  }

  try {
    // Insert customer into customers table
    const [customerResult] = await db.query(
      'INSERT INTO customers (name, system_type, status) VALUES (?, ?, ?)',
      [name, system_type, status]
    );

    const customerId = customerResult.insertId; // Newly inserted customer ID

    // Generate hashed default password
    const defaultPassword = '@dm1n';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Use provided email or fallback
    const customerEmail = email || `customer${customerId}@example.com`;

    // Generate username (e.g. "customername123")
    const username = name.toLowerCase().replace(/\s+/g, '') + customerId;

    const ADMIN_USER_TYPE = 1;

    // Insert linked user record
    await db.query(
      'INSERT INTO users (email, password, user_type, customer_id, username, status) VALUES (?, ?, ?, ?, ?, ?)',
      [customerEmail, hashedPassword, ADMIN_USER_TYPE, customerId, username, 'ACTIVE']
    );

    res.status(201).json({
      message: 'Customer and linked user created successfully.',
      customer_id: customerId,
      username,
      email: customerEmail,
    });
  } catch (err) {
    console.error('Error creating customer:', err.message);
    res.status(500).json({ message: 'Server error while creating customer.' });
  }
};

// Update customer details
export const updateCustomer = async (req, res) => {
  const { id } = req.params;
  const { name, system_type, status } = req.body;

  if (!name || !system_type || !status) {
    return res.status(400).json({ message: 'Missing required fields (name, system_type, status).' });
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

// Update customer status (ACTIVE, INACTIVE, DELETED)
export const updateCustomerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    const [result] = await db.query(
      'UPDATE customers SET status = ? WHERE id = ?',
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({ message: 'Customer status updated successfully.' });
  } catch (error) {
    console.error('Error updating customer status:', error.message);
    res.status(500).json({ message: 'Internal server error while updating status.' });
  }
};
