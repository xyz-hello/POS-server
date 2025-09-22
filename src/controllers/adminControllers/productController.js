// filepath: src/controllers/adminControllers/productController.js
import { Product, Inventory } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";
import { Op } from "sequelize";

// ---------------- Helper ----------------
function generateProductCode(name) {
    const first3 = name.slice(0, 3).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${first3}-${date}-${uuidv4().slice(0, 4)}`;
}

function buildWhereClause(user, extraConditions = {}) {
    const baseWhere = { status: { [Op.ne]: "DELETED" }, ...extraConditions };
    return user.user_type === 1
        ? { ...baseWhere, customer_id: user.customer_id }
        : baseWhere;
}

// ---------------- Controllers ----------------

// Get all products (with inventory)
export const getProducts = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || 20;
        const page = parseInt(req.query.page, 10) || 1;
        const offset = (page - 1) * limit;

        const products = await Product.findAll({
            where: buildWhereClause(req.user),
            include: [{ model: Inventory, as: "inventory" }], // ✅ lowercase alias
            order: [["createdAt", "DESC"]],
            limit,
            offset,
        });

        res.json(products);
    } catch (err) {
        console.error("Get products error:", err);
        res.status(500).json({ message: "Failed to fetch products." });
    }
};

// Create product with optional inventory
export const createProduct = async (req, res) => {
    try {
        const { name, price, unit_type, description, initialQuantity } = req.body;

        if (req.user.user_type === 1 && !req.user.customer_id) {
            return res.status(400).json({ message: "Admin is not linked to a customer." });
        }

        const product = await Product.create({
            name,
            price,
            unit_type,
            description,
            image_url: req.file ? req.file.filename : null,
            product_code: generateProductCode(name),
            customer_id: req.user.user_type === 1 ? req.user.customer_id : null,
        });

        if (initialQuantity !== undefined) {
            await Inventory.create({
                product_id: product.id,
                quantity: Number(initialQuantity),
            });
        }

        res.status(201).json({ message: "Product created", product });
    } catch (err) {
        console.error("Create product error:", err);
        res.status(500).json({ message: "Failed to create product." });
    }
};

// Update product
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ where: buildWhereClause(req.user, { id }) });

        if (!product) return res.status(404).json({ message: "Product not found or access denied." });

        const { name, price, unit_type, description } = req.body;
        const image_url = req.file ? req.file.filename : product.image_url;

        await product.update({ name, price, unit_type, description, image_url });
        res.json({ message: "Product updated", product });
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ message: "Failed to update product." });
    }
};

// Update inventory for a product
export const updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantityChange } = req.body;

        const product = await Product.findOne({
            where: buildWhereClause(req.user, { id: productId }),
            include: [{ model: Inventory, as: "inventory" }], // ✅ correct alias
        });

        if (!product) return res.status(404).json({ message: "Product not found." });

        const inventory = product.inventory
            ? product.inventory
            : await Inventory.create({ product_id: product.id, quantity: 0 });

        await inventory.update({
            quantity: inventory.quantity + Number(quantityChange),
        });

        res.json({ message: "Inventory updated", inventory });
    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Failed to update inventory." });
    }
};

// Soft delete product
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findOne({
            where: buildWhereClause(req.user, { id }),
            include: [{ model: Inventory, as: "inventory" }], // ✅ correct alias
        });

        if (!product) return res.status(404).json({ message: "Product not found or access denied." });

        await product.update({ status: "DELETED" });

        if (product.inventory) await product.inventory.update({ quantity: 0 });

        res.json({ message: "Product deleted (soft delete)", product });
    } catch (err) {
        console.error("Delete product error:", err);
        res.status(500).json({ message: "Failed to delete product." });
    }
};
