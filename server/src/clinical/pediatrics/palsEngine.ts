/**
 * Pediatric Advanced Life Support (PALS) & Broselow Emergency Resuscitation Engine
 * Weight-Based Resuscitation Zones, Airway Sizing, Defibrillation Joules, and Critical Emergency Medication Calculations
 */

export type BroselowColorZone =
  | 'GREY' // 3 - 5 kg (Infant)
  | 'PINK' // 6 - 7 kg
  | 'RED' // 8 - 9 kg
  | 'PURPLE' // 10 - 11 kg (1 year)
  | 'YELLOW' // 12 - 14 kg (2 years)
  | 'WHITE' // 15 - 18 kg (3-4 years)
  | 'BLUE' // 19 - 22 kg (5-6 years)
  | 'ORANGE' // 24 - 29 kg (7-8 years)
  | 'GREEN'; // 30 - 36 kg (9-10 years)

export interface PalsEquipmentSizes {
  cuffedEttSizeMm: number;
  uncuffedEttSizeMm: number;
  ettDepthAtLipCm: number;
  laryngoscopeBladeType: string;
  laryngoscopeBladeSize: number;
  suctionCatheterFrench: number;
  chestTubeFrench: number;
  nasogastricTubeFrench: number;
  bloodPressureCuffSize: string;
}

export interface PalsMedicationDoses {
  epinephrineCardiacArrestIvIo: string; // 0.01 mg/kg (0.1 mL/kg of 1:10,000)
  amiodaronePulselessVfVt: string; // 5 mg/kg IV/IO bolus
  adenosineFirstDoseSvt: string; // 0.1 mg/kg IV rapid push (max 6mg)
  adenosineSecondDoseSvt: string; // 0.2 mg/kg IV rapid push (max 12mg)
  atropineBradycardia: string; // 0.02 mg/kg IV/IO (min 0.1mg, max 0.5mg)
  fluidBolusHypovolemiaSepsis: string; // 20 mL/kg of 0.9% NS or LR
  dextroseHypoglycemia: string; // D10W 5 mL/kg IV/IO (0.5 g/kg)
  naloxoneOpioidReversal: string; // 0.1 mg/kg IV/IO (max 2mg)
  lorazepamStatusEpilepticus: string; // 0.1 mg/kg IV/IO over 2 mins (max 4mg)
  defibrillationInitialEnergyJoules: number; // 2 J/kg
  defibrillationSubsequentEnergyJoules: number; // 4 J/kg
  synchronizedCardioversionEnergyJoules: number; // 0.5 - 1.0 J/kg
}

export class PalsEmergencyEngine {
  /**
   * Determine Broselow Color Zone based on weight (kg)
   */
  public static getBroselowZone(weightKg: number): BroselowColorZone {
    if (weightKg <= 5.5) return 'GREY';
    if (weightKg <= 7.5) return 'PINK';
    if (weightKg <= 9.5) return 'RED';
    if (weightKg <= 11.5) return 'PURPLE';
    if (weightKg <= 14.5) return 'YELLOW';
    if (weightKg <= 18.5) return 'WHITE';
    if (weightKg <= 23.5) return 'BLUE';
    if (weightKg <= 29.5) return 'ORANGE';
    return 'GREEN';
  }

  /**
   * Calculate pediatric airway and equipment sizing:
   * Cuffed ETT = (Age / 4) + 3.5
   * Uncuffed ETT = (Age / 4) + 4.0
   * ETT Depth = ETT Size * 3  (or Age / 2 + 12)
   */
  public static calculateAirwayEquipment(ageYears: number, weightKg: number): PalsEquipmentSizes {
    const age = Math.max(0, ageYears);

    let cuffed = 3.0;
    let uncuffed = 3.5;
    let bladeSize = 1;
    let bladeType = 'Miller (Straight)';

    if (age < 0.5) {
      cuffed = 3.0;
      uncuffed = 3.5;
      bladeSize = 0; // Miller 0 for preemies/neonates
    } else if (age < 1.0) {
      cuffed = 3.5;
      uncuffed = 4.0;
      bladeSize = 1;
    } else {
      cuffed = parseFloat(((age / 4) + 3.5).toFixed(1));
      uncuffed = parseFloat(((age / 4) + 4.0).toFixed(1));
      bladeSize = age >= 8 ? 3 : age >= 2 ? 2 : 1;
      bladeType = age >= 6 ? 'Macintosh (Curved) or Miller' : 'Miller (Straight)';
    }

    const depth = parseFloat((cuffed * 3).toFixed(1));
    const suction = Math.round(cuffed * 2);
    const chestTube = weightKg <= 10 ? 12 : weightKg <= 20 ? 16 : 24;

    return {
      cuffedEttSizeMm: cuffed,
      uncuffedEttSizeMm: uncuffed,
      ettDepthAtLipCm: depth,
      laryngoscopeBladeType: bladeType,
      laryngoscopeBladeSize: bladeSize,
      suctionCatheterFrench: suction,
      chestTubeFrench: chestTube,
      nasogastricTubeFrench: Math.min(14, Math.max(8, Math.round(weightKg * 0.5 + 6))),
      bloodPressureCuffSize: weightKg <= 6 ? 'Infant' : weightKg <= 18 ? 'Child' : 'Small Adult',
    };
  }

