/**
 * Emergency Severity Index (ESI) & Clinical Triage Engine
 * Standardized 5-level ED triage algorithm
 */

export type EsiLevel = 1 | 2 | 3 | 4 | 5;

export interface TriageAssessment {
  esiLevel: EsiLevel;
  categoryName: string;
  colorCode: string;
  targetTimeToPhysicianMinutes: number;
  clinicalRationale: string;
  priorityOrder: number; // 1 = highest priority (resuscitation)
}

export interface TriageInput {
  requiresImmediateLifeSaving: boolean; // Intubation, apnea, pulseless, severe respiratory distress, unresponsiveness
  isHighRiskSituation: boolean; // Acute chest pain, signs of stroke, acute suicidal ideation, severe pain/distress
  isConfusedOrLethargic: boolean;
  severePainScore: number; // 0-10 scale
  expectedResourceCount: number; // 0 = none, 1 = one (e.g. xray), 2+ = two or more (e.g. labs + CT + IV fluids)
  vitalsDangerZone: boolean; // HR > 100, RR > 20, SpO2 < 92% for age
}

export class TriageEngine {
  /**
   * Evaluate Emergency Severity Index (ESI) Level (1 to 5)
   */
  public static evaluateESI(input: TriageInput): TriageAssessment {
    // Step 1: Does the patient require immediate life-saving intervention?
    if (input.requiresImmediateLifeSaving) {
      return {
        esiLevel: 1,
        categoryName: 'Resuscitation (Immediate)',
        colorCode: '#ef4444', // Red
        targetTimeToPhysicianMinutes: 0,
        clinicalRationale: 'Immediate life-saving intervention required. Acute compromise of airway, breathing, or circulation.',
        priorityOrder: 1,
      };
    }

    // Step 2: Is this a high-risk situation, or confused/lethargic/disoriented, or severe pain?
    if (input.isHighRiskSituation || input.isConfusedOrLethargic || input.severePainScore >= 8) {
      return {
        esiLevel: 2,
        categoryName: 'Emergent (Urgent Care Needed)',
        colorCode: '#f97316', // Orange
        targetTimeToPhysicianMinutes: 10,
        clinicalRationale: 'High-risk presentation, altered mental status, or severe acute pain/distress. Rapid physician evaluation required.',
        priorityOrder: 2,
      };
    }

    // Step 3: Resource needs evaluation
    if (input.expectedResourceCount >= 2) {
      // Vital signs danger zone check can up-triage ESI 3 to ESI 2
      if (input.vitalsDangerZone) {
        return {
          esiLevel: 2,
          categoryName: 'Emergent (Up-triaged via Vitals)',
          colorCode: '#f97316',
          targetTimeToPhysicianMinutes: 10,
          clinicalRationale: 'Expected multiple resources with abnormal vital signs exceeding the danger zone threshold.',
          priorityOrder: 2,
        };
      }

      return {
        esiLevel: 3,
        categoryName: 'Urgent (Multiple Resources)',
        colorCode: '#eab308', // Yellow
        targetTimeToPhysicianMinutes: 30,
        clinicalRationale: 'Patient stable but requires multiple diagnostic resources (e.g., blood tests, imaging, IV medications).',
        priorityOrder: 3,
      };
    }

    if (input.expectedResourceCount === 1) {
      return {
        esiLevel: 4,
        categoryName: 'Less Urgent (Single Resource)',
        colorCode: '#10b981', // Green
        targetTimeToPhysicianMinutes: 60,
        clinicalRationale: 'Patient stable, requires a single diagnostic resource or simple procedure (e.g., simple X-ray, suture).',
        priorityOrder: 4,
      };
    }

    // Step 4: No resources needed (ESI 5)
    return {
      esiLevel: 5,
      categoryName: 'Non-Urgent (No Resources)',
      colorCode: '#06b6d4', // Cyan/Blue
      targetTimeToPhysicianMinutes: 120,
      clinicalRationale: 'Patient stable, physical exam only (e.g., prescription refill, minor rash, suture removal).',
      priorityOrder: 5,
    };
  }

  /**
   * Check if vital signs fall into the ESI danger zone
   */
  public static checkVitalsDangerZone(vitals: {
    ageYears: number;
    heartRate: number;
    respiratoryRate: number;
    spO2: number;
  }): boolean {
    if (vitals.spO2 < 92) return true;

    if (vitals.ageYears >= 8) {
      return vitals.heartRate > 100 || vitals.respiratoryRate > 20;
    } else if (vitals.ageYears >= 3) {
      return vitals.heartRate > 140 || vitals.respiratoryRate > 30;
    } else {
      return vitals.heartRate > 160 || vitals.respiratoryRate > 40;
    }
  }
}
