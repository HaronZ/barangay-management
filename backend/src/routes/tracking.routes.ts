import { Router } from 'express';
import * as trackingController from '../controllers/tracking.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public route - track by control number
router.get('/public/:controlNumber', trackingController.trackByControlNumber);

// Protected routes
router.get('/my-requests', authenticate, trackingController.getMyRequests);
router.get('/my-stats', authenticate, trackingController.getRequestStats);

export default router;
