/**
 * Inpatient Bed Management & Nurse Shift Handoff Service
 */

import type { InpatientBed, NurseShiftAssignment, SbarHandoff, WardUnitType, IsolationType } from './types.ts';
import { db } from '../database/memoryDb.ts';

export const SEED_INPATIENT_BEDS: InpatientBed[] = [
  {
    id: 'BED-ICU-401A',
    unitCode: 'ICU-4N',
    unitName: 'Medical Intensive Care Unit (4-North)',
    unitType: 'INTENSIVE_CARE_UNIT',
    roomNumber: '401',
    bedLabel: 'Bed-A',
    status: 'OCCUPIED',
    isolationRequired: 'STANDARD',
    currentPatientId: 'PAT-001',
    currentPatientName: 'Eleanor Vance',
    assignedNurseId: 'NURSE-202',
    assignedNurseName: 'Robert Vance, BSN, RN',
    telemetryMonitored: true,
    ventilatorAttached: false,
    lastCleanedAt: '2026-08-25T06:00:00.000Z',
  },
  {
    id: 'BED-ICU-401B',
    unitCode: 'ICU-4N',
    unitName: 'Medical Intensive Care Unit (4-North)',
    unitType: 'INTENSIVE_CARE_UNIT',
    roomNumber: '401',
    bedLabel: 'Bed-B',
    status: 'AVAILABLE',
    isolationRequired: 'STANDARD',
    telemetryMonitored: true,
    ventilatorAttached: true,
    lastCleanedAt: '2026-08-27T18:00:00.000Z',
  },
  {
    id: 'BED-TEL-502A',
    unitCode: 'TEL-5E',
    unitName: 'Cardiovascular Stepdown Telemetry (5-East)',
    unitType: 'STEP_DOWN_TELEMETRY',
    roomNumber: '502',
    bedLabel: 'Bed-A',
    status: 'OCCUPIED',
    isolationRequired: 'STANDARD',
    currentPatientId: 'PAT-002',
    currentPatientName: 'Marcus Chen',
    assignedNurseId: 'NURSE-204',
    assignedNurseName: 'Maria Garcia, RN',
    telemetryMonitored: true,
    ventilatorAttached: false,
    lastCleanedAt: '2026-08-26T08:00:00.000Z',
  },
  {
    id: 'BED-MED-305A',
    unitCode: 'MED-3W',
    unitName: 'General Med-Surg Acute (3-West)',
    unitType: 'MED_SURG_ACUTE',
    roomNumber: '305',
    bedLabel: 'Bed-A',
    status: 'CLEANING_REQUIRED',
    isolationRequired: 'CONTACT',
    telemetryMonitored: false,
    ventilatorAttached: false,
    lastCleanedAt: '2026-08-27T14:30:00.000Z',
  },
  {
    id: 'BED-MED-305B',
    unitCode: 'MED-3W',
    unitName: 'General Med-Surg Acute (3-West)',
    unitType: 'MED_SURG_ACUTE',
    roomNumber: '305',
    bedLabel: 'Bed-B',
    status: 'AVAILABLE',
    isolationRequired: 'STANDARD',
    telemetryMonitored: false,
    ventilatorAttached: false,
    lastCleanedAt: '2026-08-28T04:00:00.000Z',
  },
];

export class InpatientService {
  private static beds: InpatientBed[] = [...SEED_INPATIENT_BEDS];
  private static handoffs: SbarHandoff[] = [];

  public static listBeds(filter?: { unitCode?: string; status?: string }): InpatientBed[] {
    let result = this.beds;
    if (filter?.unitCode) {
      result = result.filter((b) => b.unitCode === filter.unitCode);
    }
    if (filter?.status) {
      result = result.filter((b) => b.status === filter.status);
    }
    return result;
  }

  public static assignPatientToBed(bedId: string, patientId: string, patientName: string): InpatientBed {
    const bed = this.beds.find((b) => b.id === bedId);
    if (!bed) throw new Error(`Bed with ID ${bedId} not found`);
    if (bed.status !== 'AVAILABLE') throw new Error(`Bed ${bed.roomNumber}-${bed.bedLabel} is not available (Current: ${bed.status})`);

    bed.status = 'OCCUPIED';
    bed.currentPatientId = patientId;
    bed.currentPatientName = patientName;
    return bed;
  }

  public static dischargeBed(bedId: string): InpatientBed {
    const bed = this.beds.find((b) => b.id === bedId);
    if (!bed) throw new Error(`Bed with ID ${bedId} not found`);

    bed.status = 'CLEANING_REQUIRED';
    bed.currentPatientId = undefined;
    bed.currentPatientName = undefined;
    return bed;
  }

  public static completeBedCleaning(bedId: string): InpatientBed {
    const bed = this.beds.find((b) => b.id === bedId);
    if (!bed) throw new Error(`Bed with ID ${bedId} not found`);

    bed.status = 'AVAILABLE';
    bed.lastCleanedAt = new Date().toISOString();
    return bed;
  }

  /**
   * Compile standardized SBAR (Situation, Background, Assessment, Recommendation) nursing handoff
   */
  public static compileSbarHandoff(input: {
    patientId: string;
    nurseGivingHandoff: string;
    nurseReceivingHandoff?: string;
    codeStatus: 'FULL_CODE' | 'DNR' | 'DNI' | 'COMFORT_CARE';
    admitDiagnosis: string;
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  }): SbarHandoff {
    const patient = db.getById(db.patients, input.patientId);
    if (!patient) throw new Error(`Patient ${input.patientId} not found`);

    const assignedBed = this.beds.find((b) => b.currentPatientId === input.patientId);
    const unitAndBed = assignedBed ? `${assignedBed.unitName} - Rm ${assignedBed.roomNumber} (${assignedBed.bedLabel})` : 'Unassigned / Outpatient';

    const handoff: SbarHandoff = {
      id: `SBAR-${Date.now()}`,
      patientId: patient.id,
      patientName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      mrn: patient.mrn,
      unitAndBed,
      codeStatus: input.codeStatus,
      admitDiagnosis: input.admitDiagnosis,
      situation: input.situation,
      background: input.background,
      assessment: input.assessment,
      recommendation: input.recommendation,
      nurseGivingHandoff: input.nurseGivingHandoff,
      nurseReceivingHandoff: input.nurseReceivingHandoff,
      timestamp: new Date().toISOString(),
    };

    this.handoffs.push(handoff);
    return handoff;
  }

  public static getHandoffsForPatient(patientId: string): SbarHandoff[] {
    return this.handoffs.filter((h) => h.patientId === patientId);
  }
}
