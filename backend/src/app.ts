import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import config from './common/utils/config';
import { errorHandler } from './common/middleware';

// Import routes
import authRoutes from './modules/auth/auth.routes';
import plansRoutes from './modules/plans/plans.routes';
import subscriptionsRoutes from './modules/subscriptions/subscriptions.routes';
import paymentsRoutes from './modules/payments/payments.routes';
import usersRoutes from './modules/users/users.routes';

const app: Application = express();

// =====================
// MIDDLEWARE
// =====================

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        config.cors.origin,
        'http://localhost:5173',
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// =====================
// ROUTES
// =====================

// Health check
app.get('/health', (_req, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/plans', plansRoutes);
app.use('/api/v1/subscriptions', subscriptionsRoutes);
app.use('/api/v1/payments', paymentsRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
});

// =====================
// ERROR HANDLER
// =====================
app.use(errorHandler);

export default app;
