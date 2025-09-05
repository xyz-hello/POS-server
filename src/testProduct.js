import { Product, Inventory, sequelize } from "./models/index.js";

const test = async () => {
    try {
        await sequelize.sync(); // create tables if not exist

        const p = await Product.create({
            product_code: "APP-20250905-1234",
            name: "Apple",
            price: 50,
            unit_type: "pcs"
        });

        await Inventory.create({ product_id: p.id, quantity: 100 });

        console.log("✅ Test product + inventory created");
    } catch (err) {
        console.error(err);
    }
};

test();
