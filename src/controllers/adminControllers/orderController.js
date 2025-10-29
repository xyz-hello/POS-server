// ----------------- Get all orders (summary) -----------------
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            attributes: ["id", "order_number", "total", "createdAt", "status", "payment_method"],
            order: [["createdAt", "DESC"]],
        });
        res.json(orders);
    } catch (error) {
        console.error("Fetch all orders failed:", error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};
// filepath: controllers/adminControllers/orderController.js
import { Order, OrderItem, Product, Inventory } from "../../models/index.js";
import sequelize from "../../config/db.sequelize.config.js";
import { v4 as uuidv4 } from "uuid";

// ----------------- Helper: Generate a unique order number -----------------
const generateOrderNumber = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const uniquePart = uuidv4().split("-")[0]; // short unique string
    return `ORD-${yyyy}${mm}${dd}-${uniquePart}`;
};

// ----------------- Helper: Format order response -----------------
const formatOrder = (order) => ({
    id: order.id,
    order_number: order.order_number,
    user_id: order.user_id,
    subtotal: order.subtotal,
    discount: order.discount,
    total: order.total,
    payment_method: order.payment_method,
    status: order.status,
    createdAt: order.createdAt,
    items: order.items.map((item) => ({
        product_id: item.product_id,
        name: item.product?.name || null,
        qty: item.qty,
        price: item.price,
    })),
});

// ----------------- Create a new order -----------------
export const createOrder = async (req, res) => {
    const { user_id, cart, payment_method, discount = 0 } = req.body;
    // Always set customer_id from logged-in user
    const customer_id = req.user.customer_id;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: "Cart cannot be empty" });
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal - discount;

    const transaction = await sequelize.transaction();

    try {
        const order_number = generateOrderNumber();

        // 1. Create the order
        const order = await Order.create(
            { order_number, user_id, customer_id, subtotal, discount, total, payment_method, status: "PAID" },
            { transaction }
        );

        // 2. Create order items
        const itemsToInsert = cart.map((item) => ({
            order_id: order.id,
            product_id: item.product_id || item.id,
            qty: item.qty,
            price: item.price,
        }));
        await OrderItem.bulkCreate(itemsToInsert, { transaction });

        // 3. Decrement inventory stock for each product
        for (const item of cart) {
            const inventory = await Inventory.findOne({
                where: { product_id: item.product_id || item.id },
                transaction,
                lock: transaction.LOCK.UPDATE, // prevent race conditions
            });

            if (!inventory) {
                throw new Error(`No inventory found for product_id ${item.product_id || item.id}`);
            }

            if (inventory.quantity < item.qty) {
                throw new Error(`Not enough stock for product_id ${item.product_id || item.id}`);
            }

            inventory.quantity -= item.qty;
            await inventory.save({ transaction });
        }

        // 4. Commit transaction
        await transaction.commit();

        // 5. Fetch full order with items + product names
        const fullOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{ model: Product, as: "product", attributes: ["name"] }],
                },
            ],
        });

        return res.status(201).json({
            message: "Order created successfully",
            order: formatOrder(fullOrder),
        });
    } catch (error) {
        await transaction.rollback();
        console.error("Order creation failed:", error);
        return res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

// ----------------- Get order by ID -----------------
export const getOrderById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{ model: Product, as: "product", attributes: ["name"] }],
                },
            ],
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.json(formatOrder(order));
    } catch (error) {
        console.error("Fetch order failed:", error);
        return res.status(500).json({ message: "Failed to fetch order", error: error.message });
    }
};

// ----------------- Get order analytics -----------------
export const getOrderAnalytics = async (req, res) => {
    try {
        const customerId = req.user.customer_id;
        // Sales by day (last 30 days)
        const [salesByDay] = await sequelize.query(`
            SELECT DATE(createdAt) as date, SUM(total) as totalSales, COUNT(*) as ordersCount
            FROM orders
            WHERE status = 'PAID' AND customer_id = ?
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt) DESC
            LIMIT 30
        `, { replacements: [customerId] });

        // Sales by month (last 12 months)
        const [salesByMonth] = await sequelize.query(`
            SELECT YEAR(createdAt) as year, MONTH(createdAt) as month, SUM(total) as totalSales, COUNT(*) as ordersCount
            FROM orders
            WHERE status = 'PAID' AND customer_id = ?
            GROUP BY YEAR(createdAt), MONTH(createdAt)
            ORDER BY year DESC, month DESC
            LIMIT 12
        `, { replacements: [customerId] });

        // Top products (last 30 days)
        const [topProducts] = await sequelize.query(`
            SELECT oi.product_id, p.name as product, SUM(oi.qty) as totalQty
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN products p ON oi.product_id = p.id
            WHERE o.status = 'PAID' AND o.customer_id = ? AND o.createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY oi.product_id, p.name
            ORDER BY totalQty DESC
            LIMIT 10
        `, { replacements: [customerId] });

        // Summary stats
        const [summary] = await sequelize.query(`
            SELECT COUNT(*) AS total_orders, SUM(total) AS total_sales, AVG(total) AS avg_order_value
            FROM orders
            WHERE status = 'PAID' AND customer_id = ?
        `, { replacements: [customerId] });

        res.json({
            salesByDay,
            salesByMonth,
            topProducts,
            total_orders: summary[0].total_orders || 0,
            total_sales: summary[0].total_sales || 0,
            avg_order_value: summary[0].avg_order_value || 0,
        });
    } catch (err) {
        console.error("Order analytics error:", err);
        res.status(500).json({ message: "Failed to fetch analytics", error: err.message });
    }
};
