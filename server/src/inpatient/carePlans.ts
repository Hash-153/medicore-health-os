/**
 * Inpatient Nursing Assessment & Clinical Risk Scoring Engine
 * Braden Pressure Injury Scale, Morse Fall Risk, CIWA-Ar Alcohol Withdrawal & CAM-ICU Delirium Protocols
 */

export interface BradenScaleInput {
  sensoryPerception: 1 | 2 | 3 | 4; // 1 = completely limited, 4 = no impairment
  moistureExposure: 1 | 2 | 3 | 4; // 1 = constantly moist, 4 = rarely moist
  physicalActivity: 1 | 2 | 3 | 4; // 1 = bedfast, 4 = walks frequently
  mobility: 1 | 2 | 3 | 4; // 1 = completely immobile, 4 = no limitations
  nutritionIntake: 1 | 2 | 3 | 4; // 1 = very poor, 4 = excellent
  frictionAndShear: 1 | 2 | 3; // 1 = problem, 2 = potential problem, 3 = no apparent problem
}

export interface MorseFallScaleInput {
  historyOfFallingInPast3Months: boolean; // 25 pts
  secondaryDiagnosisPresent: boolean; // 15 pts
  ambulatoryAid: 'NONE_BEDREST_NURSE_ASSIST' | 'CRUTCHES_CANE_WALKER' | 'FURNITURE_SUPPORT'; // 0, 15, 30 pts
  hasIvAccessOrHeparinLock: boolean; // 20 pts
  gaitAndTransferring: 'NORMAL_BEDREST_IMMOBILE' | 'WEAK' | 'IMPAIRED_CLUTCHING'; // 0, 10, 20 pts
  mentalStatus: 'ORIENTED_TO_OWN_ABILITY' | 'OVERESTIMATES_OR_FORGETS_LIMITATIONS'; // 0, 15 pts
}

export interface CiwaArInput {
  nauseaAndVomiting: number; // 0 - 7
  tremor: number; // 0 - 7
  paroxysmalSweats: number; // 0 - 7
  anxiety: number; // 0 - 7
  agitation: number; // 0 - 7
  tactileDisturbances: number; // 0 - 7 (itching, pins/needles, numbness, burning, bugs)
  auditoryDisturbances: number; // 0 - 7 (harshness, scary sounds, auditory hallucinations)
  visualDisturbances: number; // 0 - 7 (light sensitivity, visual hallucinations)
  headacheOrFullnessInHead: number; // 0 - 7
  orientationAndCloudingOfSensorium: number; // 0 - 4 (0 = oriented x4, 4 = disoriented to place/person)
}

export interface CamIcuInput {
  feature1AcuteOnsetOrFluctuatingCourse: boolean;
  feature2InattentionScore: number; // Squeeze on letter 'A' in "SAVEAHAART" (0-10, inattention if errors > 2)
  feature3AlteredLevelOfConsciousness: boolean; // RASS != 0 (e.g. RASS -1 to -3 or +1 to +4)
  feature4DisorganizedThinkingErrors: number; // 4 questions + 1 command (disorganized if errors > 1)
}

export class NursingAssessmentEngine {
  /**
   * Evaluate Braden Scale for Pressure Injury Risk (Total: 6 - 23)
   */
  public static calculateBraden(input: BradenScaleInput): {
    totalScore: number;
    riskTier: 'VERY_HIGH_RISK' | 'HIGH_RISK' | 'MODERATE_RISK' | 'MILD_RISK' | 'NO_RISK';
    nursingInterventions: string[];
  } {
    const total =
      input.sensoryPerception +
      input.moistureExposure +
      input.physicalActivity +
      input.mobility +
      input.nutritionIntake +
      input.frictionAndShear;

    let tier: 'VERY_HIGH_RISK' | 'HIGH_RISK' | 'MODERATE_RISK' | 'MILD_RISK' | 'NO_RISK' = 'NO_RISK';
    const interventions: string[] = [];

    if (total <= 9) {
      tier = 'VERY_HIGH_RISK';
      interventions.push('Mandatory Q2H structured repositioning with 30-degree lateral tilt wedges.');
      interventions.push('Specialty low-air-loss or alternating pressure mattress overlay.');
      interventions.push('Apply silicone sacral foam dressing (Mepilex Border) for prophylactic shear protection.');
      interventions.push('Heel suspension boots (Prevalon) to fully float calcaneus off mattress surface.');
      interventions.push('Registered Dietitian clinical consult for high-protein nutritional supplementation (1.2-1.5 g/kg/day).');
    } else if (total <= 12) {
      tier = 'HIGH_RISK';
      interventions.push('Q2H turn schedule with logbook documentation.');
      interventions.push('Pressure redistribution foam mattress.');
      interventions.push('Heel elevation with pillows.');
      interventions.push('Barrier cream application after each incontinence episode.');
    } else if (total <= 14) {
      tier = 'MODERATE_RISK';
      interventions.push('Q2H repositioning schedule.');
      interventions.push('Moisture barrier skin protectant.');
      interventions.push('Encourage active bed mobility and physical therapy ambulation.');
    } else if (total <= 18) {
      tier = 'MILD_RISK';
      interventions.push('Daily comprehensive skin inspection and moisture management.');
    }

    return {
      totalScore: total,
      riskTier: tier,
      nursingInterventions: interventions,
    };
  }

