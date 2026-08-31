/**
 * Evidence-Based Chemotherapy Regimens & Oncology Protocol Engine
 * Standard of Care NCCN-Aligned Regimens, BSA Dosing, Antiemetic Premedications & Cumulative Toxicity Tracking
 */

export interface ChemoDrugItem {
  drugName: string;
  doseCalculationType: 'BSA_M2' | 'AUC_CALVERT' | 'FLAT_MG' | 'WEIGHT_KG';
  standardDose: number; // e.g. 85 for 85 mg/m2, or 5 for AUC 5
  unit: string;
  route: 'IV_INFUSION' | 'IV_BOLUS' | 'ORAL' | 'SUBQ';
  infusionDurationMinutes?: number;
  adminDays: number[]; // e.g. [1] or [1, 2] or [1, 8, 15]
  cumulativeLifetimeCeiling?: {
    maxLifetimeDose: number;
    unit: string;
    targetOrganToxicity: 'CARDIOTOXICITY' | 'PULMONARY_FIBROSIS' | 'NEPHROTOXICITY' | 'OTOTOXICITY';
  };
}

export interface ChemoRegimenDefinition {
  regimenCode: string;
  regimenName: string;
  primaryIndication: string;
  cycleLengthDays: number;
  totalPlannedCycles: number;
  emetogenicRisk: 'HIGH' | 'MODERATE' | 'LOW' | 'MINIMAL';
  requiresGcsfSupport: boolean; // Febrile neutropenia risk >= 20%
  requiredPremedications: Array<{
    drugName: string;
    dose: string;
    route: string;
    timingMinutesBeforeChemo: number;
    purpose: string;
  }>;
  drugs: ChemoDrugItem[];
  mandatoryPreChemoLabChecks: {
    minAbsoluteNeutrophilCount: number; // cells/uL (e.g. 1500)
    minPlateletCount: number; // cells/uL (e.g. 100,000)
    maxTotalBilirubinMgDl: number; // mg/dL (e.g. 1.5)
    minEgfrMlMin: number; // mL/min (e.g. 50 for Cisplatin)
    baselineEchocardiogramLvefRequired: boolean; // >= 50% for anthracyclines/HER2
  };
}

