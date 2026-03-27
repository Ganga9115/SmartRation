import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, RationCard } from '../models/index.js';

/**
 * Generate a signed JWT for a user.
 */
export const generateToken = (user) =>
  jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

/**
 * Verify a JWT string and return the decoded payload.
 * Throws if invalid or expired.
 */
export const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

/**
 * Find a user by phone, creating one if not found.
 * Returns { user, isNewUser }.
 */
export const findOrCreateUserByPhone = async (phone) => {
  let user = await User.findOne({ where: { phone } });
  let isNewUser = false;

  if (!user) {
    user = await User.create({
      name:          'New User',
      phone,
      email:         null,
      password_hash: 'otp_auth',
      role:          'user',
    });
    isNewUser = true;
  }

  return { user, isNewUser };
};

/**
 * Return a sanitised user object safe to expose via API.
 */
export const sanitiseUser = (user, isNewUser = false) => ({
  id:        user.id,
  name:      user.name,
  phone:     user.phone,
  email:     user.email,
  role:      user.role,
  isNewUser,
});

/**
 * Check whether a user has an active ration card registered.
 */
export const hasActiveRationCard = async (userId) => {
  const card = await RationCard.findOne({ where: { user_id: userId, is_active: true } });
  return !!card;
};