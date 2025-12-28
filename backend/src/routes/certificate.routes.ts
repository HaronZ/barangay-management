import { Router } from 'express';
import * as certificateController from '../controllers/certificate.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', certificateController.getAllCertificates);
router.get('/:id', certificateController.getCertificateById);
router.get('/resident/:residentId', certificateController.getCertificatesByResident);
router.post('/', certificateController.createCertificate);
router.patch('/:id/status', authorize('ADMIN', 'STAFF'), certificateController.updateCertificateStatus);

export default router;
