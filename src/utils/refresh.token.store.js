// filepath: src/utils/refreshTokenStore.js
// Simple in-memory store for refresh tokens
// In production, use a database for persistence and revocation
const refreshTokens = new Set();

/**
 * Add a refresh token
 */
export const addToken = (token) => {
    refreshTokens.add(token);
};

/**
 * Remove a refresh token (logout or revoke)
 */
export const removeToken = (token) => {
    refreshTokens.delete(token);
};

/**
 * Check if token exists
 */
export const hasToken = (token) => {
    return refreshTokens.has(token);
};
