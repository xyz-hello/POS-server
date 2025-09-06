// filepath: src/controllers/adminControllers/inventoryController.js
import { Product, Inventory } from "../../models/index.js";

/**
 * GET /api/admin/inventory
 * Return all products with their inventory
 */
export const getInventory = async (req, res) => {
    try {
        const whereClause =
            req.user.user_type === "superadmin"
                ? {} // superadmin sees all products
                : { customer_id: req.user.customer_id }; // admin sees only their products

        const products = await Product.findAll({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
            order: [["createdAt", "DESC"]],
        });

        res.json(products); // must be an array
    } catch (err) {
        console.error("Fetch inventory error:", err);
        res.status(500).json({ message: "Failed to fetch inventory." });
    }
};
