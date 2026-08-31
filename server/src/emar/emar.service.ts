/**
 * Electronic Medication Administration Record (eMAR) & Barcode Verification Service
 */

import type { EmarDoseSlot, FiveRightsCheckResult, HighAlertProtocol } from './types.ts';
import { db } from '../database/memoryDb.ts';

const HIGH_ALERT_DRUG_NAMES = [
  'insulin',
  'heparin',
  'warfarin',
  'morphine',
  'hydromorphone',
  'fentanyl',
  'potassium chloride',
  'vancomycin',
  'digoxin',
];

export class EmarService {
  private static doseSlots: EmarDoseSlot[] = [];

  public static isHighAlertMedication(drugName: string): HighAlertProtocol {
    const lower = drugName.toLowerCase();
    const isHigh = HIGH_ALERT_DRUG_NAMES.some((h) => lower.includes(h));
    return {
      isHighAlert: isHigh,
      requiresDualSignOff: isHigh,
      warningText: isHigh
        ? 'HIGH-ALERT MEDICATION (ISMP Standard): Independent double-check and dual nurse sign-off required prior to administration.'
        : undefined,
    };
  }

  /**
   * Verify the 5 Rights of Medication Administration
   */
  public static verifyFiveRights(input: {
    scannedPatientBarcode: string;
    expectedPatientId: string;
    scannedMedicationBarcode: string;
    expectedMedicationName: string;
    doseSlot: EmarDoseSlot;
  }): FiveRightsCheckResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Right 1: Patient
    if (input.scannedPatientBarcode !== input.expectedPatientId) {
      errors.push(`MISMATCH - RIGHT PATIENT: Scanned barcode '${input.scannedPatientBarcode}' does not match patient '${input.expectedPatientId}'`);
    }

    // Right 2: Medication
    if (!input.scannedMedicationBarcode.toLowerCase().includes(input.expectedMedicationName.toLowerCase().split(' ')[0])) {
      errors.push(`MISMATCH - RIGHT MEDICATION: Scanned package '${input.scannedMedicationBarcode}' does not match prescribed '${input.expectedMedicationName}'`);
    }

    // Right 3 & 4: Route & Dose check
    if (!input.doseSlot.dose || !input.doseSlot.route) {
      errors.push('INVALID PRESCRIPTION: Missing route or dosage specification.');
    }

    // Right 5: Time window (within 60 minutes of scheduled slot)
    const scheduledTime = new Date(input.doseSlot.scheduledTime).getTime();
    const currentTime = Date.now();
    const diffMinutes = Math.abs(currentTime - scheduledTime) / (1000 * 60);

    if (diffMinutes > 60) {
      warnings.push(`TIME WINDOW ALERT: Medication is being given ${Math.round(diffMinutes)} minutes from scheduled time (Standard window is ±60 minutes).`);
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Initialize / fetch 24-hour eMAR slots for a patient
   */
  public static getEmarSlotsForPatient(patientId: string): EmarDoseSlot[] {
    // Generate active slots if not already generated
    const existing = this.doseSlots.filter((s) => s.patientId === patientId);
    if (existing.length > 0) return existing;

    const patientPrescriptions = db.getAll(db.prescriptions).filter((p) => p.patientId === patientId && p.status === 'ACTIVE');
    const now = new Date();

    const generated: EmarDoseSlot[] = [];
    patientPrescriptions.forEach((rx) => {
      const highAlert = this.isHighAlertMedication(rx.medicationName);

      // Create 08:00 and 20:00 slots
      const slot1Time = new Date(now);
      slot1Time.setHours(8, 0, 0, 0);

      const slot2Time = new Date(now);
      slot2Time.setHours(20, 0, 0, 0);

      generated.push({
        id: `EMAR-${rx.id}-D1`,
        prescriptionId: rx.id,
        patientId: rx.patientId,
        medicationName: rx.medicationName,
        dose: rx.dosage,
        route: rx.route,
        scheduledTime: slot1Time.toISOString(),
        scheduleType: 'SCHEDULED',
        highAlert,
        status: 'PENDING',
      });

      generated.push({
        id: `EMAR-${rx.id}-D2`,
        prescriptionId: rx.id,
        patientId: rx.patientId,
        medicationName: rx.medicationName,
        dose: rx.dosage,
        route: rx.route,
        scheduledTime: slot2Time.toISOString(),
        scheduleType: 'SCHEDULED',
        highAlert,
        status: 'PENDING',
      });
    });

    this.doseSlots.push(...generated);
    return generated;
  }

  /**
   * Record medication administration (BCMA)
   */
  public static recordAdministration(input: {
    slotId: string;
    nurseId: string;
    nurseName: string;
    coSigningNurseId?: string;
    coSigningNurseName?: string;
    status: 'GIVEN' | 'HELD' | 'REFUSED';
    siteOfAdministration?: string;
    barcodeVerified: boolean;
    vitalsBeforeAdmin?: {
      heartRate?: number;
      bloodPressure?: string;
      bloodGlucose?: number;
    };
    nurseNotes?: string;
  }): EmarDoseSlot {
    const slot = this.doseSlots.find((s) => s.id === input.slotId);
    if (!slot) throw new Error(`eMAR dose slot ${input.slotId} not found`);

    if (slot.highAlert.requiresDualSignOff && input.status === 'GIVEN' && !input.coSigningNurseId) {
      throw new Error(`SAFETY PROTOCOL VIOLATION: High-alert medication '${slot.medicationName}' requires dual-nurse co-signature.`);
    }

    slot.status = input.status;
    slot.administrationDetails = {
      administeredAt: new Date().toISOString(),
      administeredByNurseId: input.nurseId,
      administeredByNurseName: input.nurseName,
      coSigningNurseId: input.coSigningNurseId,
      coSigningNurseName: input.coSigningNurseName,
      siteOfAdministration: input.siteOfAdministration,
      barcodeVerified: input.barcodeVerified,
      vitalsBeforeAdmin: input.vitalsBeforeAdmin,
      nurseNotes: input.nurseNotes,
    };

    return slot;
  }
}
