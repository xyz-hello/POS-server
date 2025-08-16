export const requestLogger = (req, res, next) => {
    const userId = req.user?.id || 'Guest'; // If user is logged in, use their ID; otherwise "Guest"
    const timestamp = new Date().toISOString(); // ISO timestamp for consistent log formatting
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} by user: ${userId}`);
    next(); // Continue to next middleware/controller
};
