import jwt from 'jsonwebtoken';
import axios from 'axios';
import { User } from '../models/index.js';
import { config } from '../config/env.js';

const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000;

export const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ success: false, message: 'Phone is required' });
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, { otp, expiresAt: Date.now() + OTP_EXPIRY_MS });

    const msg91Url = `https://api.msg91.com/api/v5/otp?template_id=${config.msg91.templateId}&mobile=91${phone}&authkey=${config.msg91.authKey}&otp=${otp}`;
    const response = await axios.get(msg91Url);

    console.log('─────────────────────────────────');
    console.log(`📱 OTP for ${phone} : ${otp}`);
    console.log('─────────────────────────────────');

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err) {
    console.error('sendOTP error:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ success: false, message: 'Phone and OTP required' });

    const record = otpStore.get(phone);
    console.log(`🔍 Verifying | stored: ${record?.otp} | received: ${otp}`);

    if (!record) return res.status(400).json({ success: false, message: 'OTP not found. Request a new one' });
    if (Date.now() > record.expiresAt) {
      otpStore.delete(phone);
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    if (record.otp !== otp.trim()) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    otpStore.delete(phone);

    // ✅ Sequelize syntax
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

    if (!user.is_active) return res.status(403).json({ success: false, message: 'Account deactivated' });

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    console.log(`✅ Login success | ${phone} | ID: ${user.id} | New: ${isNewUser}`);

    return res.json({
      success: true,
      message: isNewUser ? 'Account created' : 'Login successful',
      token,
      user: { id: user.id, name: user.name, phone: user.phone, email: user.email, role: user.role, isNewUser },
    });
  } catch (err) {
    console.error('verifyOTP error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    return res.json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.update({ name, email }, { where: { id: req.user.id } });
    const updated = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password_hash'] }
    });
    return res.json({ success: true, user: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};