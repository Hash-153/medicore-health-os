/**
 * Pre-Operative Anesthesia Risk Assessment & Airway Evaluation Engine
 * Incorporates ASA Physical Status, Mallampati Score, STOP-Bang Obstructive Sleep Apnea, and Apfel PONV Risk
 */

export type AsaPhysicalStatus =
  | 'ASA_I' // A normal healthy patient
  | 'ASA_II' // Patient with mild systemic disease (e.g. well-controlled HTN/DM)
  | 'ASA_III' // Patient with severe systemic disease (e.g. poorly controlled DM, COPD, morbid obesity)
  | 'ASA_IV' // Patient with severe systemic disease that is a constant threat to life (e.g. recent MI/CVA <3mo, severe valve disease)
  | 'ASA_V' // Moribund patient not expected to survive without the operation (e.g. ruptured AAA, massive trauma)
  | 'ASA_VI'; // Declared brain-dead patient whose organs are being removed for donor purposes

export interface AnesthesiaRiskInput {
  patientAge: number;
  gender: 'MALE' | 'FEMALE';
  bmi: number;
  plannedProcedure: string;
  isEmergencyProcedure: boolean; // E-suffix (e.g. ASA III-E)
  mallampatiScore: 1 | 2 | 3 | 4; // Airway view: 1 = soft palate, uvula, pillars visible; 4 = only hard palate visible
  thyromentalDistanceCm: number; // < 6.0 cm predicts difficult intubation
  cervicalSpineMobility: 'FULL' | 'MODERATELY_RESTRICTED' | 'SEVERELY_RESTRICTED';
  interIncisorGapCm: number; // Normal >= 4.0 cm (Difficult if < 3.0 cm)
  hasKnownDentitionIssues: boolean; // Loose teeth, caps, bridges
  comorbidities: {
    hypertension: boolean;
    diabetesMellitus: boolean;
    copdOrAsthma: boolean;
    congestiveHeartFailure: boolean;
    cadPriorMi: boolean;
    ckdOrDialysis: boolean;
    obstructiveSleepApnea: boolean;
    refluxGerd: boolean;
  };
  stopBangCriteria?: {
    snoringLoudly: boolean;
    tiredDuringDay: boolean;
    observedApnea: boolean;
    highBloodPressure: boolean;
    bmiOver35: boolean;
    ageOver50: boolean;
    neckCircumferenceOver40cm: boolean;
    isMale: boolean;
  };
  apfelPonvCriteria?: {
    isFemale: boolean;
    nonSmoker: boolean;
    historyOfMotionSicknessOrPonv: boolean;
    postOpOpioidUsePlanned: boolean;
  };
}

export interface AnesthesiaEvaluationResult {
  assignedAsaStatus: string; // e.g. "ASA III-E"
  isDifficultAirwayPredicted: boolean;
  airwayManagementAlerts: string[];
  stopBangScore?: number;
  osaRiskCategory?: 'LOW_OSA_RISK' | 'INTERMEDIATE_OSA_RISK' | 'HIGH_OSA_RISK';
  apfelPonvScore?: number;
  ponvRiskPercent?: string;
  recommendedPonvProphylaxis: string[];
  anestheticTechniqueRecommendations: string[];
}