export const MASTER_CHEMO_REGIMENS: ChemoRegimenDefinition[] = [
  {
    regimenCode: 'FOLFOX-6-MOD',
    regimenName: 'Modified FOLFOX-6 (Oxaliplatin, Leucovorin, 5-Fluorouracil)',
    primaryIndication: 'Colorectal Adenocarcinoma (Adjuvant Stage III / Metastatic Stage IV)',
    cycleLengthDays: 14,
    totalPlannedCycles: 12,
    emetogenicRisk: 'MODERATE',
    requiresGcsfSupport: false,
    requiredPremedications: [
      { drugName: 'Dexamethasone', dose: '12 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'Antiemetic prophylaxis' },
      { drugName: 'Ondansetron', dose: '16 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: '5-HT3 receptor antagonist' },
      { drugName: 'Diphenhydramine', dose: '25 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'Oxaliplatin hypersensitivity prophylaxis' },
    ],
    drugs: [
      {
        drugName: 'Oxaliplatin',
        doseCalculationType: 'BSA_M2',
        standardDose: 85,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 120,
        adminDays: [1],
      },
      {
        drugName: 'Leucovorin (Folinic Acid)',
        doseCalculationType: 'BSA_M2',
        standardDose: 400,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 120,
        adminDays: [1],
      },
      {
        drugName: '5-Fluorouracil (Bolus)',
        doseCalculationType: 'BSA_M2',
        standardDose: 400,
        unit: 'mg/m²',
        route: 'IV_BOLUS',
        infusionDurationMinutes: 10,
        adminDays: [1],
      },
      {
        drugName: '5-Fluorouracil (Continuous Infusion)',
        doseCalculationType: 'BSA_M2',
        standardDose: 2400,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 2760, // 46 hours continuous ambulatory pump
        adminDays: [1, 2],
      },
    ],
    mandatoryPreChemoLabChecks: {
      minAbsoluteNeutrophilCount: 1500,
      minPlateletCount: 100000,
      maxTotalBilirubinMgDl: 2.0,
      minEgfrMlMin: 40,
      baselineEchocardiogramLvefRequired: false,
    },
  },
  {
    regimenCode: 'AC-DOX-CYC',
    regimenName: 'AC (Doxorubicin + Cyclophosphamide)',
    primaryIndication: 'Breast Carcinoma (Adjuvant / Neoadjuvant Dose-Dense Protocol)',
    cycleLengthDays: 14,
    totalPlannedCycles: 4,
    emetogenicRisk: 'HIGH',
    requiresGcsfSupport: true, // Dose-dense 14-day protocol requires mandatory G-CSF Pegfilgrastim
    requiredPremedications: [
      { drugName: 'Fosaprepitant', dose: '150 mg', route: 'IV', timingMinutesBeforeChemo: 45, purpose: 'NK-1 receptor antagonist' },
      { drugName: 'Palonosetron', dose: '0.25 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: '2nd Gen 5-HT3 antagonist' },
      { drugName: 'Dexamethasone', dose: '12 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'High-emetogenic synergy' },
      { drugName: 'Olanzapine', dose: '10 mg', route: 'ORAL', timingMinutesBeforeChemo: 60, purpose: 'Dopamine & serotonin antagonist' },
    ],
    drugs: [
      {
        drugName: 'Doxorubicin (Adriamycin)',
        doseCalculationType: 'BSA_M2',
        standardDose: 60,
        unit: 'mg/m²',
        route: 'IV_BOLUS',
        infusionDurationMinutes: 15,
        adminDays: [1],
        cumulativeLifetimeCeiling: {
          maxLifetimeDose: 450,
          unit: 'mg/m²',
          targetOrganToxicity: 'CARDIOTOXICITY',
        },
      },
      {
        drugName: 'Cyclophosphamide',
        doseCalculationType: 'BSA_M2',
        standardDose: 600,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 60,
        adminDays: [1],
      },
    ],
    mandatoryPreChemoLabChecks: {
      minAbsoluteNeutrophilCount: 1500,
      minPlateletCount: 100000,
      maxTotalBilirubinMgDl: 1.5,
      minEgfrMlMin: 50,
      baselineEchocardiogramLvefRequired: true,
    },
  },
  {
    regimenCode: 'CARBO-PACLI-NSCLC',
    regimenName: 'Carboplatin + Paclitaxel + Pembrolizumab',
    primaryIndication: 'Non-Small Cell Lung Cancer (First-Line Metastatic / KEYNOTE-189)',
    cycleLengthDays: 21,
    totalPlannedCycles: 4,
    emetogenicRisk: 'MODERATE',
    requiresGcsfSupport: false,
    requiredPremedications: [
      { drugName: 'Dexamethasone', dose: '20 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'Paclitaxel hypersensitivity & antiemetic' },
      { drugName: 'Diphenhydramine', dose: '50 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'H1 blocker' },
      { drugName: 'Famotidine', dose: '20 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'H2 blocker' },
      { drugName: 'Ondansetron', dose: '16 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: '5-HT3 receptor blocker' },
    ],
    drugs: [
      {
        drugName: 'Pembrolizumab (Keytruda)',
        doseCalculationType: 'FLAT_MG',
        standardDose: 200,
        unit: 'mg',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 30,
        adminDays: [1],
      },
      {
        drugName: 'Paclitaxel',
        doseCalculationType: 'BSA_M2',
        standardDose: 200,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 180,
        adminDays: [1],
      },
      {
        drugName: 'Carboplatin',
        doseCalculationType: 'AUC_CALVERT',
        standardDose: 5, // Target AUC 5
        unit: 'AUC (Calvert Formula)',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 60,
        adminDays: [1],
      },
    ],
    mandatoryPreChemoLabChecks: {
      minAbsoluteNeutrophilCount: 1500,
      minPlateletCount: 100000,
      maxTotalBilirubinMgDl: 1.5,
      minEgfrMlMin: 45,
      baselineEchocardiogramLvefRequired: false,
    },
  },
  {
    regimenCode: 'R-CHOP',
    regimenName: 'R-CHOP (Rituximab, Cyclophosphamide, Doxorubicin, Vincristine, Prednisone)',
    primaryIndication: 'Diffuse Large B-Cell Non-Hodgkin Lymphoma (DLBCL)',
    cycleLengthDays: 21,
    totalPlannedCycles: 6,
    emetogenicRisk: 'HIGH',
    requiresGcsfSupport: true,
    requiredPremedications: [
      { drugName: 'Acetaminophen', dose: '650 mg', route: 'ORAL', timingMinutesBeforeChemo: 30, purpose: 'Rituximab infusion reaction prophylaxis' },
      { drugName: 'Diphenhydramine', dose: '50 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'H1 blocker' },
      { drugName: 'Ondansetron', dose: '16 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'Antiemetic' },
      { drugName: 'Dexamethasone', dose: '10 mg', route: 'IV', timingMinutesBeforeChemo: 30, purpose: 'Antiemetic' },
    ],
    drugs: [
      {
        drugName: 'Rituximab',
        doseCalculationType: 'BSA_M2',
        standardDose: 375,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 240,
        adminDays: [1],
      },
      {
        drugName: 'Cyclophosphamide',
        doseCalculationType: 'BSA_M2',
        standardDose: 750,
        unit: 'mg/m²',
        route: 'IV_INFUSION',
        infusionDurationMinutes: 60,
        adminDays: [1],
      },
      {
        drugName: 'Doxorubicin',
        doseCalculationType: 'BSA_M2',
        standardDose: 50,
        unit: 'mg/m²',
        route: 'IV_BOLUS',
        infusionDurationMinutes: 15,
        adminDays: [1],
        cumulativeLifetimeCeiling: {
          maxLifetimeDose: 450,
          unit: 'mg/m²',
          targetOrganToxicity: 'CARDIOTOXICITY',
        },
      },
      {
        drugName: 'Vincristine',
        doseCalculationType: 'BSA_M2',
        standardDose: 1.4, // Max capped at 2.0 mg to prevent severe neurotoxicity
        unit: 'mg/m² (capped at 2mg max)',
        route: 'IV_BOLUS',
        infusionDurationMinutes: 10,
        adminDays: [1],
      },
      {
        drugName: 'Prednisone',
        doseCalculationType: 'BSA_M2',
        standardDose: 100,
        unit: 'mg/day',
        route: 'ORAL',
        adminDays: [1, 2, 3, 4, 5],
      },
    ],
    mandatoryPreChemoLabChecks: {
      minAbsoluteNeutrophilCount: 1500,
      minPlateletCount: 100000,
      maxTotalBilirubinMgDl: 2.0,
      minEgfrMlMin: 40,
      baselineEchocardiogramLvefRequired: true,
    },
  },
];

export class ChemoProtocolService {
  /**
   * Calculate exact patient-specific doses using Mosteller BSA and Calvert Carboplatin AUC
   */
  public static calculatePatientChemoDoses(input: {
    regimenCode: string;
    heightCm: number;
    weightKg: number;
    serumCreatinineMgDl: number;
    ageYears: number;
    gender: 'MALE' | 'FEMALE';
    priorCumulativeDoxorubicinMgM2?: number;
  }): {
    regimen: ChemoRegimenDefinition;
    bsaM2: number;
    calculatedCrClMlMin: number;
    drugDoseCalculations: Array<{
      drugName: string;
      prescribedDoseFormatted: string;
      doseNumber: number;
      unit: string;
      route: string;
      adminDays: number[];
      lifetimeCumulativeWarning?: string;
    }>;
  } {
    const regimen = MASTER_CHEMO_REGIMENS.find((r) => r.regimenCode === input.regimenCode);
    if (!regimen) throw new Error(`Chemotherapy Regimen '${input.regimenCode}' not found`);

    // Mosteller BSA = sqrt((height cm * weight kg) / 3600)
    const bsa = Math.sqrt((input.heightCm * input.weightKg) / 3600);
    const bsaRounded = parseFloat(bsa.toFixed(2));

    // Cockcroft-Gault CrCl = ((140 - age) * weight kg) / (72 * SCr) (* 0.85 if female)
    let crCl = ((140 - input.ageYears) * input.weightKg) / (72 * Math.max(0.7, input.serumCreatinineMgDl));
    if (input.gender === 'FEMALE') crCl *= 0.85;
    const crClCapped = Math.min(125, parseFloat(crCl.toFixed(1))); // Capped at 125 mL/min per FDA guidance

    const drugDoses = regimen.drugs.map((drug) => {
      let finalDose = 0;
      let unitStr = 'mg';
      let lifetimeWarn: string | undefined;

      if (drug.doseCalculationType === 'BSA_M2') {
        finalDose = Math.round(drug.standardDose * bsaRounded);
        // Special safety cap for Vincristine (2.0 mg absolute max)
        if (drug.drugName.toLowerCase().includes('vincristine')) {
          finalDose = Math.min(2.0, parseFloat((drug.standardDose * bsaRounded).toFixed(2)));
        }
      } else if (drug.doseCalculationType === 'AUC_CALVERT') {
        // Calvert Formula: Total Dose (mg) = Target AUC * (GFR + 25)
        finalDose = Math.round(drug.standardDose * (crClCapped + 25));
      } else if (drug.doseCalculationType === 'FLAT_MG') {
        finalDose = drug.standardDose;
      }

      // Check cumulative anthracycline threshold
      if (drug.cumulativeLifetimeCeiling) {
        const prior = input.priorCumulativeDoxorubicinMgM2 || 0;
        const currentM2 = finalDose / bsaRounded;
        const projectedTotal = prior + currentM2 * regimen.totalPlannedCycles;

        if (projectedTotal > drug.cumulativeLifetimeCeiling.maxLifetimeDose) {
          lifetimeWarn = `CRITICAL SAFETY WARNING: Projected lifetime cumulative dose (${Math.round(projectedTotal)} mg/m²) exceeds maximum threshold of ${drug.cumulativeLifetimeCeiling.maxLifetimeDose} mg/m². High risk of irreversible cardiomyopathy. Consider Dexrazoxane cardioprotection or non-anthracycline regimen.`;
        }
      }

      return {
        drugName: drug.drugName,
        prescribedDoseFormatted: `${finalDose} ${unitStr}`,
        doseNumber: finalDose,
        unit: unitStr,
        route: drug.route,
        adminDays: drug.adminDays,
        lifetimeCumulativeWarning: lifetimeWarn,
      };
    });

    return {
      regimen,
      bsaM2: bsaRounded,
      calculatedCrClMlMin: crClCapped,
      drugDoseCalculations: drugDoses,
    };
  }
}
