import express from 'express';
import {
  createSample,
  getSamples,
  getSampleById,
  updateSample,
  updateSampleStatus,
  deleteSample
} from '../controllers/sampleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('admin', 'customer', 'technician'), createSample)
  .get(getSamples);

router.route('/:id')
  .get(getSampleById)
  .put(authorize('admin', 'technician'), updateSample)
  .delete(authorize('admin'), deleteSample);

router.put('/:id/status', authorize('admin', 'technician', 'compliance_officer'), updateSampleStatus);

export default router;
