import express from "express";
import pool from "../../config/db.mysql.config.js"; // MySQL2 pool

const router = express.Router();

// GET /api/pos/products
router.get("/products", async (req, res) => {
    try {
        const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";

        const [rows] = await pool.query(`
            SELECT 
              p.name, 
              p.price, 
              i.quantity AS stock, 
              p.image_url AS image, 
              p.description
            FROM Products p
            JOIN Inventories i ON p.id = i.product_id
            WHERE i.quantity > 0
            ORDER BY p.name ASC
        `);

        // Transform data for frontend
        const products = rows.map(p => ({
            ...p,
            price: Number(p.price) || 0, // ensure numeric
            image: p.image ? `${backendUrl}/uploads/${p.image}` : null,
        }));

        res.json(products);
    } catch (err) {
        console.error("Error fetching POS products:", err);
        res.status(500).json({ message: "Error fetching POS products" });
    }
});

export default router;
