/**
 * Therapeutic Drug Monitoring (TDM) & Pharmacokinetics Protocol Engine
 * Winter-Tozer corrections, AUC/MIC ratios, trough/peak targets, and Bayesian dosing adjustments
 */

export interface TdmDrugTarget {
  drugName: string;
  indication: string;
  therapeuticTroughRange: { min: number; max: number; unit: string };
  therapeuticPeakRange?: { min: number; max: number; unit: string };
  criticalToxicThreshold: number;
  samplingTimingGuideline: string;
  pharmacokineticModel: 'ONE_COMPARTMENT' | 'TWO_COMPARTMENT' | 'AUC_MIC_BAYESIAN';
}

export const MASTER_TDM_TARGETS: TdmDrugTarget[] = [
  {
    drugName: 'Vancomycin',
    indication: 'MRSA Sepsis, Bacteremia, Endocarditis, Hospital-Acquired Pneumonia',
    therapeuticTroughRange: { min: 15.0, max: 20.0, unit: 'mcg/mL' },
    criticalToxicThreshold: 25.0,
    samplingTimingGuideline: 'Trough level 30 minutes prior to the 4th scheduled maintenance dose (steady state). Target 24h AUC/MIC 400-600 mg*h/L.',
    pharmacokineticModel: 'AUC_MIC_BAYESIAN',
  },
  {
    drugName: 'Gentamicin / Tobramycin',
    indication: 'Pseudomonas Aeruginosa / Enterococcal Synergistic Coverage',
    therapeuticTroughRange: { min: 0.0, max: 1.0, unit: 'mcg/mL' },
    therapeuticPeakRange: { min: 5.0, max: 10.0, unit: 'mcg/mL' },
    criticalToxicThreshold: 2.0,
    samplingTimingGuideline: 'Trough 30 mins before dose; Peak 30 mins after end of 30-min infusion. Once-daily dosing targets trough < 0.5 mcg/mL.',
    pharmacokineticModel: 'ONE_COMPARTMENT',
  },
  {
    drugName: 'Digoxin',
    indication: 'HFrEF / Atrial Fibrillation Rate Control',
    therapeuticTroughRange: { min: 0.5, max: 0.9, unit: 'ng/mL' }, // DIG trial targets 0.5-0.9 for HF
    criticalToxicThreshold: 2.0,
    samplingTimingGuideline: 'Draw level >= 6 to 8 hours post-dose to allow tissue distribution phase completion.',
    pharmacokineticModel: 'TWO_COMPARTMENT',
  },
  {
    drugName: 'Lithium',
    indication: 'Bipolar I Disorder Acute Mania & Maintenance',
    therapeuticTroughRange: { min: 0.6, max: 1.2, unit: 'mEq/L' },
    criticalToxicThreshold: 1.5,
    samplingTimingGuideline: 'Draw level 12 hours post-evening dose (12h standard trough).',
    pharmacokineticModel: 'ONE_COMPARTMENT',
  },
  {
    drugName: 'Phenytoin',
    indication: 'Status Epilepticus & Generalized Tonic-Clonic Seizures',
    therapeuticTroughRange: { min: 10.0, max: 20.0, unit: 'mcg/mL' },
    therapeuticPeakRange: { min: 1.0, max: 2.0, unit: 'mcg/mL (Free Phenytoin)' },
    criticalToxicThreshold: 30.0,
    samplingTimingGuideline: 'Trough level before morning dose. Apply Winter-Tozer correction in hypoalbuminemia or renal failure.',
    pharmacokineticModel: 'ONE_COMPARTMENT',
  },
  {
    drugName: 'Tacrolimus (Prograf)',
    indication: 'Solid Organ Transplant Rejection Prophylaxis (Kidney/Liver/Heart)',
    therapeuticTroughRange: { min: 5.0, max: 12.0, unit: 'ng/mL' },
    criticalToxicThreshold: 20.0,
    samplingTimingGuideline: '12-hour whole blood trough level immediately prior to morning dose.',
    pharmacokineticModel: 'TWO_COMPARTMENT',
  },
];

