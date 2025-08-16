import db from '../../models/db.js';
import bcrypt from 'bcrypt';

// ===================
// Customer Controllers
// ===================

// GET all customers
export const getCustomers = async (req, res) => {
  try {
    const [customers] = await db.query('SELECT * FROM customers');
    res.status(200).json(customers);
  } catch (err) {
    console.error('Error fetching customers:', err.message);
    res.status(500).json({ message: 'Server error while fetching customers.' });
  }
};

// CREATE a new customer with linked user
export const createCustomer = async (req, res) => {
  const { name, system_type, status, email } = req.body;
  const creatorId = req.user.id;

  if (!name || !system_type || !status) {
    return res.status(400).json({ message: 'Missing required fields (name, system_type, status).' });
  }

  try {
    // Insert customer
    const [customerResult] = await db.query(
      'INSERT INTO customers (name, system_type, status) VALUES (?, ?, ?)',
      [name, system_type, status]
    );
    const customerId = customerResult.insertId;

    // Create linked user
    const hashedPassword = await bcrypt.hash('@dm1n', 10);
    const username = name.toLowerCase().replace(/\s+/g, '') + customerId;
    const customerEmail = email || `customer${customerId}@example.com`;
    const ADMIN_USER_TYPE = 1;

    await db.query(
      `INSERT INTO users (email, password, user_type, customer_id, username, status, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customerEmail, hashedPassword, ADMIN_USER_TYPE, customerId, username, 'ACTIVE', creatorId]
    );

    // Action-level log
    console.log(`Customer created: ID=${customerId}, name=${name}, by user=${creatorId}`);

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

// UPDATE customer details
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

    console.log(`Customer updated: ID=${id}, by user=${req.user.id}`);

    res.status(200).json({ message: 'Customer updated successfully.' });
  } catch (err) {
    console.error('Error updating customer:', err.message);
    res.status(500).json({ message: 'Server error while updating customer.' });
  }
};

// DELETE customer
export const deleteCustomer = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db.query('DELETE FROM customers WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    console.log(`Customer deleted: ID=${id}, by user=${req.user.id}`);

    res.status(200).json({ message: 'Customer deleted successfully.' });
  } catch (err) {
    console.error('Error deleting customer:', err.message);
    res.status(500).json({ message: 'Server error while deleting customer.' });
  }
};

// UPDATE customer status and linked users
export const updateCustomerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Update customer
    const [customerResult] = await connection.query(
      'UPDATE customers SET status = ? WHERE id = ?',
      [status, id]
    );

    if (customerResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // Update linked users
    const [userResult] = await connection.query(
      'UPDATE users SET status = ? WHERE customer_id = ?',
      [status, id]
    );

    await connection.commit();

    console.log(`Customer status updated: ID=${id}, status=${status}, by user=${req.user.id}, users updated=${userResult.affectedRows}`);

    res.status(200).json({
      message: 'Customer and linked users status updated successfully.',
      usersUpdated: userResult.affectedRows,
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating customer status:', error.message);
    res.status(500).json({ message: 'Internal server error while updating status.' });
  } finally {
    connection.release();
  }
};