export class AnesthesiaAssessmentEngine {
  /**
   * Perform comprehensive pre-operative anesthesia evaluation
   */
  public static evaluateRisk(input: AnesthesiaRiskInput): AnesthesiaEvaluationResult {
    // 1. Assign ASA Physical Status
    let asaBase: AsaPhysicalStatus = 'ASA_I';
    const c = input.comorbidities;

    if (c.congestiveHeartFailure || c.cadPriorMi || c.ckdOrDialysis || (c.copdOrAsthma && c.diabetesMellitus)) {
      asaBase = 'ASA_III';
    } else if (c.hypertension || c.diabetesMellitus || c.copdOrAsthma || input.bmi >= 30) {
      asaBase = 'ASA_II';
    }

    if (input.bmi >= 40) asaBase = 'ASA_III';

    const assignedAsaStatus = `${asaBase.replace('_', ' ')}${input.isEmergencyProcedure ? '-E (Emergency)' : ''}`;

    // 2. Airway Evaluation
    const airwayAlerts: string[] = [];
    let difficultAirway = false;

    if (input.mallampatiScore >= 3) {
      difficultAirway = true;
      airwayAlerts.push(`Mallampati Class ${input.mallampatiScore}: Limited pharyngeal visualization. Prepare video laryngoscope (GlideScope).`);
    }

    if (input.thyromentalDistanceCm < 6.0) {
      difficultAirway = true;
      airwayAlerts.push(`Short Thyromental Distance (${input.thyromentalDistanceCm} cm < 6.0 cm): Acute laryngeal angle. Difficult line-of-sight view.`);
    }

    if (input.interIncisorGapCm < 3.0) {
      difficultAirway = true;
      airwayAlerts.push(`Restricted Mouth Opening (${input.interIncisorGapCm} cm < 3.0 cm): Difficult laryngoscope blade insertion.`);
    }

    if (input.cervicalSpineMobility !== 'FULL') {
      difficultAirway = true;
      airwayAlerts.push(`Restricted Neck Mobility (${input.cervicalSpineMobility}): Inability to achieve optimal sniffing position.`);
    }

    // 3. STOP-Bang OSA Assessment
    let stopBangScore: number | undefined;
    let osaRisk: 'LOW_OSA_RISK' | 'INTERMEDIATE_OSA_RISK' | 'HIGH_OSA_RISK' | undefined;

    if (input.stopBangCriteria) {
      const sb = input.stopBangCriteria;
      let count = 0;
      if (sb.snoringLoudly) count++;
      if (sb.tiredDuringDay) count++;
      if (sb.observedApnea) count++;
      if (sb.highBloodPressure) count++;
      if (sb.bmiOver35) count++;
      if (sb.ageOver50) count++;
      if (sb.neckCircumferenceOver40cm) count++;
      if (sb.isMale) count++;

      stopBangScore = count;
      if (count >= 5) {
        osaRisk = 'HIGH_OSA_RISK';
        airwayAlerts.push('STOP-Bang High Risk for Severe OSA (Score >= 5): Increased risk of post-extubation airway collapse. Continuous pulse oximetry and CPAP availability required.');
      } else if (count >= 3) {
        osaRisk = 'INTERMEDIATE_OSA_RISK';
      } else {
        osaRisk = 'LOW_OSA_RISK';
      }
    }

    // 4. Apfel PONV Score
    let apfelScore: number | undefined;
    let ponvPercent: string | undefined;
    const ponvProphylaxis: string[] = [];

    if (input.apfelPonvCriteria) {
      const a = input.apfelPonvCriteria;
      let count = 0;
      if (a.isFemale) count++;
      if (a.nonSmoker) count++;
      if (a.historyOfMotionSicknessOrPonv) count++;
      if (a.postOpOpioidUsePlanned) count++;

      apfelScore = count;
      const riskMapping: Record<number, string> = {
        0: '10%',
        1: '21%',
        2: '39%',
        3: '61%',
        4: '79%',
      };
      ponvPercent = riskMapping[count] || '50%';

      if (count >= 3) {
        ponvProphylaxis.push('Triple-agent antiemetic prophylaxis: Dexamethasone 4-8 mg IV at induction + Ondansetron 4 mg IV at closure + Aprepitant 40 mg PO pre-op.');
        ponvProphylaxis.push('Total Intravenous Anesthesia (TIVA with Propofol infusion) to avoid emetogenic volatile agents and nitrous oxide.');
      } else if (count >= 2) {
        ponvProphylaxis.push('Dual-agent antiemetic prophylaxis: Dexamethasone 4 mg IV + Ondansetron 4 mg IV.');
      } else {
        ponvProphylaxis.push('Single-agent Ondansetron 4 mg IV 30 minutes prior to emergence.');
      }
    }

    // 5. General Anesthetic Technique Recommendations
    const techRecs: string[] = [];
    if (difficultAirway) {
      techRecs.push('Awake Fiberoptic Intubation or Primary Video Laryngoscopy (GlideScope/McGrath) with bougie ready at bedside.');
    }
    if (c.refluxGerd || input.isEmergencyProcedure) {
      techRecs.push('Rapid Sequence Induction and Intubation (RSI) with Cricoid Pressure (Sellick maneuver) and non-depolarizing NMB (Rocuronium 1.2 mg/kg) with Sugammadex available.');
    }
    if (input.bmi >= 35) {
      techRecs.push('Ramped / Head-Elevated Laryngoscopy Position (HELP) alignment to align oral, pharyngeal, and laryngeal axes.');
    }

    return {
      assignedAsaStatus,
      isDifficultAirwayPredicted: difficultAirway,
      airwayManagementAlerts: airwayAlerts,
      stopBangScore,
      osaRiskCategory: osaRisk,
      apfelPonvScore: apfelScore,
      ponvRiskPercent: ponvPercent,
      recommendedPonvProphylaxis: ponvProphylaxis,
      anestheticTechniqueRecommendations: techRecs,
    };
  }
}
