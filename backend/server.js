import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './src/config/env.js';
import { testConnection } from './src/config/db.js';
import { sequelize } from './src/models/index.js';
import authRoutes    from './src/routes/auth.routes.js';
import bookingRoutes from './src/routes/booking.routes.js';
import stockRoutes   from './src/routes/stock.routes.js';
import queueRoutes   from './src/routes/queue.routes.js';
import welfareRoutes from './src/routes/welfare.routes.js';
import rationCardRoutes from './src/routes/rationCard.routes.js';
import shopRoutes from './src/routes/shop.routes.js';
// Start background welfare monitoring cron jobs
import './src/utils/welfare.cron.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────
app.use('/api/auth',    authRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/stock',   stockRoutes);
app.use('/api/queue',   queueRoutes);
app.use('/api/welfare', welfareRoutes);
app.use('/api/ration-card', rationCardRoutes);
app.use('/api/shops', shopRoutes);
// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ── Start ─────────────────────────────────────────────────
const startServer = async () => {
  try {
    await testConnection();
     await sequelize.sync({ alter: true });
    app.listen(config.port, () => {
      console.log(`🚀 SmartRation API running on port ${config.port}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err.message);
    process.exit(1);
  }
};

startServer();
export default app;