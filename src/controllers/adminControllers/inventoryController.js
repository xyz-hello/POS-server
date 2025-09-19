// filepath: src/controllers/adminControllers/inventoryController.js
import { Product, Inventory } from "../../models/index.js";
import { Op } from "sequelize";

/**
 * GET /api/admin/inventory
 * Return all products with their inventory (excluding deleted)
 */
export const getInventory = async (req, res) => {
    try {
        // Build base where clause
        const whereClause =
            req.user.user_type === 1
                ? { customer_id: req.user.customer_id }
                : {};

        // Only include ACTIVE or INACTIVE products
        whereClause.status = {
            [Op.in]: ["ACTIVE", "INACTIVE"],
        };

        const products = await Product.findAll({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
            order: [["createdAt", "DESC"]],
        });

        // Map products for frontend table
        const data = products.map((p) => ({
            id: p.id,
            product_name: p.name,
            quantity: p.Inventory?.quantity || 0,
        }));

        res.json(data);
    } catch (err) {
        console.error("Fetch inventory error:", err);
        res.status(500).json({ message: "Failed to fetch inventory." });
    }
};

/**
 * PUT /api/admin/inventory/:productId
 * Adjust inventory quantity
 */
export const updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantityChange } = req.body;

        // Admin must match customer_id, superadmin can update any
        const whereClause =
            req.user.user_type === 1
                ? { id: productId, customer_id: req.user.customer_id }
                : { id: productId };

        // Only allow updates if product is ACTIVE or INACTIVE
        whereClause.status = {
            [Op.in]: ["ACTIVE", "INACTIVE"],
        };

        const product = await Product.findOne({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
        });

        if (!product) return res.status(404).json({ message: "Product not found or deleted." });

        // If inventory doesn’t exist, create it
        const inventory = product.Inventory
            ? product.Inventory
            : await Inventory.create({ product_id: product.id, quantity: 0 });

        // Update quantity safely
        await inventory.update({
            quantity: inventory.quantity + Number(quantityChange),
        });

        res.json({ message: "Inventory updated", inventory });
    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Failed to update inventory." });
    }
};
