import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },
msg91: {
  authKey:    process.env.MSG91_AUTH_KEY,
  templateId: process.env.MSG91_OTP_TEMPLATE_ID,
},
  app: {
    bookingCycleDays: parseInt(process.env.BOOKING_CYCLE_DAYS) || 30,
    maxSlotsPerDay: parseInt(process.env.MAX_SLOTS_PER_DAY) || 50,
  },
};