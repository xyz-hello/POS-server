// filepath: src/controllers/adminControllers/productController.js
import { Product, Inventory } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";

// ---------------- Helper ----------------
function generateProductCode(name) {
    const first3 = name.slice(0, 3).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${first3}-${date}-${uuidv4().slice(0, 4)}`;
}

// ---------------- Get all products ----------------
export const getProducts = async (req, res) => {
    try {
        // Admin (role = 1) → only see their own products
        const whereClause =
            req.user.user_type === 1
                ? { customer_id: req.user.customer_id }
                : {};

        const products = await Product.findAll({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
            order: [["createdAt", "DESC"]],
        });

        res.json(products);
    } catch (err) {
        console.error("Get products error:", err);
        res.status(500).json({ message: "Failed to fetch products." });
    }
};

// ---------------- Create product ----------------
export const createProduct = async (req, res) => {
    try {
        const { name, price, unit_type, description, initialQuantity } = req.body;

        // Admin must always have a customer_id
        if (req.user.user_type === 1 && !req.user.customer_id) {
            return res
                .status(400)
                .json({ message: "Admin is not linked to a customer." });
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

// ---------------- Update product ----------------
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const whereClause =
            req.user.user_type === 1
                ? { id, customer_id: req.user.customer_id }
                : { id };

        const product = await Product.findOne({ where: whereClause });

        if (!product) {
            return res
                .status(404)
                .json({ message: "Product not found or access denied." });
        }

        const { name, price, unit_type, description } = req.body;
        const image_url = req.file ? req.file.filename : product.image_url;

        await product.update({ name, price, unit_type, description, image_url });
        res.json({ message: "Product updated", product });
    } catch (err) {
        console.error("Update product error:", err);
        res.status(500).json({ message: "Failed to update product." });
    }
};

// ---------------- Update inventory ----------------
export const updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantityChange } = req.body;

        const whereClause =
            req.user.user_type === 1
                ? { id: productId, customer_id: req.user.customer_id }
                : { id: productId };

        const product = await Product.findOne({
            where: whereClause,
            include: [{ model: Inventory, as: "Inventory" }],
        });

        if (!product || !product.Inventory) {
            return res.status(404).json({ message: "Product or inventory not found." });
        }

        await product.Inventory.update({
            quantity: product.Inventory.quantity + Number(quantityChange),
        });

        res.json({ message: "Inventory updated", inventory: product.Inventory });
    } catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ message: "Failed to update inventory." });
    }
};
