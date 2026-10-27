import express from 'express';
import {
  getComplianceRecords,
  getComplianceBySampleId,
  reviewCompliance
} from '../controllers/complianceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin', 'compliance_officer', 'technician'), getComplianceRecords);
router.get('/sample/:sampleId', getComplianceBySampleId);
router.put('/:id/review', authorize('admin', 'compliance_officer'), reviewCompliance);

export default router;
