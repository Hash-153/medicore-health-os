import test from 'node:test';
import assert from 'node:assert/strict';
import { EmarService } from '../src/emar/emar.service.ts';

test('eMAR - 5 Rights of Medication Administration Verification', () => {
  const slots = EmarService.getEmarSlotsForPatient('PAT-001');
  assert.ok(slots.length > 0);

  const slot = slots[0];

  // Correct 5 rights match
  const validCheck = EmarService.verifyFiveRights({
    scannedPatientBarcode: 'PAT-001',
    expectedPatientId: 'PAT-001',
    scannedMedicationBarcode: slot.medicationName,
    expectedMedicationName: slot.medicationName,
    doseSlot: slot,
  });

  assert.equal(validCheck.passed, true);
  assert.equal(validCheck.errors.length, 0);

  // Wrong patient barcode mismatch
  const wrongPatientCheck = EmarService.verifyFiveRights({
    scannedPatientBarcode: 'PAT-WRONG-999',
    expectedPatientId: 'PAT-001',
    scannedMedicationBarcode: slot.medicationName,
    expectedMedicationName: slot.medicationName,
    doseSlot: slot,
  });

  assert.equal(wrongPatientCheck.passed, false);
  assert.ok(wrongPatientCheck.errors[0].includes('RIGHT PATIENT'));
});

test('eMAR - ISMP High-Alert Dual Sign-Off Enforcement', () => {
  // Test high-alert detection for Insulin & Heparin
  const insulinCheck = EmarService.isHighAlertMedication('Insulin Glargine 20 units');
  assert.equal(insulinCheck.isHighAlert, true);
  assert.equal(insulinCheck.requiresDualSignOff, true);

  const amlodipineCheck = EmarService.isHighAlertMedication('Amlodipine Besylate 5mg');
  assert.equal(amlodipineCheck.isHighAlert, false);
});
