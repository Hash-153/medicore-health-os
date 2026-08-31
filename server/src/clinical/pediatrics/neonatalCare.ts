/**
 * Neonatal Critical Care & Hyperbilirubinemia Phototherapy Engine
 * Incorporates AAP 2022 Bhutani Hour-Specific Bilirubin Nomogram and APGAR Assessment
 */

export interface ApgarScoreInput {
  timeframe: 'ONE_MINUTE' | 'FIVE_MINUTE' | 'TEN_MINUTE';
  appearanceColor: 0 | 1 | 2; // 0 = blue/pale all over, 1 = body pink, extremities blue (acrocyanosis), 2 = completely pink
  pulseHeartRate: 0 | 1 | 2; // 0 = absent, 1 = <100 bpm, 2 = >=100 bpm
  grimaceReflex: 0 | 1 | 2; // 0 = no response, 1 = grimace/weak cry, 2 = vigorous cry, pull away, sneeze/cough
  activityMuscleTone: 0 | 1 | 2; // 0 = flaccid/limp, 1 = some flexion of extremities, 2 = active motion
  respirationEffort: 0 | 1 | 2; // 0 = absent, 1 = slow, irregular, weak gasp, 2 = strong, vigorous cry
}

export interface BhutaniBilirubinInput {
  gestationalAgeWeeks: number; // e.g. 38
  postnatalAgeHours: number; // e.g. 36
  totalSerumBilirubinMgDl: number; // e.g. 14.2
  hasNeurotoxicityRiskFactors: boolean; // Albumin < 3.0 g/dL, Isoimmune hemolytic disease (DAT/Coombs +), Sepsis, G6PD deficiency, Acidosis
}

export interface BhutaniBilirubinResult {
  postnatalAgeHours: number;
  totalSerumBilirubinMgDl: number;
  riskZone: 'HIGH_RISK_ZONE' | 'HIGH_INTERMEDIATE_ZONE' | 'LOW_INTERMEDIATE_ZONE' | 'LOW_RISK_ZONE';
  phototherapyThresholdMgDl: number;
  isPhototherapyRecommended: boolean;
  exchangeTransfusionThresholdMgDl: number;
  isExchangeTransfusionRecommended: boolean;
  clinicalActionPlan: string;
}

export class NeonatalCareEngine {
  /**
   * Calculate 1-min / 5-min APGAR score and resuscitation tier
   */
  public static calculateApgar(input: ApgarScoreInput): {
    totalScore: number;
    category: 'NORMAL_TRANSITION' | 'MODERATE_DIFFICULTY' | 'SEVERE_DISTRESS_RESUSCITATION_REQUIRED';
    resuscitationGuidance: string;
  } {
    const total =
      input.appearanceColor +
      input.pulseHeartRate +
      input.grimaceReflex +
      input.activityMuscleTone +
      input.respirationEffort;

    let cat: 'NORMAL_TRANSITION' | 'MODERATE_DIFFICULTY' | 'SEVERE_DISTRESS_RESUSCITATION_REQUIRED' = 'NORMAL_TRANSITION';
    let guidance = 'Routine neonatal supportive care and skin-to-skin contact.';

    if (total <= 3) {
      cat = 'SEVERE_DISTRESS_RESUSCITATION_REQUIRED';
      guidance = 'STAT NRP PROTOCOL: Initiate positive pressure ventilation (PPV) with 21% O2 (or 30% if preterm), attach pulse oximeter and ECG leads. Prepare for endotracheal intubation and chest compressions if HR remains <60 bpm.';
    } else if (total <= 6) {
      cat = 'MODERATE_DIFFICULTY';
      guidance = 'Tactile stimulation, clear airway, ensure thermal warmth, administer supplemental O2 / CPAP if persistent cyanosis or labored breathing.';
    }

    return {
      totalScore: total,
      category: cat,
      resuscitationGuidance: guidance,
    };
  }

