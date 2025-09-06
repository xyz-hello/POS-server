import jwt from "jsonwebtoken";

// Example user payload (match your users table)
const user = {
    id: 1,                // user ID from your DB
    username: "admin1",
    user_type: 1,         // 0 = superadmin, 1 = admin
    customer_id: 123      // customer_id linked to admin
};

// JWT secret (must match your backend .env JWT_SECRET)
const secret = "YOUR_JWT_SECRET"; // replace with process.env.JWT_SECRET if available

// Generate token
const token = jwt.sign(user, secret, { expiresIn: "1h" });

console.log("JWT Token:", token);