  /**
   * Evaluate Morse Fall Scale (Total: 0 - 125)
   */
  public static calculateMorseFall(input: MorseFallScaleInput): {
    totalScore: number;
    riskTier: 'HIGH_FALL_RISK' | 'MODERATE_FALL_RISK' | 'LOW_FALL_RISK';
    fallPrecautions: string[];
  } {
    let total = 0;
    if (input.historyOfFallingInPast3Months) total += 25;
    if (input.secondaryDiagnosisPresent) total += 15;

    if (input.ambulatoryAid === 'FURNITURE_SUPPORT') total += 30;
    else if (input.ambulatoryAid === 'CRUTCHES_CANE_WALKER') total += 15;

    if (input.hasIvAccessOrHeparinLock) total += 20;

    if (input.gaitAndTransferring === 'IMPAIRED_CLUTCHING') total += 20;
    else if (input.gaitAndTransferring === 'WEAK') total += 10;

    if (input.mentalStatus === 'OVERESTIMATES_OR_FORGETS_LIMITATIONS') total += 15;

    let tier: 'HIGH_FALL_RISK' | 'MODERATE_FALL_RISK' | 'LOW_FALL_RISK' = 'LOW_FALL_RISK';
    const precautions: string[] = [];

    if (total >= 45) {
      tier = 'HIGH_FALL_RISK';
      precautions.push('Yellow fall risk wristband & yellow non-skid socks applied.');
      precautions.push('Bed in lowest position with floor mat on exit side.');
      precautions.push('Bed and chair exit alarms engaged and tested every shift.');
      precautions.push('One-on-one assist required for all transfers and toileting (call bell within immediate reach).');
      precautions.push('Consider virtual continuous video patient monitoring or bedside sitter if impulsive.');
    } else if (total >= 25) {
      tier = 'MODERATE_FALL_RISK';
      precautions.push('Standard fall precautions with frequent rounding (4P checks: Pain, Position, Potty, Possessions).');
      precautions.push('Assist of 1 for ambulation.');
    }

    return {
      totalScore: total,
      riskTier: tier,
      fallPrecautions: precautions,
    };
  }

  /**
   * Evaluate CIWA-Ar for Alcohol Withdrawal Protocol (Total: 0 - 67)
   */
  public static calculateCiwaAr(input: CiwaArInput): {
    totalScore: number;
    severityCategory: 'MILD_WITHDRAWAL' | 'MODERATE_WITHDRAWAL' | 'SEVERE_WITHDRAWAL_DT_RISK';
    pharmacotherapyRecommendation: string;
  } {
    const total =
      input.nauseaAndVomiting +
      input.tremor +
      input.paroxysmalSweats +
      input.anxiety +
      input.agitation +
      input.tactileDisturbances +
      input.auditoryDisturbances +
      input.visualDisturbances +
      input.headacheOrFullnessInHead +
      input.orientationAndCloudingOfSensorium;

    let sev: 'MILD_WITHDRAWAL' | 'MODERATE_WITHDRAWAL' | 'SEVERE_WITHDRAWAL_DT_RISK' = 'MILD_WITHDRAWAL';
    let rec = 'Score < 10: Non-pharmacological supportive care. Reassess CIWA-Ar in 4 hours.';

    if (total >= 20) {
      sev = 'SEVERE_WITHDRAWAL_DT_RISK';
      rec = `CRITICAL CIWA-Ar (${total} >= 20): High risk of Delirium Tremens (DTs) and withdrawal seizures. Administer Lorazepam 2 - 4 mg IV push (or Diazepam 10-20 mg IV) immediately. Reassess CIWA-Ar every 1 hour until score < 10. Continuous cardiac monitoring.`;
    } else if (total >= 10) {
      sev = 'MODERATE_WITHDRAWAL';
      rec = `MODERATE CIWA-Ar (${total} between 10-19): Administer Lorazepam 1 - 2 mg PO/IV per symptom-triggered withdrawal order set. Reassess CIWA-Ar in 2 hours.`;
    }

    return {
      totalScore: total,
      severityCategory: sev,
      pharmacotherapyRecommendation: rec,
    };
  }

  /**
   * Evaluate CAM-ICU for Delirium (Positive = Feature 1 AND Feature 2 AND (Feature 3 OR Feature 4))
   */
  public static evaluateCamIcu(input: CamIcuInput): {
    isDeliriumPositive: boolean;
    deliriumSubtypeDescription: string;
    clinicalActionPlan: string;
  } {
    const feature1 = input.feature1AcuteOnsetOrFluctuatingCourse;
    const feature2 = input.feature2InattentionScore < 8; // Inattention if errors > 2 in 10-letter test
    const feature3 = input.feature3AlteredLevelOfConsciousness;
    const feature4 = input.feature4DisorganizedThinkingErrors > 1;

    const isPositive = feature1 && feature2 && (feature3 || feature4);

    let subtype = 'No Delirium Detected';
    let plan = 'Continue standard ICU delirium prevention (ABCDEF bundle: spontaneous breathing trials, early mobility, sleep hygiene).';

    if (isPositive) {
      subtype = feature3 ? 'Hyperactive / Mixed Delirium' : 'Hypoactive Delirium (Quiet Confusion)';
      plan = 'CAM-ICU POSITIVE: Delirium confirmed. Screen for underlying reversible etiologies (THINK mnemonic: Toxic situations, Hypoxemia/electrolyte disturbances, Infection/Sepsis, Non-pharmacological sleep deficit, Kidney/liver failure). Minimize sedative infusions and promote daylight orientation.';
    }

    return {
      isDeliriumPositive: isPositive,
      deliriumSubtypeDescription: subtype,
      clinicalActionPlan: plan,
    };
  }
}
