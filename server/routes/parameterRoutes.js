import express from 'express';
import {
  getParameters,
  getParameterById,
  createParameter,
  updateParameter,
  deleteParameter
} from '../controllers/parameterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getParameters)
  .post(authorize('admin'), createParameter);

router.route('/:id')
  .get(getParameterById)
  .put(authorize('admin'), updateParameter)
  .delete(authorize('admin'), deleteParameter);

export default router;
