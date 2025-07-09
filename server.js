const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth'); // if used
const customerRoutes = require('./routes/customer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes); // if used
app.use('/api/customers', customerRoutes); // <-- POST and GET

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
