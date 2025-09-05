import { Product, Inventory } from "../../models/index.js";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// ---------------- Helper: generate product code ----------------
function generateProductCode(name) {
    const first3 = name.slice(0, 3).toUpperCase();
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `${first3}-${date}-${uuidv4().slice(0, 4)}`;
}

// ---------------- Helper: get full image URL ----------------
function getFullImageUrl(req, filePath) {
    if (!filePath) return null;
    // Use basename to avoid sending full server path
    return `${req.protocol}://${req.get("host")}/uploads/${path.basename(filePath)}`;
}

// ---------------- GET /api/admin/products ----------------
export const getProducts = async (req, res) => {
    try {
        const products = await Product.findAll({
            include: [Inventory],
        });

        // Map products to include full image URLs
        const productsWithUrl = products.map((p) => ({
            ...p.toJSON(),
            image: getFullImageUrl(req, p.image_url),
        }));

        res.json(productsWithUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error fetching products" });
    }
};

// ---------------- POST /api/admin/products ----------------
export const createProduct = async (req, res) => {
    const t = await Product.sequelize.transaction();
    try {
        const { name, description, price, unit_type } = req.body;
        if (!name || !price || !unit_type) throw new Error("Missing required fields");

        const productCode = generateProductCode(name);

        // Create product with optional image
        const product = await Product.create(
            {
                product_code: productCode,
                name,
                description,
                price,
                unit_type,
                image_url: req.file ? req.file.path : null,
            },
            { transaction: t }
        );

        // Initialize inventory
        await Inventory.create({ product_id: product.id, quantity: 0 }, { transaction: t });

        await t.commit();

        // Return product with full image URL
        const result = { ...product.toJSON(), image: getFullImageUrl(req, product.image_url) };
        res.status(201).json({ message: "Product created successfully", product: result });
    } catch (err) {
        await t.rollback();
        console.error(err);
        res.status(500).json({ error: err.message || "Server error creating product" });
    }
};

// ---------------- PUT /api/admin/products/:id ----------------
export const updateProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByPk(id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        const { name, description, price, unit_type } = req.body;

        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.unit_type = unit_type ?? product.unit_type;

        if (req.file?.path) product.image_url = req.file.path;

        await product.save();

        // Return product with full image URL
        const result = { ...product.toJSON(), image: getFullImageUrl(req, product.image_url) };
        res.json({ message: "Product updated successfully", product: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error updating product" });
    }
};

// ---------------- PATCH /api/admin/products/:productId/inventory ----------------
export const updateInventory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { action, amount } = req.body;

        if (!["increment", "decrement"].includes(action))
            return res.status(400).json({ error: "Invalid action" });

        if (!amount || isNaN(amount) || amount <= 0)
            return res.status(400).json({ error: "Amount must be positive" });

        const inventory = await Inventory.findOne({ where: { product_id: productId } });
        if (!inventory) return res.status(404).json({ error: "Inventory not found" });

        inventory.quantity =
            action === "increment"
                ? inventory.quantity + Number(amount)
                : Math.max(inventory.quantity - Number(amount), 0);

        await inventory.save();
        res.json({ message: "Inventory updated", inventory });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error updating inventory" });
    }
};
