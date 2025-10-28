// filepath: src/controllers/adminControllers/inventoryController.js
import { Product, Inventory } from "../../models/index.js";
import { Op } from "sequelize";

/**
 * GET /api/admin/inventory
 * Returns all products with inventory info
 */
export const getInventory = async (req, res) => {
    try {
        const whereClause =
            req.user.user_type === 1
                ? { customer_id: req.user.customer_id }
                : {};

        whereClause.status = { [Op.in]: ["ACTIVE", "INACTIVE"] };

        const products = await Product.findAll({
            where: whereClause,
            include: [{ model: Inventory, as: "inventory" }],
            order: [["createdAt", "DESC"]],
        });

        const data = products.map((p) => ({
            id: p.id,
            product_name: p.name,
            quantity: p.inventory?.quantity || 0,
            image_url: p.image_url || null,
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
            include: [{ model: Inventory, as: "inventory" }],
        });

        if (!product) return res.status(404).json({ message: "Product not found or deleted." });

        const inventory = product.inventory
            ? product.inventory
            : await Inventory.create({
                product_id: product.id,
                quantity: 0,
                customer_id: product.customer_id // Fix: set customer_id
            });

        const newQuantity = inventory.quantity + Number(quantityChange);
        if (newQuantity < 0) {
            return res.status(400).json({ message: "Inventory cannot be negative." });
        }
        await inventory.update({ quantity: newQuantity });

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
