

// Route imports (we'll add these as we build each phase)
// import authRoutes from './src/routes/auth.routes.js';
// import bookingRoutes from './src/routes/booking.routes.js';
// import stockRoutes from './src/routes/stock.routes.js';
// import queueRoutes from './src/routes/queue.routes.js';
// import welfareRoutes from './src/routes/welfare.routes.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { config } from './src/config/env.js';
import { testConnection } from './src/config/db.js';
import { sequelize } from './src/models/index.js'; // 👈 IMPORTANT

// Routes (we’ll enable later)
// import authRoutes from './src/routes/auth.routes.js';

const app = express();

// ── Middleware ──────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────
// app.use('/api/auth', authRoutes);

// ── Global error handler ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start Server ─────────────────────────────────────────
const startServer = async () => {
  try {
    await testConnection(); // DB connect

    await sequelize.sync({ alter: true }); 
    // 👆 creates/updates tables automatically

    console.log('✅ Database synced');

    app.listen(config.port, () => {
      console.log(`🚀 SmartRation API running on port ${config.port}`);
    });

  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
  }
};

startServer();

export default app;