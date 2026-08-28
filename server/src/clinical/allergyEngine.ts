/**
 * Allergy Cross-Reactivity & Drug Hypersensitivity Engine
 */

export interface AllergyRecord {
  id: string;
  patientId: string;
  allergen: string; // e.g. "Penicillin", "Sulfa drugs", "Aspirin", "Peanuts", "Latex"
  category: 'MEDICATION' | 'FOOD' | 'ENVIRONMENTAL' | 'BIOLOGICAL';
  reaction: string; // e.g. "Anaphylaxis", "Urticaria/Hives", "Angioedema", "GI Upset"
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
  onsetYear?: number;
}

export interface AllergyConflict {
  allergen: string;
  proposedMedication: string;
  crossReactivityRisk: 'DIRECT_MATCH' | 'HIGH_CROSS_REACTIVITY' | 'MODERATE_CROSS_REACTIVITY';
  mechanism: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
  recommendation: string;
}

// Known pharmacological class cross-reactivity clusters
const DRUG_ALLERGY_CLUSTERS: Array<{
  clusterName: string;
  primaryAllergenMatches: string[];
  crossReactiveMedications: string[];
  riskLevel: 'HIGH_CROSS_REACTIVITY' | 'MODERATE_CROSS_REACTIVITY';
  clinicalExplanation: string;
}> = [
  {
    clusterName: 'Beta-Lactam Penicillins',
    primaryAllergenMatches: ['penicillin', 'amoxicillin', 'ampicillin', 'augmentin', 'piperacillin'],
    crossReactiveMedications: [
      'penicillin',
      'amoxicillin',
      'ampicillin',
      'augmentin',
      'piperacillin',
      'cephalexin',
      'cefazolin',
      'ceftriaxone',
      'cefuroxime',
      'meropenem',
      'ertapenem',
    ],
    riskLevel: 'HIGH_CROSS_REACTIVITY',
    clinicalExplanation: 'Shared beta-lactam ring structure; 1st/2nd gen cephalosporins carry 3-5% cross-reactivity risk.',
  },
  {
    clusterName: 'Sulfonamides (Sulfa)',
    primaryAllergenMatches: ['sulfa', 'sulfamethoxazole', 'bactrim', 'septra'],
    crossReactiveMedications: [
      'sulfamethoxazole',
      'bactrim',
      'septra',
      'sulfasalazine',
      'sulfadiazine',
      'furosemide',
      'hydrochlorothiazide',
      'celecoxib',
    ],
    riskLevel: 'HIGH_CROSS_REACTIVITY',
    clinicalExplanation: 'Arylamine sulfonamide sensitivity. High risk with antibiotic sulfas; lower with non-arylamine diuretics.',
  },
  {
    clusterName: 'NSAIDs & Aspirin',
    primaryAllergenMatches: ['aspirin', 'nsaid', 'ibuprofen', 'naproxen'],
    crossReactiveMedications: [
      'aspirin',
      'ibuprofen',
      'naproxen',
      'ketorolac',
      'diclofenac',
      'meloxicam',
      'indomethacin',
      'celecoxib',
    ],
    riskLevel: 'HIGH_CROSS_REACTIVITY',
    clinicalExplanation: 'COX-1 inhibition shunts arachidonic acid to leukotrienes triggering bronchospasm and urticaria.',
  },
  {
    clusterName: 'Fluoroquinolones',
    primaryAllergenMatches: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'quinolone'],
    crossReactiveMedications: ['ciprofloxacin', 'levofloxacin', 'moxifloxacin', 'ofloxacin'],
    riskLevel: 'HIGH_CROSS_REACTIVITY',
    clinicalExplanation: 'Class-wide quinolone hypersensitivity and tendon rupture susceptibility.',
  },
  {
    clusterName: 'Opioids / Morphine class',
    primaryAllergenMatches: ['codeine', 'morphine', 'oxycodone'],
    crossReactiveMedications: ['codeine', 'morphine', 'oxycodone', 'hydrocodone', 'hydromorphone'],
    riskLevel: 'MODERATE_CROSS_REACTIVITY',
    clinicalExplanation: 'Phenanthrene chemical class cross-reactivity and direct mast cell degranulation.',
  },
];

export class AllergyEngine {
  /**
   * Check if a proposed medication conflicts with patient allergy history
   */
  public static checkAllergyConflicts(proposedMedication: string, allergies: AllergyRecord[]): AllergyConflict[] {
    const conflicts: AllergyConflict[] = [];
    const proposed = proposedMedication.toLowerCase();

    for (const allergy of allergies) {
      const allergen = allergy.allergen.toLowerCase();

      // 1. Direct Name Match
      if (proposed.includes(allergen) || allergen.includes(proposed)) {
        conflicts.push({
          allergen: allergy.allergen,
          proposedMedication,
          crossReactivityRisk: 'DIRECT_MATCH',
          mechanism: 'Direct allergen match with documented patient allergy.',
          severity: allergy.severity,
          recommendation: `DO NOT PRESCRIBE. Patient has a documented ${allergy.severity} allergic reaction (${allergy.reaction}) to ${allergy.allergen}.`,
        });
        continue;
      }

      // 2. Class-wide Cross-Reactivity Matching
      for (const cluster of DRUG_ALLERGY_CLUSTERS) {
        const allergenMatchesCluster = cluster.primaryAllergenMatches.some((match) => allergen.includes(match));
        const proposedMatchesCluster = cluster.crossReactiveMedications.some((drug) => proposed.includes(drug));

        if (allergenMatchesCluster && proposedMatchesCluster) {
          conflicts.push({
            allergen: allergy.allergen,
            proposedMedication,
            crossReactivityRisk: cluster.riskLevel,
            mechanism: cluster.clinicalExplanation,
            severity: allergy.severity,
            recommendation: `CAUTION: Potential cross-reactivity in the ${cluster.clusterName} class. Patient is allergic to ${allergy.allergen} (${allergy.reaction}). Select alternative drug class.`,
          });
        }
      }
    }

    return conflicts;
  }
}
