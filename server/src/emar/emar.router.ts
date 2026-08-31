import { Router } from 'express';
import { EmarController } from './emar.controller.ts';
import { authorize } from '../security/authMiddleware.ts';

const router = Router();

// Routes protected by RBAC
router.get('/patient/:patientId', authorize('PRESCRIPTIONS', 'READ'), EmarController.getSlots);
router.post('/verify-5-rights', authorize('PRESCRIPTIONS', 'READ'), EmarController.verifyFiveRights);
router.post('/administer', authorize('PRESCRIPTIONS', 'UPDATE'), EmarController.recordAdmin);

export default router;
