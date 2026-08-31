/**
 * Electronic Medication Administration Record (eMAR) & BCMA Types
 */

export type AdministrationStatus =
  | 'GIVEN'
  | 'HELD'
  | 'REFUSED'
  | 'MISSED'
  | 'SELF_ADMINISTERED'
  | 'NOT_GIVEN_CLINICAL_REASON';

export type MedicationScheduleType = 'SCHEDULED' | 'PRN' | 'STAT' | 'CONTINUOUS_IV';

export interface HighAlertProtocol {
  isHighAlert: boolean;
  requiresDualSignOff: boolean;
  warningText?: string;
}

export interface EmarDoseSlot {
  id: string;
  prescriptionId: string;
  patientId: string;
  medicationName: string;
  dose: string;
  route: string;
  scheduledTime: string; // ISO string
  scheduleType: MedicationScheduleType;
  highAlert: HighAlertProtocol;
  status: 'PENDING' | 'GIVEN' | 'HELD' | 'REFUSED';
  administrationDetails?: {
    administeredAt: string;
    administeredByNurseId: string;
    administeredByNurseName: string;
    coSigningNurseId?: string;
    coSigningNurseName?: string;
    siteOfAdministration?: string; // e.g. "Left Deltoid", "Right Antecubital IV"
    barcodeVerified: boolean;
    vitalsBeforeAdmin?: {
      heartRate?: number;
      bloodPressure?: string;
      bloodGlucose?: number;
    };
    nurseNotes?: string;
  };
}

export interface FiveRightsCheckResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}
