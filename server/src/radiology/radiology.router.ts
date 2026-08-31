import { Router } from 'express';
import { RadiologyController } from './radiology.controller.ts';
import { authorize } from '../security/authMiddleware.ts';

const router = Router();

// Routes protected by RBAC (Physicians, Radiologists, Admins)
router.get('/studies', authorize('DIAGNOSTIC_REPORTS', 'READ'), RadiologyController.queryStudies);
router.get('/studies/:uid', authorize('DIAGNOSTIC_REPORTS', 'READ'), RadiologyController.getStudy);
router.get('/studies/:uid/report', authorize('DIAGNOSTIC_REPORTS', 'READ'), RadiologyController.getReport);
router.post('/reports', authorize('DIAGNOSTIC_REPORTS', 'CREATE'), RadiologyController.signReport);

export default router;
