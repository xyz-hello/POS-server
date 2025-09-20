// filepath: src/controllers/adminControllers/inventoryController.js
import { Product, Inventory } from "../../models/index.js";
import { Op } from "sequelize";

/**
 * GET /api/admin/inventory
 * Returns all products with inventory, including image_url
 */
export const getInventory = async (req, res) => {
    try {
        const whereClause =
            req.user.user_type === 1
                ? { customer_id: req.user.customer_id }
                : {};

        // Only ACTIVE or INACTIVE products
        whereClause.status = { [Op.in]: ["ACTIVE", "INACTIVE"] };

        const products = await Product.findAll({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
            order: [["createdAt", "DESC"]],
        });

        // Map products to send necessary fields to frontend
        const data = products.map((p) => ({
            id: p.id,
            product_name: p.name,
            quantity: p.Inventory?.quantity || 0,
            image_url: p.image_url || null, // include image
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

        const whereClause =
            req.user.user_type === 1
                ? { id: productId, customer_id: req.user.customer_id }
                : { id: productId };

        whereClause.status = { [Op.in]: ["ACTIVE", "INACTIVE"] };

        const product = await Product.findOne({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
        });

        if (!product) return res.status(404).json({ message: "Product not found or deleted." });

        const inventory = product.Inventory
            ? product.Inventory
            : await Inventory.create({ product_id: product.id, quantity: 0 });

        await inventory.update({
            quantity: inventory.quantity + Number(quantityChange),
        });

        res.json({
            message: "Inventory updated",
            inventory,
            image_url: product.image_url || null,
        });
    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Failed to update inventory." });
    }
};
