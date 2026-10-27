import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';

// Resolve directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Static directory for uploaded/generated documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    message: 'Water Testing Laboratory Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Auto-seed if database is newly initialized
import User from './models/User.js';
import { seedDatabase } from './utils/seedData.js';

const verifyAndSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[WTLMS Bootstrap] Database is empty. Running initial seeder...');
      await seedDatabase();
    }
  } catch (err) {
    console.error('[WTLMS Bootstrap] Seed verification error:', err.message);
  }
};

// Route imports will be mounted here in subsequent steps
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sampleRoutes from './routes/sampleRoutes.js';
import parameterRoutes from './routes/parameterRoutes.js';
import testResultRoutes from './routes/testResultRoutes.js';
import complianceRoutes from './routes/complianceRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/parameters', parameterRoutes);
app.use('/api/test-results', testResultRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`[WTLMS Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  await verifyAndSeedIfEmpty();
});

export default app;