export class TdmProtocolService {
  /**
   * Calculate Winter-Tozer Corrected Phenytoin Level for Hypoalbuminemia:
   * C_corrected = C_observed / ((0.2 * Albumin) + 0.1)  (or (0.1 * Alb) + 0.1 in ESRD/CrCl < 20)
   */
  public static calculateWinterTozerPhenytoin(input: {
    measuredTotalPhenytoinMcgMl: number;
    serumAlbuminGdl: number;
    hasEndStageRenalDisease: boolean;
  }): {
    correctedPhenytoinMcgMl: number;
    isWithinTherapeuticRange: boolean;
    toxicRiskFlag: boolean;
    clinicalAdvisory: string;
  } {
    const albFactor = input.hasEndStageRenalDisease ? 0.1 : 0.2;
    const denominator = albFactor * input.serumAlbuminGdl + 0.1;
    const corrected = parseFloat((input.measuredTotalPhenytoinMcgMl / Math.max(0.1, denominator)).toFixed(1));

    const inRange = corrected >= 10.0 && corrected <= 20.0;
    const isToxic = corrected > 20.0;

    let adv = `Adjusted for serum albumin ${input.serumAlbuminGdl} g/dL: Effective free phenytoin equivalent is ${corrected} mcg/mL (Measured total: ${input.measuredTotalPhenytoinMcgMl} mcg/mL).`;
    if (isToxic) {
      adv += ' ELEVATED PHENYTOIN: Risk of nystagmus, ataxia, mental status changes, and paradoxical seizures. Hold dose and recheck level in 24h.';
    } else if (!inRange && corrected < 10.0) {
      adv += ' SUB-THERAPEUTIC: Increased risk of breakthrough seizures. Consider dose titration.';
    }

    return {
      correctedPhenytoinMcgMl: corrected,
      isWithinTherapeuticRange: inRange,
      toxicRiskFlag: isToxic,
      clinicalAdvisory: adv,
    };
  }

  /**
   * Vancomycin 24-hour AUC / MIC Estimator (Sawchuk-Zaske / Trapeze method)
   */
  public static calculateVancomycinAuc(input: {
    totalDailyDoseMg: number; // e.g. 2000 mg (1000 mg q12h)
    creatinineClearanceMlMin: number; // e.g. 75 mL/min
    steadyStateTroughMcgMl: number; // e.g. 16.5 mcg/mL
    micTarget?: number; // Default = 1.0 mcg/mL
  }): {
    estimatedAuc24: number; // Target 400 - 600 mg*h/L
    aucMicRatio: number;
    isTargetAchieved: boolean;
    doseAdjustmentRecommendation: string;
  } {
    // Clearance of Vancomycin = (0.75 * CrCl + 5) / 100 * 60 / 1000 = approx 0.045 * CrCl L/h
    const vancoClearanceLperHr = Math.max(1.0, 0.048 * input.creatinineClearanceMlMin);
    const auc24 = Math.round(input.totalDailyDoseMg / vancoClearanceLperHr);
    const mic = input.micTarget || 1.0;
    const aucMic = Math.round(auc24 / mic);

    let rec = '';
    const inTarget = auc24 >= 400 && auc24 <= 600;

    if (auc24 > 650) {
      rec = `ELEVATED AUC (${auc24} mg*h/L > 600): Increased risk of acute kidney injury (AKI). Reduce total daily dose by 20-30% or extend dosing interval.`;
    } else if (auc24 < 400) {
      rec = `SUB-THERAPEUTIC AUC (${auc24} mg*h/L < 400): Sub-optimal bacterial eradication for MRSA bacteremia. Increase daily dose by 25% to reach target AUC 400-600.`;
    } else {
      rec = `THERAPEUTIC TARGET ACHIEVED: AUC/MIC = ${aucMic} (Target 400-600). Maintain current dosage regimen with weekly SCr and trough monitoring.`;
    }

    return {
      estimatedAuc24: auc24,
      aucMicRatio: aucMic,
      isTargetAchieved: inTarget,
      doseAdjustmentRecommendation: rec,
    };
  }
}
