// filepath: controllers/orderController.js
import Order from "../../models/order.js";
import OrderItem from "../../models/orderItem.js";
import Product from "../../models/product.js";
import sequelize from "../../config/db.sequelize.config.js";
import { v4 as uuidv4 } from "uuid";

// Generate a robust unique order number
const generateOrderNumber = () => {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const uniquePart = uuidv4().split("-")[0]; // short unique string
    return `ORD-${yyyy}${mm}${dd}-${uniquePart}`;
};

// Format order response for frontend
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
        name: item.Product?.name || null,
        qty: item.qty,
        price: item.price,
    })),
});

// Create a new order
export const createOrder = async (req, res) => {
    const { user_id, cart, payment_method, discount = 0 } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ message: "Cart cannot be empty" });
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    const total = subtotal - discount;

    const transaction = await sequelize.transaction();

    try {
        // Generate a unique order number
        const order_number = generateOrderNumber();

        // Create the order
        const order = await Order.create(
            { order_number, user_id, subtotal, discount, total, payment_method, status: "PAID" },
            { transaction }
        );

        // Create order items in bulk
        const itemsToInsert = cart.map((item) => ({
            order_id: order.id,
            product_id: item.product_id || item.id,
            qty: item.qty,
            price: item.price,
        }));

        await OrderItem.bulkCreate(itemsToInsert, { transaction });

        // Commit transaction
        await transaction.commit();

        // Fetch full order with items and product names
        const fullOrder = await Order.findByPk(order.id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{ model: Product, attributes: ["name"] }],
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

// Get order by ID
export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: OrderItem,
                    as: "items",
                    include: [{ model: Product, attributes: ["name"] }],
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
