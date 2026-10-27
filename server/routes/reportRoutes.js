import express from 'express';
import {
  generateReport,
  getReports,
  getReportById,
  approveReport,
  deliverReport,
  downloadReportPdf
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/generate/:sampleId', authorize('admin', 'compliance_officer'), generateReport);
router.get('/', getReports);
router.get('/:id', getReportById);
router.put('/:id/approve', authorize('admin', 'compliance_officer'), approveReport);
router.put('/:id/deliver', authorize('admin', 'compliance_officer'), deliverReport);
router.get('/:id/pdf', downloadReportPdf);

export default router;
