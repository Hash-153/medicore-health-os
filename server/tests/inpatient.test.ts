import test from 'node:test';
import assert from 'node:assert/strict';
import { InpatientService } from '../src/inpatient/inpatient.service.ts';

test('Inpatient Bed Management - Bed Allocation and Turnover Lifecycle', () => {
  // Check listing
  const allBeds = InpatientService.listBeds();
  assert.ok(allBeds.length >= 5);

  // Allocate available ICU bed
  const availableIcuBed = allBeds.find((b) => b.status === 'AVAILABLE' && b.unitType === 'INTENSIVE_CARE_UNIT');
  assert.ok(availableIcuBed);

  const assigned = InpatientService.assignPatientToBed(availableIcuBed.id, 'PAT-003', 'James Rodriguez');
  assert.equal(assigned.status, 'OCCUPIED');
  assert.equal(assigned.currentPatientId, 'PAT-003');

  // Discharge to cleaning
  const discharged = InpatientService.dischargeBed(availableIcuBed.id);
  assert.equal(discharged.status, 'CLEANING_REQUIRED');
  assert.equal(discharged.currentPatientId, undefined);

  // Complete terminal clean
  const cleaned = InpatientService.completeBedCleaning(availableIcuBed.id);
  assert.equal(cleaned.status, 'AVAILABLE');
  assert.ok(cleaned.lastCleanedAt);
});

test('SBAR Nursing Handoff - Standardized Clinical Handoff Generation', () => {
  const handoff = InpatientService.compileSbarHandoff({
    patientId: 'PAT-001',
    nurseGivingHandoff: 'Robert Vance, BSN, RN',
    nurseReceivingHandoff: 'Maria Garcia, RN',
    codeStatus: 'FULL_CODE',
    admitDiagnosis: 'Hypertensive Emergency & Type 2 Diabetes',
    situation: 'Patient is stable on IV Nicardipine titration; BP improved from 195/110 to 142/84.',
    background: '64yo female with poorly controlled T2D (HbA1c 9.2%) and stage 3a CKD. No known drug allergies.',
    assessment: 'Lungs clear to auscultation bilaterally. Peripheral pulses +2. Foley catheter draining clear yellow urine >40mL/hr. Serum creatinine 1.4 mg/dL.',
    recommendation: 'Continue IV infusion until morning rounds. Repeat basic metabolic panel at 0500. Transition to oral antihypertensives per Dr. Mitchell.',
  });

  assert.equal(handoff.patientName, 'Eleanor Vance');
  assert.equal(handoff.codeStatus, 'FULL_CODE');
  assert.ok(handoff.id.startsWith('SBAR-'));
  assert.ok(handoff.unitAndBed.includes('4-North'));

  const saved = InpatientService.getHandoffsForPatient('PAT-001');
  assert.ok(saved.length >= 1);
});
