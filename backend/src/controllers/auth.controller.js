import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/env.js';
import { generateOTP, storeOTP, verifyOTP } from '../utils/otpService.js';

// ── Send OTP ──────────────────────────────────────────────
export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone)
      return res.status(400).json({ success: false, message: 'Phone is required' });
    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number' });

    const otp = generateOTP();
    storeOTP(phone, otp);

    // ── Dev: print OTP to terminal ──
    console.log('\n┌─────────────────────────────┐');
    console.log(`│  📱 OTP for ${phone}  │`);
    console.log(`│       🔐  ${otp}            │`);
    console.log('└─────────────────────────────┘\n');

    return res.json({
      success: true,
      message: 'OTP generated successfully',
      // 👇 Only send OTP in response during development
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });
  } catch (err) {
    console.error('sendOTP error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to generate OTP' });
  }
};

// ── Verify OTP ────────────────────────────────────────────
export const verifyOTP_Handler = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp)
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });

    const result = verifyOTP(phone, otp);
    if (!result.success)
      return res.status(400).json({ success: false, message: result.message });

    // ── Find or create user ──
    let user = await User.findOne({ where: { phone } });
    let isNewUser = false;

    if (!user) {
      user = await User.create({
        name: 'New User',
        phone,
        email: null,
        password_hash: 'otp_auth',
        role: 'user',
      });
      isNewUser = true;
    }

    if (!user.is_active)
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact support' });

    // ── Generate JWT ──
    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    console.log(`✅ Login success | ${phone} | User ID: ${user.id} | New user: ${isNewUser}`);

    return res.json({
      success: true,
      message: isNewUser ? 'Account created successfully' : 'Login successful',
      token,
      user: {
        id:       user.id,
        name:     user.name,
        phone:    user.phone,
        email:    user.email,
        role:     user.role,
        isNewUser,
      },
    });
  } catch (err) {
    console.error('verifyOTP error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get current user ──────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Update profile ────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Convert empty string to null to avoid unique constraint conflicts
    const cleanEmail = email?.trim() === '' ? null : email?.trim() || null;

    await User.update(
      {
        ...(name       && { name: name.trim() }),
        email: cleanEmail,          // always update email (null is fine)
      },
      { where: { id: req.user.id } }
    );

    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] },
    });

    return res.json({ success: true, user: updated });
  } catch (err) {
    // Catch duplicate email specifically
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Email already in use by another account' });
    }
    return res.status(500).json({ success: false, message: err.message });
  }
};