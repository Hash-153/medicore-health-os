import { Router } from 'express';
import { InpatientController } from './inpatient.controller.ts';
import { authorize } from '../security/authMiddleware.ts';

const router = Router();

// Bed tracking & unit management
router.get('/beds', authorize('PATIENT_DEMOGRAPHICS', 'READ'), InpatientController.listBeds);
router.post('/beds/assign', authorize('PATIENT_DEMOGRAPHICS', 'UPDATE'), InpatientController.assignBed);
router.post('/beds/:bedId/discharge', authorize('PATIENT_DEMOGRAPHICS', 'UPDATE'), InpatientController.dischargeBed);
router.post('/beds/:bedId/clean', authorize('PATIENT_DEMOGRAPHICS', 'UPDATE'), InpatientController.cleanBed);

// SBAR Nursing Handoffs
router.post('/handoffs', authorize('CLINICAL_NOTES', 'CREATE'), InpatientController.createSbarHandoff);
router.get('/handoffs/patient/:patientId', authorize('CLINICAL_NOTES', 'READ'), InpatientController.getHandoffs);

export default router;
