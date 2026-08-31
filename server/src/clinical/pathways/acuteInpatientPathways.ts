/**
 * Acute Inpatient Clinical Pathways & Evidence-Based Diagnostic Risk Criteria
 * Glasgow-Blatchford Upper GI Bleed, Ranson/BISAP Pancreatitis, Alvarado Appendicitis, King's College Liver Failure, and Duke Endocarditis
 */

export class AcuteInpatientPathwaysEngine {
  /**
   * Calculate Glasgow-Blatchford Bleeding Score (GBS) for Acute Upper GI Hemorrhage (0 - 23)
   */
  public static calculateGlasgowBlatchford(input: {
    bloodUreaNitrogenMgDl: number;
    hemoglobinGdl: number;
    gender: 'MALE' | 'FEMALE';
    systolicBpMmhg: number;
    pulseBpm: number;
    presentingWithMelena: boolean;
    presentingWithSyncope: boolean;
    hasHepaticDisease: boolean;
    hasCardiacHeartFailure: boolean;
  }): {
    score: number;
    riskCategory: 'VERY_LOW_RISK_OUTPATIENT' | 'MODERATE_HIGH_RISK_INPATIENT_ENDOSCOPY';
    clinicalRecommendation: string;
  } {
    let score = 0;

    // BUN
    const bun = input.bloodUreaNitrogenMgDl;
    if (bun >= 70) score += 6;
    else if (bun >= 28) score += 4;
    else if (bun >= 22.4) score += 3;
    else if (bun >= 18.2) score += 2;

    // Hemoglobin
    const hb = input.hemoglobinGdl;
    if (input.gender === 'MALE') {
      if (hb < 10.0) score += 6;
      else if (hb < 12.0) score += 3;
      else if (hb < 13.0) score += 1;
    } else {
      if (hb < 10.0) score += 6;
      else if (hb < 12.0) score += 1;
    }

    // Systolic BP
    const sbp = input.systolicBpMmhg;
    if (sbp < 90) score += 3;
    else if (sbp < 100) score += 2;
    else if (sbp < 110) score += 1;

    // Pulse
    if (input.pulseBpm >= 100) score += 1;

    // Other presentations
    if (input.presentingWithMelena) score += 1;
    if (input.presentingWithSyncope) score += 2;
    if (input.hasHepaticDisease) score += 2;
    if (input.hasCardiacHeartFailure) score += 2;

    const isLow = score === 0;
    const rec = isLow
      ? 'Score = 0: Very low risk of needing endoscopic hemostasis or blood transfusion (<0.5% intervention rate). Suitable for safe outpatient management.'
      : `Score = ${score} (>= 1): Inpatient admission required. Initiate high-dose IV Proton Pump Inhibitor (Pantoprazole 80mg bolus + 8mg/hr infusion) and schedule early upper endoscopy (EGD) within 24 hours (or STAT if hemodynamically unstable).`;

    return {
      score,
      riskCategory: isLow ? 'VERY_LOW_RISK_OUTPATIENT' : 'MODERATE_HIGH_RISK_INPATIENT_ENDOSCOPY',
      clinicalRecommendation: rec,
    };
  }

  /**
   * Evaluate BISAP Score for Acute Pancreatitis Severity (0 - 5)
   */
  public static calculateBisap(input: {
    bloodUreaNitrogenMgDl: number; // > 25 mg/dL (+1)
    impairedMentalStatusGcsLessThan15: boolean; // (+1)
    sirsCriteriaMetCount: number; // >= 2 criteria (+1)
    ageOver60: boolean; // (+1)
    pleuralEffusionOnCxrOrCt: boolean; // (+1)
  }): {
    score: number;
    mortalityRiskPercent: string;
    levelOfCareRecommendation: string;
  } {
    let score = 0;
    if (input.bloodUreaNitrogenMgDl > 25) score++;
    if (input.impairedMentalStatusGcsLessThan15) score++;
    if (input.sirsCriteriaMetCount >= 2) score++;
    if (input.ageOver60) score++;
    if (input.pleuralEffusionOnCxrOrCt) score++;

    const mortalityMap: Record<number, string> = {
      0: '< 1.0%',
      1: '1.0%',
      2: '2.0%',
      3: '5.0 - 8.0%',
      4: '12.0 - 19.0%',
      5: '22.0 - 27.0%',
    };

    const mort = mortalityMap[score] || '15%';
    let care = 'Floor / Step-down unit with goal-directed crystalloid hydration (Lactated Ringers 200-250 mL/hr).';
    if (score >= 3) {
      care = `HIGH-RISK SEVERE ACUTE PANCREATITIS (BISAP ${score} >= 3): High risk of pancreatic necrosis and multi-organ failure. Immediate ICU admission, aggressive fluid resuscitation, serial BUN/hematocrit monitoring, and contrast-enhanced CT at 72h.`;
    }

    return {
      score,
      mortalityRiskPercent: mort,
      levelOfCareRecommendation: care,
    };
  }

