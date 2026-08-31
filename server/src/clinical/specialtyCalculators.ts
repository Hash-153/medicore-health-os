/**
 * Specialty Clinical Decision Support (CDSS) & Evidence-Based Calculators
 * Implements validated medical scoring systems for Cardiology, Critical Care, Hepatology, Pulmonology, and Nephrology.
 */

export interface HeartScoreInput {
  history: 0 | 1 | 2; // 0 = Slightly suspicious, 1 = Moderately, 2 = Highly
  ecg: 0 | 1 | 2; // 0 = Normal, 1 = Non-specific repol, 2 = Significant ST deviation
  age: number; // <45 = 0, 45-64 = 1, >=65 = 2
  riskFactorsCount: number; // 0 = 0 pts, 1-2 = 1 pt, >=3 or known CAD = 2 pts
  troponinInitial: 0 | 1 | 2; // 0 = <=Normal limit, 1 = 1-3x limit, 2 = >3x limit
}

export interface MeldNaInput {
  creatinine: number; // mg/dL (min 1.0, max 4.0)
  bilirubin: number; // mg/dL (min 1.0)
  inr: number; // min 1.0
  sodium: number; // mEq/L (bounded between 125 and 137)
  onDialysisTwiceInPastWeek?: boolean;
}

export interface SofaScoreInput {
  pao2Fio2Ratio?: number; // mmHg (e.g. 400 = 0, 300-400 = 1, 200-300 = 2, 100-200 with vent = 3, <100 with vent = 4)
  platelets: number; // x10^3/uL (>=150 = 0, 100-149 = 1, 50-99 = 2, 20-49 = 3, <20 = 4)
  bilirubin: number; // mg/dL (<1.2 = 0, 1.2-1.9 = 1, 2.0-5.9 = 2, 6.0-11.9 = 3, >=12.0 = 4)
  meanArterialPressure: number; // mmHg (MAP >= 70 = 0, MAP < 70 = 1, on dopamine/dobutamine = 2, on norepi/epi = 3/4)
  glasgowComaScale: number; // 15 = 0, 13-14 = 1, 10-12 = 2, 6-9 = 3, <6 = 4
  creatinine: number; // mg/dL (<1.2 = 0, 1.2-1.9 = 1, 2.0-3.4 = 2, 3.5-4.9 = 3, >=5.0 = 4)
}

export interface Curb65Input {
  confusion: boolean;
  bun: number; // mg/dL (>19 mg/dL = 1 pt)
  respiratoryRate: number; // (>=30 /min = 1 pt)
  systolicBp: number; // (<90 mmHg = 1 pt)
  diastolicBp: number; // (<=60 mmHg = 1 pt)
  age: number; // (>=65 yrs = 1 pt)
}

export interface WellsPeInput {
  clinicalSignsDvt: boolean; // +3 pts
  peMostLikelyDiagnosis: boolean; // +3 pts
  heartRateOver100: boolean; // +1.5 pts
  immobilizationOrSurgeryInPast4Weeks: boolean; // +1.5 pts
  previousDvtOrPe: boolean; // +1.5 pts
  hemoptysis: boolean; // +1 pt
  malignancyTreatedInPast6Months: boolean; // +1 pt
}

