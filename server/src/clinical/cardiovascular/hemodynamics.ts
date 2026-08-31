/**
 * Hemodynamic Monitoring & Invasive Catheterization Physiology Engine
 * Calculates Cardiac Index, SVR, PVR, Oxygen Delivery (DO2/VO2) & Differentiates Shock States
 */

export interface HemodynamicInput {
  systolicBp: number; // mmHg
  diastolicBp: number; // mmHg
  heartRateBpm: number;
  centralVenousPressureCvp: number; // mmHg (Normal: 2-6 mmHg)
  pulmonaryArterySystolic: number; // mmHg (Normal: 15-30 mmHg)
  pulmonaryArteryDiastolic: number; // mmHg (Normal: 4-12 mmHg)
  pulmonaryCapillaryWedgePressurePcwp: number; // mmHg (Normal: 6-12 mmHg)
  cardiacOutputLpm: number; // L/min (Normal: 4.0-8.0 L/min)
  bodySurfaceAreaM2: number; // m2 (e.g. 1.85 m2)
  hemoglobinGdl: number; // g/dL (e.g. 13.5 g/dL)
  arterialOxygenSatSao2Percent: number; // % (e.g. 98%)
  mixedVenousOxygenSatSvo2Percent: number; // % (Normal: 65-75%)
}

export type ShockClassification =
  | 'CARDIOGENIC_SHOCK'
  | 'HYPOVOLEMIC_SHOCK'
  | 'DISTRIBUTIVE_SEPTIC_SHOCK'
  | 'OBSTRUCTIVE_SHOCK'
  | 'NORMAL_HEMODYNAMICS';

export interface HemodynamicProfileResult {
  meanArterialPressureMap: number; // mmHg
  meanPulmonaryArteryPressureMpap: number; // mmHg
  cardiacIndexCi: number; // L/min/m2 (Normal: 2.5-4.0)
  strokeVolumeMl: number; // mL/beat (Normal: 60-100)
  strokeVolumeIndexSvi: number; // mL/beat/m2 (Normal: 33-47)
  systemicVascularResistanceSvr: number; // dynes*sec/cm5 (Normal: 800-1200)
  systemicVascularResistanceIndexSvri: number; // dynes*sec*m2/cm5
  pulmonaryVascularResistancePvr: number; // dynes*sec/cm5 (Normal: 50-250)
  leftVentricularStrokeWorkIndexLvswi: number; // g*m/m2
  arterialOxygenContentCao2: number; // mL O2/dL
  mixedVenousOxygenContentCvo2: number; // mL O2/dL
  oxygenDeliveryIndexDo2i: number; // mL O2/min/m2 (Normal: 500-600)
  oxygenConsumptionIndexVo2i: number; // mL O2/min/m2 (Normal: 110-160)
  oxygenExtractionRatioO2er: number; // % (Normal: 22-30%)
  classifiedShockState: ShockClassification;
  clinicalInterpretation: string;
  vasoactiveTherapyRecommendations: string[];
}

