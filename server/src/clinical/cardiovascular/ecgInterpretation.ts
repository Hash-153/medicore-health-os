/**
 * 12-Lead Electrocardiogram (ECG) Interpretation & Arrhythmia Engine
 * Standard automated ECG measurement, STEMI criteria, Sgarbossa LBBB rules, and QTc risk calculation
 */

export interface EcgMeasurements {
  heartRateBpm: number;
  prIntervalMs: number; // Normal: 120 - 200 ms
  qrsDurationMs: number; // Normal: 70 - 100 ms (Wide if >= 120 ms)
  qtIntervalMs: number;
  qrsAxisDegrees: number; // Normal: -30 to +90 degrees
  stElevationMmByLead: Record<string, number>; // e.g. { "V1": 1.5, "V2": 3.0, "V3": 2.5, "II": 0.2, "III": 0.1 }
  stDepressionMmByLead: Record<string, number>;
  tWaveInversionLeads: string[];
  isLeftBundleBranchBlockPresent: boolean;
  isRightBundleBranchBlockPresent: boolean;
  hasVentricularPacing: boolean;
}

export interface EcgInterpretationResult {
  primaryRhythm: string;
  isStemiDetected: boolean;
  stemiAnatomicTerritory?: 'ANTERIOR_WALL' | 'INFERIOR_WALL' | 'LATERAL_WALL' | 'POSTERIOR_WALL' | 'DIFFUSE_PERICARDITIS';
  sgarbossaScore?: number;
  sgarbossaPositiveForStemi?: boolean;
  qtcBazettMs: number;
  qtcFridericiaMs: number;
  isQtcProlonged: boolean;
  torsadesDePointesRisk: 'LOW' | 'MODERATE' | 'CRITICAL';
  diagnosticStatements: string[];
  statAlertLevel: 'NONE' | 'URGENT_TELEMETRY' | 'STAT_CATH_LAB_ACTIVATION';
}

