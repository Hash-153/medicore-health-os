/**
 * Clinical Decision Support Calculators
 * Standardized evidence-based medical algorithms
 */

export interface VitalsInput {
  respiratoryRate: number; // breaths/min
  spO2: number; // percentage
  supplementalOxygen: boolean;
  systolicBP: number; // mmHg
  pulseRate: number; // beats/min
  consciousness: 'ALERT' | 'VOICE' | 'PAIN' | 'UNRESPONSIVE'; // AVPU scale
  temperature: number; // Celsius
}

export interface News2Result {
  score: number;
  riskLevel: 'LOW' | 'LOW-MEDIUM' | 'MEDIUM' | 'HIGH';
  clinicalAction: string;
  componentScores: {
    respiratoryRate: number;
    spO2: number;
    oxygen: number;
    systolicBP: number;
    pulseRate: number;
    consciousness: number;
    temperature: number;
  };
}

export class ClinicalCalculators {
  /**
   * Calculate NEWS2 (National Early Warning Score 2) for acute clinical deterioration
   */
  public static calculateNEWS2(vitals: VitalsInput): News2Result {
    let rrScore = 0;
    if (vitals.respiratoryRate <= 8) rrScore = 3;
    else if (vitals.respiratoryRate <= 11) rrScore = 1;
    else if (vitals.respiratoryRate <= 20) rrScore = 0;
    else if (vitals.respiratoryRate <= 24) rrScore = 2;
    else rrScore = 3;

    let spO2Score = 0;
    if (vitals.spO2 <= 91) spO2Score = 3;
    else if (vitals.spO2 <= 93) spO2Score = 2;
    else if (vitals.spO2 <= 95) spO2Score = 1;
    else spO2Score = 0;

    const oxygenScore = vitals.supplementalOxygen ? 2 : 0;

    let bpScore = 0;
    if (vitals.systolicBP <= 90) bpScore = 3;
    else if (vitals.systolicBP <= 100) bpScore = 2;
    else if (vitals.systolicBP <= 110) bpScore = 1;
    else if (vitals.systolicBP <= 219) bpScore = 0;
    else bpScore = 3;

    let hrScore = 0;
    if (vitals.pulseRate <= 40) hrScore = 3;
    else if (vitals.pulseRate <= 50) hrScore = 1;
    else if (vitals.pulseRate <= 90) hrScore = 0;
    else if (vitals.pulseRate <= 110) hrScore = 1;
    else if (vitals.pulseRate <= 130) hrScore = 2;
    else hrScore = 3;

    const cvScore = vitals.consciousness === 'ALERT' ? 0 : 3;

    let tempScore = 0;
    if (vitals.temperature <= 35.0) tempScore = 3;
    else if (vitals.temperature <= 36.0) tempScore = 1;
    else if (vitals.temperature <= 38.0) tempScore = 0;
    else if (vitals.temperature <= 39.0) tempScore = 1;
    else tempScore = 2;

    const totalScore = rrScore + spO2Score + oxygenScore + bpScore + hrScore + cvScore + tempScore;

    let riskLevel: 'LOW' | 'LOW-MEDIUM' | 'MEDIUM' | 'HIGH' = 'LOW';
    let clinicalAction = 'Routine 12-hourly observation monitoring.';

    if (totalScore >= 7 || cvScore === 3 || rrScore === 3 || bpScore === 3) {
      riskLevel = 'HIGH';
      clinicalAction = 'URGENT: Immediate emergency review by Medical Emergency Team (MET) / ICU registrar.';
    } else if (totalScore >= 5) {
      riskLevel = 'MEDIUM';
      clinicalAction = 'Urgent review by ward physician; increase monitoring to at least hourly.';
    } else if (totalScore >= 1) {
      riskLevel = 'LOW-MEDIUM';
      clinicalAction = 'Inform registered nurse; increase monitoring frequency to 4-6 hourly.';
    }

    return {
      score: totalScore,
      riskLevel,
      clinicalAction,
      componentScores: {
        respiratoryRate: rrScore,
        spO2: spO2Score,
        oxygen: oxygenScore,
        systolicBP: bpScore,
        pulseRate: hrScore,
        consciousness: cvScore,
        temperature: tempScore,
      },
    };
  }