export class HemodynamicsEngine {
  /**
   * Calculate complete invasive Swan-Ganz hemodynamic profile
   */
  public static calculateProfile(input: HemodynamicInput): HemodynamicProfileResult {
    // MAP = DBP + 1/3(SBP - DBP)
    const map = Math.round(input.diastolicBp + (input.systolicBp - input.diastolicBp) / 3);

    // MPAP = PAd + 1/3(PAs - PAd)
    const mpap = Math.round(
      input.pulmonaryArteryDiastolic + (input.pulmonaryArterySystolic - input.pulmonaryArteryDiastolic) / 3
    );

    // Cardiac Index = CO / BSA
    const ci = parseFloat((input.cardiacOutputLpm / input.bodySurfaceAreaM2).toFixed(2));

    // Stroke Volume = (CO * 1000) / HR
    const sv = Math.round((input.cardiacOutputLpm * 1000) / input.heartRateBpm);
    const svi = parseFloat((sv / input.bodySurfaceAreaM2).toFixed(1));

    // SVR = 80 * (MAP - CVP) / CO
    const svr = Math.round((80 * (map - input.centralVenousPressureCvp)) / Math.max(0.5, input.cardiacOutputLpm));
    const svri = Math.round(svr * input.bodySurfaceAreaM2);

    // PVR = 80 * (MPAP - PCWP) / CO
    const pvr = Math.round(
      (80 * (mpap - input.pulmonaryCapillaryWedgePressurePcwp)) / Math.max(0.5, input.cardiacOutputLpm)
    );

    // LVSWI = 0.0136 * SVI * (MAP - PCWP)
    const lvswi = parseFloat((0.0136 * svi * (map - input.pulmonaryCapillaryWedgePressurePcwp)).toFixed(1));

    // Arterial Oxygen Content (CaO2) = (1.34 * Hb * SaO2/100) + (0.0031 * PaO2 assumed ~0.3)
    const cao2 = parseFloat((1.34 * input.hemoglobinGdl * (input.arterialOxygenSatSao2Percent / 100) + 0.3).toFixed(1));

    // Mixed Venous Oxygen Content (CvO2) = (1.34 * Hb * SvO2/100) + 0.1
    const cvo2 = parseFloat((1.34 * input.hemoglobinGdl * (input.mixedVenousOxygenSatSvo2Percent / 100) + 0.1).toFixed(1));

    // DO2I = CI * CaO2 * 10
    const do2i = Math.round(ci * cao2 * 10);

    // VO2I = CI * (CaO2 - CvO2) * 10
    const vo2i = Math.round(ci * (cao2 - cvo2) * 10);

    // O2ER = ((CaO2 - CvO2) / CaO2) * 100
    const o2er = Math.round(((cao2 - cvo2) / Math.max(1, cao2)) * 100);

    // Shock State Classification
    let shockState: ShockClassification = 'NORMAL_HEMODYNAMICS';
    let interp = 'Hemodynamics within normal physiological parameters.';
    const recs: string[] = [];

    if (ci < 2.2 && input.pulmonaryCapillaryWedgePressurePcwp > 18) {
      shockState = 'CARDIOGENIC_SHOCK';
      interp = `CARDIOGENIC SHOCK (Forrester Subset IV / Wet-and-Cold): Depressed Cardiac Index (${ci} L/min/m²) with elevated wedge pressure (${input.pulmonaryCapillaryWedgePressurePcwp} mmHg) and compensatory vasoconstriction (SVR ${svr} dynes).`;
      recs.push('Inotropic support with Dobutamine (2-20 mcg/kg/min) or Milrinone (0.25-0.75 mcg/kg/min) to enhance myocardial contractility.');
      recs.push('Norepinephrine to maintain MAP > 65 mmHg if profound hypotension present.');
      recs.push('Consider Mechanical Circulatory Support (Impella CP, Intra-Aortic Balloon Pump, or VA-ECMO).');
      recs.push('Avoid rapid crystalloid fluid boluses; consider judicious loop diuretic (Furosemide IV).');
    } else if (ci < 2.2 && input.pulmonaryCapillaryWedgePressurePcwp <= 12 && input.centralVenousPressureCvp < 6) {
      shockState = 'HYPOVOLEMIC_SHOCK';
      interp = `HYPOVOLEMIC / HEMORRHAGIC SHOCK: Reduced Cardiac Index (${ci} L/min/m²) with low filling pressures (PCWP ${input.pulmonaryCapillaryWedgePressurePcwp} mmHg, CVP ${input.centralVenousPressureCvp} mmHg) and elevated SVR (${svr} dynes).`;
      recs.push('Immediate intravascular volume resuscitation: Balanced crystalloid (Plasmalyte / Lactated Ringers) 30 mL/kg bolus.');
      recs.push('Initiate Massive Transfusion Protocol (1:1:1 pRBC, FFP, Platelets) if hemorrhagic.');
      recs.push('Withhold vasopressors until adequate intravascular volume loaded.');
    } else if (ci >= 3.5 && svr < 700) {
      shockState = 'DISTRIBUTIVE_SEPTIC_SHOCK';
      interp = `DISTRIBUTIVE / HYPERDYNAMIC SEPTIC SHOCK (Warm Shock): Elevated/hyperdynamic Cardiac Index (${ci} L/min/m²) with severe vasodilation (SVR ${svr} dynes*sec/cm5) and impaired tissue extraction (SvO2 ${input.mixedVenousOxygenSatSvo2Percent}%).`;
      recs.push('First-line vasopressor: Norepinephrine titrated to maintain MAP >= 65 mmHg.');
      recs.push('Second-line vasopressor: Vasopressin (fixed dose 0.03 units/min) for catecholamine-refractory vasodilation.');
      recs.push('Broad-spectrum IV empiric antimicrobials within 1 hour of sepsis recognition.');
      recs.push('Stress-dose hydrocortisone (200 mg/day continuous) if refractory to high-dose vasopressors.');
    } else if (ci < 2.2 && input.centralVenousPressureCvp >= 14 && input.pulmonaryCapillaryWedgePressurePcwp <= 12 && pvr > 300) {
      shockState = 'OBSTRUCTIVE_SHOCK';
      interp = `OBSTRUCTIVE SHOCK (Acute Cor Pulmonale / Massive PE or Cardiac Tamponade): Elevated right-sided filling (CVP ${input.centralVenousPressureCvp} mmHg) with disproportionately normal/low PCWP (${input.pulmonaryCapillaryWedgePressurePcwp} mmHg) and high PVR (${pvr} dynes).`;
      recs.push('STAT bedside echocardiography to evaluate RV strain, McConnell sign, or pericardial effusion with tamponade.');
      recs.push('Systemic thrombolysis (Alteplase 100 mg IV over 2 hrs) or catheter-directed embolectomy if massive PE confirmed.');
      recs.push('Emergency pericardiocentesis if cardiac tamponade physiology identified.');
    }

    return {
      meanArterialPressureMap: map,
      meanPulmonaryArteryPressureMpap: mpap,
      cardiacIndexCi: ci,
      strokeVolumeMl: sv,
      strokeVolumeIndexSvi: svi,
      systemicVascularResistanceSvr: svr,
      systemicVascularResistanceIndexSvri: svri,
      pulmonaryVascularResistancePvr: pvr,
      leftVentricularStrokeWorkIndexLvswi: lvswi,
      arterialOxygenContentCao2: cao2,
      mixedVenousOxygenContentCvo2: cvo2,
      oxygenDeliveryIndexDo2i: do2i,
      oxygenConsumptionIndexVo2i: vo2i,
      oxygenExtractionRatioO2er: o2er,
      classifiedShockState: shockState,
      clinicalInterpretation: interp,
      vasoactiveTherapyRecommendations: recs,
    };
  }
}
