import express from "express";
import pool from "../../config/db.mysql.config.js";
import { authenticateToken } from "../../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/pos/products
router.get("/products", authenticateToken, async (req, res) => {
  try {
    const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

    // Fetch all products for this customer, regardless of stock
    const [rows] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        i.quantity AS stock,
        p.image_url AS image,
        p.description
      FROM Products p
      JOIN Inventories i ON p.id = i.product_id
      WHERE p.customer_id = ?
      ORDER BY p.name ASC
    `, [req.user.customer_id]); // filter by owner

    const products = rows.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      stock: Number(p.stock) || 0, // keep stock to show out-of-stock in frontend
      image: p.image ? `${backendUrl}/uploads/${p.image}` : null,
      description: p.description,
    }));

    res.json(products);
  } catch (err) {
    console.error("Error fetching POS products:", err);
    res.status(500).json({ message: "Error fetching POS products" });
  }
});

export default router;
