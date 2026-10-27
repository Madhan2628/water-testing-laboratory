import express from 'express';
import {
  saveTestResults,
  getResultsBySampleId,
  updateSingleResult
} from '../controllers/testResultController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('admin', 'technician'), saveTestResults);
router.get('/sample/:sampleId', getResultsBySampleId);
router.put('/:id', authorize('admin', 'technician'), updateSingleResult);

export default router;
