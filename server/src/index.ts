import 'dotenv/config'; // MUST BE FIRST IMPORT
import express, { Application } from 'express';
import cors from 'cors';

import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import patientRoutes from './routes/patient';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/patient', patientRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`[Server]: Running at http://localhost:${PORT}`);
  console.log(`[Environment]: ${process.env.NODE_ENV}`);
});