  /**
   * Calculate eGFR using the 2021 CKD-EPI Creatinine Equation (Race-Free standard)
   * eGFR = 142 * min(Scr/kappa, 1)^alpha * max(Scr/kappa, 1)^-1.200 * 0.9938^Age * (1.012 if female)
   */
  public static calculateEGFR(creatinineMgDl: number, ageYears: number, gender: 'male' | 'female'): {
    egfr: number;
    stage: 'G1 (Normal)' | 'G2 (Mild)' | 'G3a (Mild-Mod)' | 'G3b (Mod-Severe)' | 'G4 (Severe)' | 'G5 (Kidney Failure)';
    interpretation: string;
  } {
    const isFemale = gender.toLowerCase() === 'female';
    const kappa = isFemale ? 0.7 : 0.9;
    const alpha = isFemale ? -0.241 : -0.302;
    const genderFactor = isFemale ? 1.012 : 1.0;

    const scrOverKappa = creatinineMgDl / kappa;
    const minPart = Math.pow(Math.min(scrOverKappa, 1), alpha);
    const maxPart = Math.pow(Math.max(scrOverKappa, 1), -1.2);
    const agePart = Math.pow(0.9938, ageYears);

    const egfr = Math.round(142 * minPart * maxPart * agePart * genderFactor);

    let stage: 'G1 (Normal)' | 'G2 (Mild)' | 'G3a (Mild-Mod)' | 'G3b (Mod-Severe)' | 'G4 (Severe)' | 'G5 (Kidney Failure)';
    let interpretation = '';

    if (egfr >= 90) {
      stage = 'G1 (Normal)';
      interpretation = 'Normal or high kidney function in the absence of other markers of kidney damage.';
    } else if (egfr >= 60) {
      stage = 'G2 (Mild)';
      interpretation = 'Mildly decreased kidney function. Monitor annually.';
    } else if (egfr >= 45) {
      stage = 'G3a (Mild-Mod)';
      interpretation = 'Mild-to-moderate reduction. Adjust renally cleared drug dosages.';
    } else if (egfr >= 30) {
      stage = 'G3b (Mod-Severe)';
      interpretation = 'Moderate-to-severe reduction. High risk of drug accumulation.';
    } else if (egfr >= 15) {
      stage = 'G4 (Severe)';
      interpretation = 'Severely decreased kidney function. Nephrology referral recommended.';
    } else {
      stage = 'G5 (Kidney Failure)';
      interpretation = 'Kidney failure / End-stage renal disease (ESRD). Urgent nephrology care required.';
    }

    return { egfr, stage, interpretation };
  }

  /**
   * Calculate CHA2DS2-VASc score for stroke risk in non-valvular atrial fibrillation
   */
  public static calculateCHA2DS2VASc(params: {
    congestiveHeartFailure: boolean;
    hypertension: boolean;
    age: number;
    diabetes: boolean;
    strokeOrTIAHistory: boolean;
    vascularDisease: boolean; // prior MI, PAD, or aortic plaque
    gender: 'male' | 'female';
  }): { score: number; annualStrokeRiskPercent: number; anticoagulationRecommendation: string } {
    let score = 0;
    if (params.congestiveHeartFailure) score += 1;
    if (params.hypertension) score += 1;
    if (params.age >= 75) score += 2;
    else if (params.age >= 65) score += 1;
    if (params.diabetes) score += 1;
    if (params.strokeOrTIAHistory) score += 2;
    if (params.vascularDisease) score += 1;
    if (params.gender.toLowerCase() === 'female') score += 1;

    // Approximate annual stroke risk percentage
    const strokeRiskMap: Record<number, number> = {
      0: 0.2,
      1: 0.6,
      2: 2.2,
      3: 3.2,
      4: 4.8,
      5: 7.2,
      6: 9.7,
      7: 11.2,
      8: 12.5,
      9: 15.2,
    };

    const annualRisk = strokeRiskMap[Math.min(score, 9)] || 15.2;

    let recommendation = 'Low risk. Anticoagulation generally not indicated.';
    const isMale = params.gender.toLowerCase() === 'male';

    if ((isMale && score >= 2) || (!isMale && score >= 3)) {
      recommendation = 'High risk. Oral anticoagulation strongly recommended (DOAC preferred over Warfarin).';
    } else if ((isMale && score === 1) || (!isMale && score === 2)) {
      recommendation = 'Intermediate risk. Oral anticoagulation should be considered based on clinical bleeding risk.';
    }

    return {
      score,
      annualStrokeRiskPercent: annualRisk,
      anticoagulationRecommendation: recommendation,
    };
  }

  /**
   * Pediatric weight-based dosage calculator with safety limits
   */
  public static calculatePediatricDosing(params: {
    weightKg: number;
    doseMgPerKg: number;
    dosingFrequencyPerDay: number;
    maxSingleDoseMg: number;
    maxDailyDoseMg: number;
  }): {
    singleDoseMg: number;
    dailyTotalMg: number;
    isCappedAtMax: boolean;
    warningMessage?: string;
  } {
    const rawSingleDose = params.weightKg * params.doseMgPerKg;
    const singleDoseMg = Math.min(rawSingleDose, params.maxSingleDoseMg);
    const calculatedDaily = singleDoseMg * params.dosingFrequencyPerDay;
    const dailyTotalMg = Math.min(calculatedDaily, params.maxDailyDoseMg);

    const isCappedAtMax = rawSingleDose > params.maxSingleDoseMg || calculatedDaily > params.maxDailyDoseMg;

    return {
      singleDoseMg: Math.round(singleDoseMg * 10) / 10,
      dailyTotalMg: Math.round(dailyTotalMg * 10) / 10,
      isCappedAtMax,
      warningMessage: isCappedAtMax
        ? `Dose was automatically capped at the maximum adult safety threshold (${params.maxSingleDoseMg}mg single / ${params.maxDailyDoseMg}mg daily).`
        : undefined,
    };
  }

  /**
   * Body Surface Area (BSA) calculation using Mosteller Formula: BSA (m²) = sqrt((height(cm) * weight(kg)) / 3600)
   */
  public static calculateBSA(heightCm: number, weightKg: number): number {
    if (heightCm <= 0 || weightKg <= 0) return 0;
    const bsa = Math.sqrt((heightCm * weightKg) / 3600);
    return Math.round(bsa * 100) / 100;
  }
}
