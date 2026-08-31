/**
 * Inpatient Bed Management, Unit Ward Tracking & SBAR Nurse Handoff Types
 */

export type WardUnitType =
  | 'INTENSIVE_CARE_UNIT' // 1:2 Nurse Ratio
  | 'CORONARY_CARE_UNIT' // 1:2 Nurse Ratio
  | 'NEONATAL_ICU' // 1:2 Nurse Ratio
  | 'STEP_DOWN_TELEMETRY' // 1:3 Nurse Ratio
  | 'MED_SURG_ACUTE' // 1:4-5 Nurse Ratio
  | 'LABOR_AND_DELIVERY' // 1:1-2 Nurse Ratio
  | 'EMERGENCY_OBSERVATION'; // 1:3-4 Nurse Ratio

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'CLEANING_REQUIRED' | 'MAINTENANCE' | 'BLOCKED';

export type IsolationType = 'STANDARD' | 'CONTACT' | 'DROPLET' | 'AIRBORNE' | 'PROTECTIVE_ENVIRONMENT';

export interface InpatientBed {
  id: string;
  unitCode: string;
  unitName: string;
  unitType: WardUnitType;
  roomNumber: string;
  bedLabel: string; // e.g. "Bed-A", "Bed-B"
  status: BedStatus;
  isolationRequired: IsolationType;
  currentPatientId?: string;
  currentPatientName?: string;
  assignedNurseId?: string;
  assignedNurseName?: string;
  telemetryMonitored: boolean;
  ventilatorAttached: boolean;
  lastCleanedAt: string;
}

export interface NurseShiftAssignment {
  nurseId: string;
  nurseName: string;
  shiftType: 'DAY_12H' | 'NIGHT_12H' | 'DAY_8H' | 'EVENING_8H';
  unitCode: string;
  shiftDate: string;
  assignedBedIds: string[];
  maxPatientRatio: number; // California Ratio standard
  totalAcuityScore: number;
}

export interface SbarHandoff {
  id: string;
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  mrn: string;
  unitAndBed: string;
  codeStatus: 'FULL_CODE' | 'DNR' | 'DNI' | 'COMFORT_CARE';
  admitDiagnosis: string;
  situation: string; // Current clinical state and primary event
  background: string; // Relevant medical history, allergies, surgical dates
  assessment: string; // Latest vitals, lab results, telemetry rhythm, IV access
  recommendation: string; // Pending labs, scheduled medications, discharge plan
  nurseGivingHandoff: string;
  nurseReceivingHandoff?: string;
  timestamp: string;
}
