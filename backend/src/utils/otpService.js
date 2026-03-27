// In-memory store: { phone -> { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_EXPIRY_MS  = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS   = 3;              // max wrong tries before lockout

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const storeOTP = (phone, otp) => {
  otpStore.set(phone, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
  });
};

export const verifyOTP = (phone, inputOtp) => {
  const record = otpStore.get(phone);

  if (!record) return { success: false, message: 'OTP not found. Please request a new one' };
  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, message: 'OTP expired. Please request a new one' };
  }

  record.attempts += 1;

  if (record.attempts > MAX_ATTEMPTS) {
    otpStore.delete(phone);
    return { success: false, message: 'Too many attempts. Please request a new OTP' };
  }

  if (record.otp !== inputOtp.trim()) {
    return { success: false, message: `Invalid OTP. ${MAX_ATTEMPTS - record.attempts} attempts remaining` };
  }

  // ✅ Valid
  otpStore.delete(phone);
  return { success: true };
};

export const clearOTP = (phone) => otpStore.delete(phone);