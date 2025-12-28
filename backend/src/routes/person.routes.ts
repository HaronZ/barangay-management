import { Router } from 'express';
import * as personController from '../controllers/person.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Person CRUD routes
router.get('/', personController.getAllPersons);
router.get('/officials', personController.getOfficials);
router.get('/:id', personController.getPersonById);
router.post('/', authorize('ADMIN', 'STAFF'), personController.createPerson);
router.put('/:id', authorize('ADMIN', 'STAFF'), personController.updatePerson);
router.delete('/:id', authorize('ADMIN'), personController.deletePerson);

// Official management routes
router.post('/officials', authorize('ADMIN'), personController.makeOfficial);
router.delete('/officials/:personId', authorize('ADMIN'), personController.removeOfficial);

export default router;