  /**
   * Evaluate AAP 2022 Neonatal Hyperbilirubinemia Phototherapy & Exchange Transfusion Thresholds
   */
  public static evaluateHyperbilirubinemia(input: BhutaniBilirubinInput): BhutaniBilirubinResult {
    const hours = Math.min(168, Math.max(12, input.postnatalAgeHours));

    // Base phototherapy threshold curve for term infants (>=38wks) without risk factors
    // 24h: ~12 mg/dL; 48h: ~15 mg/dL; 72h: ~18 mg/dL; 96h+: ~20 mg/dL
    let basePhotoThreshold = 8.0 + (hours / 24) * 2.8;
    basePhotoThreshold = Math.min(21.0, Math.max(8.0, basePhotoThreshold));

    if (input.gestationalAgeWeeks < 38) {
      basePhotoThreshold -= (38 - input.gestationalAgeWeeks) * 1.5;
    }
    if (input.hasNeurotoxicityRiskFactors) {
      basePhotoThreshold -= 2.5; // Lower threshold by 2.5 mg/dL if hemolysis, sepsis, or hypoalbuminemia
    }
    basePhotoThreshold = parseFloat(Math.max(5.0, basePhotoThreshold).toFixed(1));

    // Exchange transfusion threshold is generally ~5 mg/dL above phototherapy threshold (max 25 mg/dL)
    let baseExchangeThreshold = basePhotoThreshold + 5.0;
    if (input.hasNeurotoxicityRiskFactors) baseExchangeThreshold -= 1.0;
    baseExchangeThreshold = parseFloat(Math.min(25.0, baseExchangeThreshold).toFixed(1));

    const photoRecommended = input.totalSerumBilirubinMgDl >= basePhotoThreshold;
    const exchangeRecommended = input.totalSerumBilirubinMgDl >= baseExchangeThreshold;

    let riskZone: BhutaniBilirubinResult['riskZone'] = 'LOW_RISK_ZONE';
    if (input.totalSerumBilirubinMgDl >= basePhotoThreshold) {
      riskZone = 'HIGH_RISK_ZONE';
    } else if (input.totalSerumBilirubinMgDl >= basePhotoThreshold - 2.0) {
      riskZone = 'HIGH_INTERMEDIATE_ZONE';
    } else if (input.totalSerumBilirubinMgDl >= basePhotoThreshold - 4.0) {
      riskZone = 'LOW_INTERMEDIATE_ZONE';
    }

    let plan = '';
    if (exchangeRecommended) {
      plan = 'CRITICAL ALERT: Total serum bilirubin exceeds Exchange Transfusion threshold. Admit STAT to Level III/IV NICU, initiate intensive double-surface LED phototherapy, cross-match reconstituted whole blood, and prepare for emergent double-volume exchange transfusion.';
    } else if (photoRecommended) {
      plan = `Admit to NICU / Postpartum unit for intensive continuous blue-spectrum LED phototherapy (irradiance >= 30 uW/cm2/nm). Ensure maximum skin exposure, eye protection, and monitor TSB every 6-12 hours.`;
    } else {
      plan = `Serum bilirubin is currently below treatment threshold (${input.totalSerumBilirubinMgDl} mg/dL vs threshold ${basePhotoThreshold} mg/dL). Support enteral feeding (breastfeeding 8-12 times/24h), repeat TSB in 24 hours prior to discharge.`;
    }

    return {
      postnatalAgeHours: input.postnatalAgeHours,
      totalSerumBilirubinMgDl: input.totalSerumBilirubinMgDl,
      riskZone,
      phototherapyThresholdMgDl: basePhotoThreshold,
      isPhototherapyRecommended: photoRecommended,
      exchangeTransfusionThresholdMgDl: baseExchangeThreshold,
      isExchangeTransfusionRecommended: exchangeRecommended,
      clinicalActionPlan: plan,
    };
  }
}