  /**
   * Calculate exact weight-based emergency medication dosing & electrical therapy
   */
  public static calculateEmergencyDoses(weightKg: number): PalsMedicationDoses {
    const w = Math.max(1, weightKg);

    // Epinephrine: 0.01 mg/kg (0.1 mL/kg of 1:10,000 solution)
    const epiMg = parseFloat((0.01 * w).toFixed(2));
    const epiMl = parseFloat((0.1 * w).toFixed(1));

    // Amiodarone: 5 mg/kg (max 300mg)
    const amioMg = Math.min(300, Math.round(5 * w));

    // Adenosine: 0.1 mg/kg 1st dose (max 6mg), 0.2 mg/kg 2nd dose (max 12mg)
    const adeno1 = Math.min(6.0, parseFloat((0.1 * w).toFixed(1)));
    const adeno2 = Math.min(12.0, parseFloat((0.2 * w).toFixed(1)));

    // Atropine: 0.02 mg/kg (min 0.1mg, max 0.5mg child / 1.0mg adolescent)
    const atropine = Math.min(0.5, Math.max(0.1, parseFloat((0.02 * w).toFixed(2))));

    // Normal Saline Bolus: 20 mL/kg
    const nsBolus = Math.round(20 * w);

    // Dextrose D10W: 5 mL/kg (0.5 g/kg)
    const d10wMl = Math.round(5 * w);

    // Naloxone: 0.1 mg/kg (max 2mg)
    const naloxone = Math.min(2.0, parseFloat((0.1 * w).toFixed(2)));

    // Lorazepam: 0.1 mg/kg (max 4mg)
    const lorazepam = Math.min(4.0, parseFloat((0.1 * w).toFixed(2)));

    // Electrical Energy
    const defib1 = Math.round(2 * w);
    const defib2 = Math.round(4 * w);
    const cardioversion = Math.round(0.5 * w) || 1;

    return {
      epinephrineCardiacArrestIvIo: `${epiMg} mg (${epiMl} mL of 0.1 mg/mL [1:10,000]) IV/IO every 3-5 mins`,
      amiodaronePulselessVfVt: `${amioMg} mg IV/IO rapid bolus for refactory VF/pulseless VT`,
      adenosineFirstDoseSvt: `${adeno1} mg IV rapid push followed by 5-10 mL NS flush`,
      adenosineSecondDoseSvt: `${adeno2} mg IV rapid push followed by 5-10 mL NS flush`,
      atropineBradycardia: `${atropine} mg IV/IO for symptomatic vagal-mediated bradycardia`,
      fluidBolusHypovolemiaSepsis: `${nsBolus} mL of 0.9% NS or Lactated Ringers over 10-20 mins`,
      dextroseHypoglycemia: `${d10wMl} mL of D10W IV/IO for blood glucose < 60 mg/dL`,
      naloxoneOpioidReversal: `${naloxone} mg IV/IO/IM for acute opioid-induced respiratory depression`,
      lorazepamStatusEpilepticus: `${lorazepam} mg IV/IO over 2 mins for active status epilepticus seizure`,
      defibrillationInitialEnergyJoules: defib1,
      defibrillationSubsequentEnergyJoules: defib2,
      synchronizedCardioversionEnergyJoules: cardioversion,
    };
  }
}
