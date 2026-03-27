import crypto from 'crypto';

/**
 * Generate a secure random token (hex string).
 * @param {number} bytes – entropy in bytes (default 32 → 64-char hex)
 */
export const generateSecureToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

/**
 * Generate a short alphanumeric reference code (e.g. for display / SMS).
 * @param {number} length – characters (default 8)
 */
export const generateRefCode = (length = 8) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let result  = '';
  const arr   = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[arr[i] % chars.length];
  }
  return result;
};

/**
 * Generate a numeric token (for queue display boards).
 * Pads to `digits` digits.
 * @param {number} max    – exclusive upper bound (default 1000)
 * @param {number} digits – zero-pad width (default 3)
 */
export const generateNumericToken = (max = 1000, digits = 3) => {
  const n = crypto.randomInt(1, max);
  return String(n).padStart(digits, '0');
};