export class SpecialtyCalculators {
  /**
   * HEART Score for Major Adverse Cardiac Events (MACE) in Chest Pain Patients
   */
  public static calculateHeartScore(input: HeartScoreInput): {
    score: number;
    riskCategory: 'LOW' | 'INTERMEDIATE' | 'HIGH';
    sixWeekMaceRiskPercent: string;
    managementRecommendation: string;
  } {
    let score = input.history + input.ecg + input.troponinInitial;

    // Age points
    if (input.age >= 65) score += 2;
    else if (input.age >= 45) score += 1;

    // Risk factors points
    if (input.riskFactorsCount >= 3) score += 2;
    else if (input.riskFactorsCount >= 1) score += 1;

    let riskCategory: 'LOW' | 'INTERMEDIATE' | 'HIGH' = 'LOW';
    let sixWeekMaceRiskPercent = '0.9 - 1.7%';
    let managementRecommendation = 'Low risk: Candidate for early discharge and outpatient provocative testing.';

    if (score >= 7) {
      riskCategory = 'HIGH';
      sixWeekMaceRiskPercent = '50 - 65%';
      managementRecommendation = 'High risk: Immediate admission, aggressive medical therapy, and early invasive coronary angiography.';
    } else if (score >= 4) {
      riskCategory = 'INTERMEDIATE';
      sixWeekMaceRiskPercent = '12 - 16.6%';
      managementRecommendation = 'Intermediate risk: Inpatient or observation unit admission for serial troponins and inpatient non-invasive testing.';
    }

    return {
      score,
      riskCategory,
      sixWeekMaceRiskPercent,
      managementRecommendation,
    };
  }

  /**
   * MELD-Na (Model for End-Stage Liver Disease Sodium) Score
   * 2016 OPTN/UNOS allocation formula
   */
  public static calculateMeldNa(input: MeldNaInput): {
    meldScore: number;
    meldNaScore: number;
    threeMonthMortalityPercent: string;
    transplantTier: string;
  } {
    let cr = input.onDialysisTwiceInPastWeek ? 4.0 : Math.max(1.0, Math.min(4.0, input.creatinine));
    let bili = Math.max(1.0, input.bilirubin);
    let inr = Math.max(1.0, input.inr);

    // Initial MELD (iMELD) = 9.57*ln(Cr) + 3.78*ln(Bili) + 11.2*ln(INR) + 6.43
    const meldRaw = 9.57 * Math.log(cr) + 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 6.43;
    const meldScore = Math.round(meldRaw);

    let meldNa = meldScore;
    if (meldScore > 11) {
      const naBounded = Math.max(125, Math.min(137, input.sodium));
      meldNa = Math.round(meldScore + 1.32 * (137 - naBounded) - 0.033 * meldScore * (137 - naBounded));
    }
    meldNa = Math.max(6, Math.min(40, meldNa));

    let threeMonthMortality = '1.9%';
    let transplantTier = 'Low Priority (Outpatient management)';

    if (meldNa >= 30) {
      threeMonthMortality = '52.6 - 71.3%';
      transplantTier = 'Critical Priority (ICU / Status 1 Candidate)';
    } else if (meldNa >= 20) {
      threeMonthMortality = '19.6%';
      transplantTier = 'High Priority (Active UNOS Listing)';
    } else if (meldNa >= 15) {
      threeMonthMortality = '6.0%';
      transplantTier = 'Standard Transplant Evaluation';
    }

    return {
      meldScore,
      meldNaScore: meldNa,
      threeMonthMortalityPercent: threeMonthMortality,
      transplantTier,
    };
  }

  /**
   * CURB-65 Score for Community-Acquired Pneumonia Severity
   */
  public static calculateCurb65(input: Curb65Input): {
    score: number;
    riskGroup: 'LOW' | 'INTERMEDIATE' | 'HIGH';
    thirtyDayMortalityPercent: string;
    recommendedSiteOfCare: string;
  } {
    let score = 0;
    if (input.confusion) score++;
    if (input.bun > 19) score++;
    if (input.respiratoryRate >= 30) score++;
    if (input.systolicBp < 90 || input.diastolicBp <= 60) score++;
    if (input.age >= 65) score++;

    let riskGroup: 'LOW' | 'INTERMEDIATE' | 'HIGH' = 'LOW';
    let thirtyDayMortality = '< 1.5%';
    let careSite = 'Low risk: Suitable for outpatient treatment.';

    if (score >= 3) {
      riskGroup = 'HIGH';
      thirtyDayMortality = '15 - 40%';
      careSite = 'High risk: Urgent hospital admission; consider Intensive Care Unit (ICU) admission.';
    } else if (score === 2) {
      riskGroup = 'INTERMEDIATE';
      thirtyDayMortality = '9.2%';
      careSite = 'Moderate risk: Inpatient admission or supervised outpatient monitoring.';
    }

    return {
      score,
      riskGroup,
      thirtyDayMortalityPercent: thirtyDayMortality,
      recommendedSiteOfCare: careSite,
    };
  }