export class EcgInterpretationEngine {
  /**
   * Interpret 12-lead ECG measurements and evaluate critical alerts
   */
  public static interpret(measurements: EcgMeasurements): EcgInterpretationResult {
    const diagnosticStatements: string[] = [];
    const rrSeconds = 60 / measurements.heartRateBpm;

    // 1. QTc Formulas
    // Bazett: QTc = QT / sqrt(RR)
    const qtcBazett = Math.round(measurements.qtIntervalMs / Math.sqrt(rrSeconds));
    // Fridericia: QTc = QT / cbrt(RR)
    const qtcFridericia = Math.round(measurements.qtIntervalMs / Math.cbrt(rrSeconds));

    let isQtcProlonged = false;
    let torsadesRisk: 'LOW' | 'MODERATE' | 'CRITICAL' = 'LOW';

    if (qtcBazett >= 500) {
      isQtcProlonged = true;
      torsadesRisk = 'CRITICAL';
      diagnosticStatements.push(`CRITICAL PROLONGED QTc (${qtcBazett} ms): Severe risk of Torsades de Pointes. Discontinue QT-prolonging drugs, check serum K+ and Mg2+.`);
    } else if (qtcBazett >= 460) {
      isQtcProlonged = true;
      torsadesRisk = 'MODERATE';
      diagnosticStatements.push(`Borderline prolonged QTc (${qtcBazett} ms). Monitor electrolytes.`);
    }

    // 2. Primary Rhythm & Conduction
    let primaryRhythm = 'Normal Sinus Rhythm';
    if (measurements.heartRateBpm < 60) {
      primaryRhythm = 'Sinus Bradycardia';
      diagnosticStatements.push(`Sinus Bradycardia at ${measurements.heartRateBpm} bpm.`);
    } else if (measurements.heartRateBpm > 100) {
      primaryRhythm = 'Sinus Tachycardia';
      diagnosticStatements.push(`Sinus Tachycardia at ${measurements.heartRateBpm} bpm.`);
    }

    if (measurements.prIntervalMs > 200) {
      diagnosticStatements.push(`First-Degree Atrioventricular (AV) Block (PR interval ${measurements.prIntervalMs} ms).`);
    }

    if (measurements.qrsDurationMs >= 120) {
      if (measurements.isLeftBundleBranchBlockPresent) {
        diagnosticStatements.push('Complete Left Bundle Branch Block (LBBB).');
      } else if (measurements.isRightBundleBranchBlockPresent) {
        diagnosticStatements.push('Complete Right Bundle Branch Block (RBBB).');
      } else {
        diagnosticStatements.push('Non-specific Intraventricular Conduction Delay.');
      }
    }

    // 3. STEMI Criteria Evaluation (2018 Fourth Universal Definition of MI)
    let isStemi = false;
    let stemiTerritory: 'ANTERIOR_WALL' | 'INFERIOR_WALL' | 'LATERAL_WALL' | 'POSTERIOR_WALL' | 'DIFFUSE_PERICARDITIS' | undefined;
    let statAlert: 'NONE' | 'URGENT_TELEMETRY' | 'STAT_CATH_LAB_ACTIVATION' = 'NONE';

    const stElev = measurements.stElevationMmByLead;

    // Anterior Wall (V1-V4: >=2mm in V2-V3, >=1mm in others)
    const v2v3Elev = (stElev['V2'] || 0) >= 2.0 || (stElev['V3'] || 0) >= 2.0;
    const v1v4Elev = (stElev['V1'] || 0) >= 1.0 || (stElev['V4'] || 0) >= 1.0;

    if (v2v3Elev && v1v4Elev) {
      isStemi = true;
      stemiTerritory = 'ANTERIOR_WALL';
      statAlert = 'STAT_CATH_LAB_ACTIVATION';
      diagnosticStatements.unshift('*** ACUTE ANTERIOR STEMI DETECTED: ST-elevation in V1-V4 (LAD occlusion). STAT Cath Lab Activation required. ***');
    }

    // Inferior Wall (II, III, aVF: >=1mm in >=2 contiguous leads)
    const infLeadsElev = [stElev['II'] || 0, stElev['III'] || 0, stElev['aVF'] || 0].filter((v) => v >= 1.0).length;
    if (infLeadsElev >= 2) {
      isStemi = true;
      stemiTerritory = 'INFERIOR_WALL';
      statAlert = 'STAT_CATH_LAB_ACTIVATION';
      diagnosticStatements.unshift('*** ACUTE INFERIOR STEMI DETECTED: ST-elevation in leads II, III, aVF (RCA/LCx occlusion). Obtain Right-sided V4R lead. ***');
    }

    // Lateral Wall (I, aVL, V5, V6: >=1mm in >=2 contiguous leads)
    const latLeadsElev = [stElev['I'] || 0, stElev['aVL'] || 0, stElev['V5'] || 0, stElev['V6'] || 0].filter((v) => v >= 1.0).length;
    if (latLeadsElev >= 2 && !isStemi) {
      isStemi = true;
      stemiTerritory = 'LATERAL_WALL';
      statAlert = 'STAT_CATH_LAB_ACTIVATION';
      diagnosticStatements.unshift('*** ACUTE LATERAL STEMI DETECTED: ST-elevation in leads I, aVL, V5-V6 (LCx occlusion). ***');
    }

    // 4. Modified Sgarbossa Criteria (for LBBB or Paced Rhythms)
    let sgarbossaScore = 0;
    let sgarbossaPositive = false;

    if (measurements.isLeftBundleBranchBlockPresent || measurements.hasVentricularPacing) {
      // Criterion A: Concordant ST elevation >= 1mm in leads with positive QRS (+5 points)
      if ((stElev['V5'] || 0) >= 1.0 || (stElev['V6'] || 0) >= 1.0 || (stElev['I'] || 0) >= 1.0) {
        sgarbossaScore += 5;
      }
      // Criterion B: Concordant ST depression >= 1mm in V1, V2, or V3 (+3 points)
      const stDep = measurements.stDepressionMmByLead;
      if ((stDep['V1'] || 0) >= 1.0 || (stDep['V2'] || 0) >= 1.0 || (stDep['V3'] || 0) >= 1.0) {
        sgarbossaScore += 3;
      }
      // Criterion C: Excessively discordant ST elevation >= 5mm in leads with negative QRS (+2 points)
      if ((stElev['V1'] || 0) >= 5.0 || (stElev['V2'] || 0) >= 5.0 || (stElev['V3'] || 0) >= 5.0) {
        sgarbossaScore += 2;
      }

      if (sgarbossaScore >= 3) {
        sgarbossaPositive = true;
        isStemi = true;
        statAlert = 'STAT_CATH_LAB_ACTIVATION';
        diagnosticStatements.unshift(`*** MODIFIED SGARBOSSA POSITIVE (Score: ${sgarbossaScore}): Acute STEMI in setting of LBBB/Paced rhythm. STAT Interventional Cardiology consult. ***`);
      }
    }

    if (diagnosticStatements.length === 0) {
      diagnosticStatements.push('Normal 12-lead ECG. No acute ST-T segment deviation.');
    }

    return {
      primaryRhythm,
      isStemiDetected: isStemi,
      stemiAnatomicTerritory: stemiTerritory,
      sgarbossaScore: measurements.isLeftBundleBranchBlockPresent ? sgarbossaScore : undefined,
      sgarbossaPositiveForStemi: measurements.isLeftBundleBranchBlockPresent ? sgarbossaPositive : undefined,
      qtcBazettMs: qtcBazett,
      qtcFridericiaMs: qtcFridericia,
      isQtcProlonged,
      torsadesDePointesRisk: torsadesRisk,
      diagnosticStatements,
      statAlertLevel: statAlert,
    };
  }
}
