/**
 * Pharmacological Drug-Drug Interaction Matrix & Contraindication Checker
 * Clinical Decision Support System (CDSS) for Prescribers & Pharmacists
 */

export type InteractionSeverity = 'CONTRAINDICATED' | 'MAJOR' | 'MODERATE' | 'MINOR';

export interface DrugInteractionRule {
  id: string;
  drugA: string; // Drug name or class (case-insensitive substring match)
  drugB: string; // Drug name or class (case-insensitive substring match)
  severity: InteractionSeverity;
  title: string;
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

export interface DetectedInteraction {
  severity: InteractionSeverity;
  title: string;
  drugsInvolved: [string, string];
  mechanism: string;
  clinicalEffect: string;
  recommendation: string;
}

export const DRUG_INTERACTION_RULES: DrugInteractionRule[] = [
  {
    id: 'DDI-001',
    drugA: 'warfarin',
    drugB: 'aspirin',
    severity: 'MAJOR',
    title: 'Warfarin + Aspirin: Synergistic Bleeding Hazard',
    mechanism: 'Combined inhibition of vitamin K-dependent clotting factors and platelet aggregation.',
    clinicalEffect: 'Severe gastrointestinal hemorrhage, intracranial bleeding, markedly elevated INR.',
    recommendation: 'Avoid combination unless explicit indication (e.g., mechanical heart valve + recent ACS). Monitor INR closely.',
  },
  {
    id: 'DDI-002',
    drugA: 'warfarin',
    drugB: 'ibuprofen',
    severity: 'CONTRAINDICATED',
    title: 'Warfarin + NSAIDs: High Risk Upper GI Bleeding',
    mechanism: 'NSAIDs displace warfarin from albumin, inhibit platelets, and damage gastric mucosa.',
    clinicalEffect: 'Acute massive GI hemorrhage.',
    recommendation: 'Contraindicated. Prescribe acetaminophen for analgesia instead of NSAIDs.',
  },
  {
    id: 'DDI-003',
    drugA: 'lisinopril',
    drugB: 'spironolactone',
    severity: 'MAJOR',
    title: 'ACE Inhibitor + Potassium-Sparing Diuretic: Severe Hyperkalemia',
    mechanism: 'Dual suppression of aldosterone synthesis leading to renal potassium retention.',
    clinicalEffect: 'Severe hyperkalemia (>6.0 mmol/L), cardiac arrhythmias, asystole.',
    recommendation: 'Check serum potassium and creatinine within 1 week of co-initiation. Advise low-potassium diet.',
  },
  {
    id: 'DDI-004',
    drugA: 'sertraline',
    drugB: 'phenelzine',
    severity: 'CONTRAINDICATED',
    title: 'SSRI + MAOI: Serotonin Syndrome',
    mechanism: 'Profound elevation of central synaptic serotonin concentrations via reuptake block + degraded catabolism.',
    clinicalEffect: 'Serotonin syndrome: hyperthermia, autonomic instability, clonus, delirium, death.',
    recommendation: 'Absolute contraindication. Require at least a 14-day washout period between SSRI and MAOI.',
  },
  {
    id: 'DDI-005',
    drugA: 'simvastatin',
    drugB: 'clarithromycin',
    severity: 'CONTRAINDICATED',
    title: 'Simvastatin + CYP3A4 Inhibitor (Clarithromycin): Rhabdomyolysis',
    mechanism: 'Potent CYP3A4 inhibition increases simvastatin plasma concentrations by up to 10-fold.',
    clinicalEffect: 'Acute rhabdomyolysis, myoglobinuria, acute renal failure.',
    recommendation: 'Hold simvastatin during clarithromycin therapy, or substitute azithromycin.',
  },
  {
    id: 'DDI-006',
    drugA: 'sildenafil',
    drugB: 'nitroglycerin',
    severity: 'CONTRAINDICATED',
    title: 'PDE5 Inhibitor + Nitrate: Refractory Hypotension',
    mechanism: 'Synergistic cGMP accumulation causing profound systemic vasodilation.',
    clinicalEffect: 'Life-threatening hypotension, myocardial infarction, syncope.',
    recommendation: 'Absolute contraindication. Never administer nitrates within 24 hours of sildenafil (48 hours for tadalafil).',
  },
  {
    id: 'DDI-007',
    drugA: 'clopidogrel',
    drugB: 'omeprazole',
    severity: 'MODERATE',
    title: 'Clopidogrel + Omeprazole: Reduced Antiplatelet Efficacy',
    mechanism: 'Omeprazole inhibits CYP2C19, preventing conversion of clopidogrel to its active metabolite.',
    clinicalEffect: 'Increased risk of recurrent ischemic events or stent thrombosis.',
    recommendation: 'Switch PPI to pantoprazole or famotidine which exhibit minimal CYP2C19 inhibition.',
  },
  {
    id: 'DDI-008',
    drugA: 'digoxin',
    drugB: 'amiodarone',
    severity: 'MAJOR',
    title: 'Digoxin + Amiodarone: Digoxin Toxicity',
    mechanism: 'Amiodarone inhibits P-glycoprotein efflux pump, decreasing renal and non-renal digoxin clearance.',
    clinicalEffect: 'Digitalis toxicity: fatal arrhythmias, complete heart block, nausea, visual disturbances.',
    recommendation: 'Reduce digoxin dose by 50% upon initiating amiodarone and monitor digoxin serum trough.',
  },
  {
    id: 'DDI-009',
    drugA: 'ciprofloxacin',
    drugB: 'amiodarone',
    severity: 'MAJOR',
    title: 'Fluoroquinolone + Antiarrhythmic: QTc Prolongation / Torsades',
    mechanism: 'Additive blockade of hERG cardiac potassium channels prolonging cardiac repolarization.',
    clinicalEffect: 'Torsades de pointes, ventricular fibrillation, sudden cardiac arrest.',
    recommendation: 'Avoid combination. Obtain baseline and serial 12-lead ECG monitoring if unavoidable.',
  },
  {
    id: 'DDI-010',
    drugA: 'methotrexate',
    drugB: 'naproxen',
    severity: 'MAJOR',
    title: 'Methotrexate + NSAID: Methotrexate Toxicity',
    mechanism: 'NSAIDs reduce renal blood flow and competitive inhibition of renal tubular secretion of methotrexate.',
    clinicalEffect: 'Severe bone marrow suppression, leukopenia, mucositis, nephrotoxicity.',
    recommendation: 'Avoid concurrent high-dose methotrexate and NSAIDs. Monitor CBC and renal panel.',
  },
  {
    id: 'DDI-011',
    drugA: 'metformin',
    drugB: 'iodinated contrast',
    severity: 'MAJOR',
    title: 'Metformin + Radiographic Contrast: Lactic Acidosis Hazard',
    mechanism: 'Contrast-induced nephropathy leads to acute metformin accumulation.',
    clinicalEffect: 'Fatal metformin-associated lactic acidosis (MALA).',
    recommendation: 'Discontinue metformin prior to or at time of iodinated contrast study; withhold for 48h post-procedure.',
  },
];

export class DrugInteractionChecker {
  /**
   * Check a proposed medication against active medications for a patient
   */
  public static checkInteractions(
    proposedDrug: string,
    activeMedications: string[]
  ): {
    hasInteractions: boolean;
    highestSeverity: InteractionSeverity | 'NONE';
    interactions: DetectedInteraction[];
  } {
    const detected: DetectedInteraction[] = [];
    const proposedLower = proposedDrug.toLowerCase();

    for (const activeDrug of activeMedications) {
      const activeLower = activeDrug.toLowerCase();

      for (const rule of DRUG_INTERACTION_RULES) {
        const matchesForward =
          proposedLower.includes(rule.drugA.toLowerCase()) && activeLower.includes(rule.drugB.toLowerCase());
        const matchesReverse =
          proposedLower.includes(rule.drugB.toLowerCase()) && activeLower.includes(rule.drugA.toLowerCase());

        if (matchesForward || matchesReverse) {
          detected.push({
            severity: rule.severity,
            title: rule.title,
            drugsInvolved: [proposedDrug, activeDrug],
            mechanism: rule.mechanism,
            clinicalEffect: rule.clinicalEffect,
            recommendation: rule.recommendation,
          });
        }
      }
    }

    // Determine highest severity
    let highestSeverity: InteractionSeverity | 'NONE' = 'NONE';
    if (detected.some((i) => i.severity === 'CONTRAINDICATED')) {
      highestSeverity = 'CONTRAINDICATED';
    } else if (detected.some((i) => i.severity === 'MAJOR')) {
      highestSeverity = 'MAJOR';
    } else if (detected.some((i) => i.severity === 'MODERATE')) {
      highestSeverity = 'MODERATE';
    } else if (detected.some((i) => i.severity === 'MINOR')) {
      highestSeverity = 'MINOR';
    }

    return {
      hasInteractions: detected.length > 0,
      highestSeverity,
      interactions: detected,
    };
  }

  /**
   * Check complete active medication list for internal pairwise interactions
   */
  public static checkMedicationList(medications: string[]): DetectedInteraction[] {
    const detected: DetectedInteraction[] = [];
    const seenPairs = new Set<string>();

    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const drugA = medications[i].toLowerCase();
        const drugB = medications[j].toLowerCase();

        for (const rule of DRUG_INTERACTION_RULES) {
          const matchesForward = drugA.includes(rule.drugA) && drugB.includes(rule.drugB);
          const matchesReverse = drugA.includes(rule.drugB) && drugB.includes(rule.drugA);

          if (matchesForward || matchesReverse) {
            const pairKey = `${rule.id}-${i}-${j}`;
            if (!seenPairs.has(pairKey)) {
              seenPairs.add(pairKey);
              detected.push({
                severity: rule.severity,
                title: rule.title,
                drugsInvolved: [medications[i], medications[j]],
                mechanism: rule.mechanism,
                clinicalEffect: rule.clinicalEffect,
                recommendation: rule.recommendation,
              });
            }
          }
        }
      }
    }

    return detected;
  }
}