  /**
   * Wells' Criteria for Pulmonary Embolism (PE)
   */
  public static calculateWellsPe(input: WellsPeInput): {
    score: number;
    probabilityTier: 'LOW' | 'MODERATE' | 'HIGH';
    peProbabilityPercent: string;
    recommendedDiagnosticStrategy: string;
  } {
    let score = 0;
    if (input.clinicalSignsDvt) score += 3.0;
    if (input.peMostLikelyDiagnosis) score += 3.0;
    if (input.heartRateOver100) score += 1.5;
    if (input.immobilizationOrSurgeryInPast4Weeks) score += 1.5;
    if (input.previousDvtOrPe) score += 1.5;
    if (input.hemoptysis) score += 1.0;
    if (input.malignancyTreatedInPast6Months) score += 1.0;

    let probabilityTier: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
    let peProbability = '1.3 - 3.4%';
    let strategy = 'Low probability: Order high-sensitivity D-Dimer. If negative (<500 ng/mL), PE ruled out without imaging.';

    if (score > 6.0) {
      probabilityTier = 'HIGH';
      peProbability = '37.5 - 65%';
      strategy = 'High probability: Proceed immediately to CT Pulmonary Angiography (CTPA). Do not delay for D-Dimer.';
    } else if (score >= 2.0) {
      probabilityTier = 'MODERATE';
      peProbability = '16.2%';
      strategy = 'Moderate probability: Order high-sensitivity D-Dimer or proceed directly to CTPA based on clinical acuity.';
    }

    return {
      score,
      probabilityTier,
      peProbabilityPercent: peProbability,
      recommendedDiagnosticStrategy: strategy,
    };
  }

  /**
   * Fractional Excretion of Sodium (FENa) for Acute Kidney Injury Differentiation
   * FENa = (Urine Na * Serum Cr) / (Serum Na * Urine Cr) * 100
   */
  public static calculateFeNa(input: {
    urineSodiumMmol: number;
    serumSodiumMmol: number;
    urineCreatinineMgDl: number;
    serumCreatinineMgDl: number;
  }): {
    feNaPercent: number;
    etiology: 'PRE_RENAL' | 'INTRINSIC_ATN' | 'POST_RENAL_OR_EQUIVOCAL';
    clinicalInterpretation: string;
  } {
    const feNa =
      ((input.urineSodiumMmol * input.serumCreatinineMgDl) /
        (input.serumSodiumMmol * input.urineCreatinineMgDl)) *
      100;
    const rounded = parseFloat(feNa.toFixed(2));

    let etiology: 'PRE_RENAL' | 'INTRINSIC_ATN' | 'POST_RENAL_OR_EQUIVOCAL' = 'PRE_RENAL';
    let interp = 'FENa < 1%: Suggests Pre-Renal Azotemia (Hypovolemia, CHF, renal hypoperfusion). Intact tubular sodium reabsorption.';

    if (rounded > 2.0) {
      etiology = 'INTRINSIC_ATN';
      interp = 'FENa > 2%: Suggests Intrinsic Renal Failure (Acute Tubular Necrosis / Nephrotoxic injury). Impaired tubular sodium reabsorption.';
    } else if (rounded >= 1.0) {
      etiology = 'POST_RENAL_OR_EQUIVOCAL';
      interp = 'FENa 1 - 2%: Indeterminate / Equivocal. Correlate with clinical history, diuretics, and urinalysis microscopy.';
    }

    return {
      feNaPercent: rounded,
      etiology,
      clinicalInterpretation: interp,
    };
  }
}
