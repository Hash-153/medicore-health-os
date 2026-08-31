/**
 * Mechanical Ventilation & ARDS ARDSNet Protocol Engine
 * Berlin ARDS Definition, Low Tidal Volume PBW Dosing, Driving Pressure & RSBI Weaning Readiness
 */

export interface ArdsEvaluationInput {
  arterialPo2Mmhg: number; // PaO2 from ABG
  fractionInspiredO2Percent: number; // FiO2 (e.g. 60% = 0.60)
  peepCmH2o: number; // Positive End-Expiratory Pressure
  timingWithin7DaysOfInsolt: boolean;
  hasBilateralInfiltratesOnCxrOrCt: boolean;
  isRespiratoryFailureExplainedByHeartFailure: boolean;
}

export interface VentParametersInput {
  gender: 'MALE' | 'FEMALE';
  heightInches: number; // For Predicted Body Weight (PBW)
  currentTidalVolumeMl: number;
  currentRespiratoryRate: number;
  peakInspiratoryPressurePip: number; // cmH2O
  plateauPressurePplat: number; // cmH2O (Measured with inspiratory hold)
  peepCmH2o: number; // cmH2O
  measuredAutoPeepCmH2o?: number;
}

export interface RsbiWeaningInput {
  spontaneousRespiratoryRateBpm: number;
  spontaneousTidalVolumeLiters: number; // in Liters (e.g. 0.45 L)
  minuteVentilationLpm: number;
  arterialPh: number;
  pao2Fio2Ratio: number;
  patientCooperativeAndAwake: boolean;
}

export class MechanicalVentilationEngine {
  /**
   * Calculate Predicted Body Weight (PBW) in kg via ARDSNet Formula:
   * Men: 50 + 0.91 * (height in cm - 152.4)  [or 50 + 2.3 * (height in inches - 60)]
   * Women: 45.5 + 0.91 * (height in cm - 152.4) [or 45.5 + 2.3 * (height in inches - 60)]
   */
  public static calculatePredictedBodyWeight(gender: 'MALE' | 'FEMALE', heightInches: number): number {
    const base = gender === 'MALE' ? 50.0 : 45.5;
    const pbw = base + 2.3 * (heightInches - 60);
    return parseFloat(Math.max(30.0, pbw).toFixed(1));
  }

  /**
   * Evaluate Berlin Definition of Acute Respiratory Distress Syndrome (ARDS)
   */
  public static evaluateBerlinArds(input: ArdsEvaluationInput): {
    isArdsDiagnosed: boolean;
    pao2Fio2Ratio: number;
    severityCategory?: 'MILD_ARDS' | 'MODERATE_ARDS' | 'SEVERE_ARDS';
    clinicalManagementRecommendations: string[];
  } {
    const fio2Decimal = input.fractionInspiredO2Percent > 1 ? input.fractionInspiredO2Percent / 100 : input.fractionInspiredO2Percent;
    const pfRatio = Math.round(input.arterialPo2Mmhg / Math.max(0.21, fio2Decimal));

    const recs: string[] = [];

    if (
      !input.timingWithin7DaysOfInsolt ||
      !input.hasBilateralInfiltratesOnCxrOrCt ||
      input.isRespiratoryFailureExplainedByHeartFailure ||
      input.peepCmH2o < 5
    ) {
      return {
        isArdsDiagnosed: false,
        pao2Fio2Ratio: pfRatio,
        clinicalManagementRecommendations: ['Does not meet full Berlin ARDS criteria. Evaluate for cardiogenic pulmonary edema, atelectasis, or pneumonia.'],
      };
    }

    let severity: 'MILD_ARDS' | 'MODERATE_ARDS' | 'SEVERE_ARDS' = 'MILD_ARDS';

    if (pfRatio <= 100) {
      severity = 'SEVERE_ARDS';
      recs.push('SEVERE ARDS (P/F <= 100 with PEEP >= 5 cmH2O): High mortality (45%).');
      recs.push('Implement ARDSNet Lung-Protective Ventilation: Target tidal volume 4-6 mL/kg PBW, plateau pressure <= 30 cmH2O.');
      recs.push('Prone positioning for at least 16 consecutive hours daily (PROSEVA trial - significant survival benefit).');
      recs.push('Early neuromuscular blockade infusion (Cisatracurium for 48 hours) for patient-ventilator dyssynchrony (ACURASYS trial).');
      recs.push('Evaluate for Veno-Venous Extracorporeal Membrane Oxygenation (VV-ECMO) consultation if P/F < 80 for > 6 hours (EOLIA trial criteria).');
    } else if (pfRatio <= 200) {
      severity = 'MODERATE_ARDS';
      recs.push('MODERATE ARDS (100 < P/F <= 200 with PEEP >= 5 cmH2O): Mortality ~32%.');
      recs.push('Target tidal volume 6 mL/kg PBW; titrate PEEP using Higher PEEP/Lower FiO2 ARDSNet table.');
      recs.push('Target Driving Pressure (Pplat - PEEP) <= 14 cmH2O to reduce volutrauma/barotrauma.');
      recs.push('Consider prone positioning if P/F remains < 150.');
    } else if (pfRatio <= 300) {
      severity = 'MILD_ARDS';
      recs.push('MILD ARDS (200 < P/F <= 300 with PEEP >= 5 cmH2O): Mortality ~27%.');
      recs.push('Lung-protective ventilation with 6 mL/kg PBW; avoid excessive tidal volumes.');
      recs.push('Conservative fluid management strategy (FACTT trial) once shock has resolved to accelerate ventilator weaning.');
    }

    return {
      isArdsDiagnosed: true,
      pao2Fio2Ratio: pfRatio,
      severityCategory: severity,
      clinicalManagementRecommendations: recs,
    };
  }

