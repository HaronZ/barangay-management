import { Router } from 'express';
import * as householdController from '../controllers/household.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', householdController.getAllHouseholds);
router.get('/:id', householdController.getHouseholdById);
router.post('/', authorize('ADMIN', 'STAFF'), householdController.createHousehold);
router.put('/:id', authorize('ADMIN', 'STAFF'), householdController.updateHousehold);
router.delete('/:id', authorize('ADMIN'), householdController.deleteHousehold);

export default router;
