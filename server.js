import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js'; // Login route
import customerRoutes from './routes/superadminRoutes/customerroutes.js';

dotenv.config(); // Load .env config

const app = express(); // ✅ Initialize app before using it

app.use(cors());
app.use(express.json()); // Parse JSON bodies

// ✅ Mount your routes after middleware setup
app.use('/api/auth', authRoutes);
app.use('/api/superadmin/customers', customerRoutes);

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