  /**
   * Ventilator Mechanics & Driving Pressure Safety Audit
   */
  public static auditVentilatorMechanics(input: VentParametersInput): {
    predictedBodyWeightKg: number;
    currentMlPerKgPbw: number;
    drivingPressureCmH2o: number; // Pplat - PEEP (Target <= 14 cmH2O)
    staticComplianceMlCmH2o: number; // Vt / (Pplat - PEEP) (Normal: 50-100 mL/cmH2O; ARDS < 30)
    safetyAlerts: string[];
  } {
    const pbw = this.calculatePredictedBodyWeight(input.gender, input.heightInches);
    const mlPerKg = parseFloat((input.currentTidalVolumeMl / pbw).toFixed(1));
    const drivingPressure = input.plateauPressurePplat - input.peepCmH2o;
    const staticCompliance = parseFloat((input.currentTidalVolumeMl / Math.max(1, drivingPressure)).toFixed(1));

    const alerts: string[] = [];

    if (mlPerKg > 8.0) {
      alerts.push(`EXCESSIVE TIDAL VOLUME (${mlPerKg} mL/kg PBW > 8.0): High risk of ventilator-induced lung injury (VILI) and volutrauma. Reduce tidal volume to ${Math.round(pbw * 6)} mL (6 mL/kg PBW).`);
    }

    if (input.plateauPressurePplat > 30) {
      alerts.push(`ELEVATED PLATEAU PRESSURE (${input.plateauPressurePplat} cmH2O > 30): High barotrauma risk. Decrease tidal volume by 1 mL/kg PBW decrements until Pplat <= 30.`);
    }

    if (drivingPressure > 14) {
      alerts.push(`ELEVATED DRIVING PRESSURE (${drivingPressure} cmH2O > 14): Increased mortality. Optimize PEEP and reduce tidal volume.`);
    }

    if (staticCompliance < 30) {
      alerts.push(`SEVERELY DECREASED STATIC COMPLIANCE (${staticCompliance} mL/cmH2O < 30): Reflects stiff, consolidated non-compliant lungs characteristic of severe ARDS.`);
    }

    return {
      predictedBodyWeightKg: pbw,
      currentMlPerKgPbw: mlPerKg,
      drivingPressureCmH2o: drivingPressure,
      staticComplianceMlCmH2o: staticCompliance,
      safetyAlerts: alerts,
    };
  }

  /**
   * Evaluate Rapid Shallow Breathing Index (RSBI = f / Vt) for Weaning Readiness:
   * RSBI < 105 predicts successful extubation / Spontaneous Breathing Trial (SBT) pass
   */
  public static evaluateRsbiWeaning(input: RsbiWeaningInput): {
    rsbiScore: number;
    isReadyForExtubation: boolean;
    weaningRecommendation: string;
  } {
    // RSBI = breaths per minute / tidal volume in Liters
    const rsbi = Math.round(input.spontaneousRespiratoryRateBpm / Math.max(0.1, input.spontaneousTidalVolumeLiters));

    const isReady =
      rsbi < 105 &&
      input.patientCooperativeAndAwake &&
      input.pao2Fio2Ratio >= 200 &&
      input.arterialPh >= 7.32 &&
      input.minuteVentilationLpm < 15;

    let rec = '';
    if (isReady) {
      rec = `WEANING CRITERIA MET (RSBI = ${rsbi} < 105): Patient demonstrates adequate respiratory muscle reserve, favorable gas exchange (P/F ${input.pao2Fio2Ratio}), and mental alertness. Proceed with formal 30-120 min Spontaneous Breathing Trial (CPAP 5 / PS 5 or T-piece) and prepare for extubation if airway protective reflexes intact.`;
    } else {
      rec = `WEANING CRITERIA NOT MET (RSBI = ${rsbi}): ${
        rsbi >= 105 ? 'Elevated rapid shallow breathing indicates high likelihood of extubation failure and diaphragmatic fatigue.' : ''
      } Continue mechanical ventilation support, treat underlying cause, and re-evaluate daily.`;
    }

    return {
      rsbiScore: rsbi,
      isReadyForExtubation: isReady,
      weaningRecommendation: rec,
    };
  }
}
