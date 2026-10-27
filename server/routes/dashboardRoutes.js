import express from 'express';
import { getDashboardStatistics } from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/statistics', getDashboardStatistics);

export default router;
