import { PreRelease, PreReleaseItem, Product } from "../../models/index.js";
import sequelize from "../../config/db.sequelize.config.js";
import path from "path";

// POST /api/pos/pre-release
export const createPreRelease = async (req, res) => {

    // Safely extract fields from req.body (FormData fields are always strings)
    let store_id = req.body && req.body.store_id ? req.body.store_id : undefined;
    let remarks = req.body && req.body.remarks ? req.body.remarks : undefined;
    let items = req.body && req.body.items ? req.body.items : undefined;
    const user_id = req.user.id;
    let photo_url = null;

    // Handle file upload (if using multer or similar)
    if (req.file) {
        photo_url = `/uploads/${req.file.filename}`;
    }

    // Parse items if sent as JSON string (from FormData)
    if (typeof items === 'string') {
        try { items = JSON.parse(items); } catch { items = []; }
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Items are required" });
    }

    const t = await sequelize.transaction();
    try {
        // 1. Create PreRelease
        const preRelease = await PreRelease.create({
            user_id,
            store_id,
            remarks,
            photo_url,
            status: "PENDING"
        }, { transaction: t });

        // 2. Create PreReleaseItems
        const itemsToInsert = items.map(item => ({
            pre_release_id: preRelease.id,
            product_id: item.product_id,
            qty: item.qty
        }));
        await PreReleaseItem.bulkCreate(itemsToInsert, { transaction: t });

        // 3. Decrement inventory for each product
        for (const item of items) {
            const product = await Product.findByPk(item.product_id, { include: ["inventory"], transaction: t });
            if (product && product.inventory) {
                // Prevent negative inventory
                const newQty = Math.max(0, product.inventory.quantity - item.qty);
                await product.inventory.update({ quantity: newQty }, { transaction: t });
            }
        }

        await t.commit();
        return res.status(201).json({ message: "Pre-release created", pre_release_id: preRelease.id });
    } catch (err) {
        await t.rollback();
        console.error("Pre-release creation failed:", err);
        return res.status(500).json({ message: "Failed to create pre-release", error: err.message });
    }
};

// GET /api/pos/pre-release (list for current user)
export const getMyPreReleases = async (req, res) => {
    const user_id = req.user.id;
    try {
        const preReleases = await PreRelease.findAll({
            where: { user_id },
            order: [["createdAt", "DESC"]],
            include: [{
                model: PreReleaseItem,
                as: "items",
                include: [{ model: Product, as: "product", attributes: ["name"] }]
            }]
        });
        res.json(preReleases);
    } catch (err) {
        console.error("Fetch pre-releases failed:", err);
        res.status(500).json({ message: "Failed to fetch pre-releases", error: err.message });
    }
};