  /**
   * Evaluate Alvarado Score (MANTRELS) for Acute Appendicitis (0 - 10)
   */
  public static calculateAlvarado(input: {
    migrationOfPainToRlq: boolean; // 1
    anorexiaOrUrineKetones: boolean; // 1
    nauseaOrVomiting: boolean; // 1
    tendernessInRlq: boolean; // 2 (Double point)
    reboundTendernessMcBurney: boolean; // 1
    elevatedTemperatureOver373C: boolean; // 1
    leukocytosisWbcOver10000: boolean; // 2 (Double point)
    shiftOfWbcToLeftNeutrophilsOver75: boolean; // 1
  }): {
    score: number;
    appendicitisProbability: 'LOW_UNLIKELY' | 'EQUIVOCAL_IMAGING_INDICATED' | 'HIGH_SURGICAL_CONSULT';
    diagnosticPathway: string;
  } {
    let score = 0;
    if (input.migrationOfPainToRlq) score += 1;
    if (input.anorexiaOrUrineKetones) score += 1;
    if (input.nauseaOrVomiting) score += 1;
    if (input.tendernessInRlq) score += 2;
    if (input.reboundTendernessMcBurney) score += 1;
    if (input.elevatedTemperatureOver373C) score += 1;
    if (input.leukocytosisWbcOver10000) score += 2;
    if (input.shiftOfWbcToLeftNeutrophilsOver75) score += 1;

    let prob: 'LOW_UNLIKELY' | 'EQUIVOCAL_IMAGING_INDICATED' | 'HIGH_SURGICAL_CONSULT' = 'LOW_UNLIKELY';
    let path = 'Score 0-4: Appendicitis unlikely. Screen for alternative gynecologic, urinary, or mesenteric lymphadenitis causes. Discharge with safe return precautions.';

    if (score >= 7) {
      prob = 'HIGH_SURGICAL_CONSULT';
      path = `Score ${score} (>= 7): Highly probable acute appendicitis. STAT General Surgery consult for laparoscopic appendectomy. IV pre-op antibiotics (Cefoxitin 2g or Cipro+Flagyl).`;
    } else if (score >= 5) {
      prob = 'EQUIVOCAL_IMAGING_INDICATED';
      path = `Score ${score} (5-6): Equivocal/compatible with appendicitis. Contrast-enhanced Abdominal/Pelvic CT (or Ultrasound in children/pregnancy) indicated prior to surgical decision.`;
    }

    return {
      score,
      appendicitisProbability: prob,
      diagnosticPathway: path,
    };
  }

  /**
   * Evaluate King's College Criteria for Acute Liver Failure (ALF) Emergency Liver Transplantation
   */
  public static evaluateKingsCollegeAlf(input: {
    etiology: 'ACETAMINOPHEN_TOXICITY' | 'NON_ACETAMINOPHEN_DRUG_HEPATITIS_VIRAL';
    arterialPhLessThan730: boolean; // Post-resuscitation
    inrGreaterThan65: boolean; // or PT > 100 seconds
    serumCreatinineGreaterThan34MgDl: boolean;
    grade3Or4HepaticEncephalopathy: boolean;
    // Non-Acetaminophen specific criteria
    inrGreaterThan35: boolean;
    serumBilirubinGreaterThan175MgDl: boolean;
    jaundiceToEncephalopathyTimeGreaterThan7Days: boolean;
    patientAgeLessThan10OrGreaterThan40: boolean;
  }): {
    criteriaMetForTransplant: boolean;
    mortalityRiskWithoutTransplantPercent: string;
    transplantListingAction: string;
  } {
    let met = false;

    if (input.etiology === 'ACETAMINOPHEN_TOXICITY') {
      // Acetaminophen: Arterial pH < 7.30 OR all three of (INR > 6.5, SCr > 3.4, Grade 3/4 encephalopathy)
      if (input.arterialPhLessThan730) {
        met = true;
      } else if (input.inrGreaterThan65 && input.serumCreatinineGreaterThan34MgDl && input.grade3Or4HepaticEncephalopathy) {
        met = true;
      }
    } else {
      // Non-Acetaminophen: INR > 6.5 OR any 3 of (Age <10/>40, Jaundice-encephalopathy >7d, Bilirubin >17.5, INR > 3.5)
      if (input.inrGreaterThan65) {
        met = true;
      } else {
        let count = 0;
        if (input.patientAgeLessThan10OrGreaterThan40) count++;
        if (input.jaundiceToEncephalopathyTimeGreaterThan7Days) count++;
        if (input.serumBilirubinGreaterThan175MgDl) count++;
        if (input.inrGreaterThan35) count++;

        if (count >= 3) met = true;
      }
    }

    return {
      criteriaMetForTransplant: met,
      mortalityRiskWithoutTransplantPercent: met ? '> 85.0%' : '< 20.0%',
      transplantListingAction: met
        ? 'CRITICAL ALERT: Meets King\'s College Criteria for Acute Liver Failure. Emergency listing for UNOS Status 1A deceased donor liver transplantation and transfer to Liver Transplant ICU.'
        : 'Continue medical management (N-Acetylcysteine infusion, intracranial pressure monitoring, hypertonic saline). Reassess King\'s College criteria every 12 hours.',
    };
  }
}
