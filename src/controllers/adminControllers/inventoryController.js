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
                ? {}
                : { customer_id: req.user.customer_id };

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

        const product = await Product.findOne({
            where:
                req.user.user_type === "superadmin"
                    ? { id: productId }
                    : { id: productId, customer_id: req.user.customer_id },
            include: [{ model: Inventory, as: "Inventory" }],
        });

        if (!product) return res.status(404).json({ message: "Product not found." });

        // If inventory doesn’t exist, create it
        const inventory = product.Inventory
            ? product.Inventory
            : await Inventory.create({ product_id: product.id, quantity: 0 });

        // Update quantity
        await inventory.update({ quantity: inventory.quantity + Number(quantityChange) });

        res.json({ message: "Inventory updated", inventory });
    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Failed to update inventory." });
    }
};
