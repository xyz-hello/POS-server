// filepath: src/routes/auth.route.js
import express from 'express';
import { login, refreshToken, logout } from '../controllers/authController.js';

const router = express.Router();

// Login with access + refresh tokens
router.post('/login', login);

// Refresh access token
router.post('/refresh-token', refreshToken);

// Optional: logout to remove refresh token
router.post('/logout', logout);

export default router;
