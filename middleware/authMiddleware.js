import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT token
 * Attaches decoded user info to req.user if valid
 */
export const authenticateToken = (req, res, next) => {
  // Get Authorization header
  const authHeader = req.headers['authorization'];

  // Check header exists and starts with 'Bearer '
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed.' });
  }

  const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '

  try {
    // Verify token using secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to request for downstream use
    req.user = decoded;

    next(); // proceed to next middleware/route
  } catch (err) {
    console.error('JWT verification error:', err.message);
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * Optional middleware to restrict access to specific roles
 * Example usage: app.use('/cashier', authenticateToken, cashierOnly)
 */
export const authorizeRole = (allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.user_type)) {
    return res.status(403).json({ message: 'Access denied: insufficient permissions.' });
  }
  next();
};
