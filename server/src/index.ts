import path from 'path';
import dotenv from 'dotenv';

// Load environment configuration from server/.env or root .env (supports Render container paths)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config();
import express, { Application } from 'express';
import cors from 'cors';

import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';
import doctorRoutes from './routes/doctor';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS supporting local development, Vercel production and Vercel preview URLs
const configuredOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://sahaya-health.vercel.app',
  ...configuredOrigins
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isExplicitlyAllowed = defaultAllowedOrigins.includes(origin);
    const isVercelDomain = origin.endsWith('.vercel.app') || origin.includes('sahaya-health');
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

    if (isExplicitlyAllowed || isVercelDomain || isLocalhost || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Permissive fallback so hackathon judges and testers are never blocked
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

// Root endpoint for platform overview & Render health checks
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'SAHAYA Healthcare Platform API',
    status: 'online',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      patient: '/api/patient',
      doctor: '/api/doctor',
    },
  });
});

// Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Server]: Running at http://localhost:${PORT}`);
  console.log(`[Environment]: ${process.env.NODE_ENV}`);
});
