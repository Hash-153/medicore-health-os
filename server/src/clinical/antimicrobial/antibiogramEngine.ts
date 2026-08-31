/**
 * Hospital Antibiogram & Antimicrobial Stewardship Engine
 * Cumulative susceptibility percentages, pathogen-drug resistance profiles, and empirical antibiotic optimization
 */

export interface PathogenAntibiogramEntry {
  organismName: string;
  gramStain: 'GRAM_POSITIVE' | 'GRAM_NEGATIVE' | 'ANAEROBE' | 'ATYPICAL' | 'FUNGAL';
  isolatesTestedCount: number;
  susceptibilityPercentByAntibiotic: Record<string, number>; // e.g. { "Vancomycin": 100, "Oxacillin": 48, "Ceftriaxone": 82 }
  intrinsicResistanceList: string[];
}

export const HOSPITAL_ANTIBIOGRAM_DATA: PathogenAntibiogramEntry[] = [
  // Gram-Positive Cocci
  {
    organismName: 'Staphylococcus aureus (MSSA)',
    gramStain: 'GRAM_POSITIVE',
    isolatesTestedCount: 420,
    susceptibilityPercentByAntibiotic: {
      Oxacillin: 100,
      Cefazolin: 100,
      Vancomycin: 100,
      Daptomycin: 100,
      Linezolid: 100,
      Trimethoprim_Sulfamethoxazole: 96,
      Clindamycin: 84,
      Doxycycline: 94,
      Levofloxacin: 72,
    },
    intrinsicResistanceList: ['Penicillin G', 'Ampicillin', 'Aztreonam', 'Colistin'],
  },
  {
    organismName: 'Staphylococcus aureus (MRSA)',
    gramStain: 'GRAM_POSITIVE',
    isolatesTestedCount: 285,
    susceptibilityPercentByAntibiotic: {
      Vancomycin: 100,
      Daptomycin: 100,
      Linezolid: 100,
      Ceftaroline: 98,
      Trimethoprim_Sulfamethoxazole: 92,
      Doxycycline: 90,
      Clindamycin: 62,
      Levofloxacin: 28,
      Oxacillin: 0,
      Cefazolin: 0,
    },
    intrinsicResistanceList: ['All Beta-Lactams (except Ceftaroline)', 'Aztreonam'],
  },
  {
    organismName: 'Enterococcus faecalis',
    gramStain: 'GRAM_POSITIVE',
    isolatesTestedCount: 195,
    susceptibilityPercentByAntibiotic: {
      Ampicillin: 98,
      Vancomycin: 96,
      Daptomycin: 100,
      Linezolid: 99,
      Nitrofurantoin: 98,
      Gentamicin_Synergy: 82,
    },
    intrinsicResistanceList: ['All Cephalosporins', 'Trimethoprim_Sulfamethoxazole', 'Clindamycin', 'Macrolides'],
  },
  {
    organismName: 'Enterococcus faecium (VRE)',
    gramStain: 'GRAM_POSITIVE',
    isolatesTestedCount: 110,
    susceptibilityPercentByAntibiotic: {
      Daptomycin: 96,
      Linezolid: 98,
      Tigecycline: 98,
      Ampicillin: 12,
      Vancomycin: 8,
    },
    intrinsicResistanceList: ['All Cephalosporins', 'Trimethoprim_Sulfamethoxazole', 'Clindamycin', 'Aminoglycoside Monotherapy'],
  },
  {
    organismName: 'Streptococcus pneumoniae',
    gramStain: 'GRAM_POSITIVE',
    isolatesTestedCount: 145,
    susceptibilityPercentByAntibiotic: {
      Ceftriaxone: 96,
      Vancomycin: 100,
      Levofloxacin: 98,
      Penicillin: 84,
      Azithromycin: 64,
    },
    intrinsicResistanceList: ['Aminoglycosides', 'Aztreonam'],
  },

  // Gram-Negative Bacilli
  {
    organismName: 'Escherichia coli (Non-ESBL)',
    gramStain: 'GRAM_NEGATIVE',
    isolatesTestedCount: 850,
    susceptibilityPercentByAntibiotic: {
      Ceftriaxone: 88,
      Cefepime: 92,
      Piperacillin_Tazobactam: 94,
      Meropenem: 100,
      Ertapenem: 100,
      Gentamicin: 91,
      Amikacin: 99,
      Ciprofloxacin: 74,
      Trimethoprim_Sulfamethoxazole: 72,
      Nitrofurantoin: 94,
    },
    intrinsicResistanceList: ['Vancomycin', 'Daptomycin', 'Linezolid', 'Clindamycin'],
  },
  {
    organismName: 'Escherichia coli (ESBL Producer)',
    gramStain: 'GRAM_NEGATIVE',
    isolatesTestedCount: 160,
    susceptibilityPercentByAntibiotic: {
      Meropenem: 100,
      Ertapenem: 98,
      Amikacin: 96,
      Nitrofurantoin: 88,
      Piperacillin_Tazobactam: 78,
      Ceftriaxone: 0,
      Cefepime: 15,
      Ciprofloxacin: 32,
      Trimethoprim_Sulfamethoxazole: 42,
    },
    intrinsicResistanceList: ['All Penicillins and Cephalosporins (except Ceftolozane/Tazobactam in select strains)'],
  },
  {
    organismName: 'Pseudomonas aeruginosa',
    gramStain: 'GRAM_NEGATIVE',
    isolatesTestedCount: 310,
    susceptibilityPercentByAntibiotic: {
      Piperacillin_Tazobactam: 86,
      Cefepime: 88,
      Ceftazidime: 84,
      Meropenem: 82,
      Tobramycin: 94,
      Amikacin: 96,
      Ciprofloxacin: 76,
      Ceftolozane_Tazobactam: 96,
      Ceftazidime_Avibactam: 94,
      Colistin: 98,
    },
    intrinsicResistanceList: [
      'Ampicillin',
      'Amoxicillin_Clavulanate',
      'Cefazolin',
      'Ceftriaxone',
      'Ertapenem',
      'Trimethoprim_Sulfamethoxazole',
      'Tigecycline',
    ],
  },
  {
    organismName: 'Klebsiella pneumoniae (KPC Carbapenemase Producer)',
    gramStain: 'GRAM_NEGATIVE',
    isolatesTestedCount: 45,
    susceptibilityPercentByAntibiotic: {
      Ceftazidime_Avibactam: 94,
      Meropenem_Vaborbactam: 96,
      Plazomicin: 92,
      Colistin: 88,
      Tigecycline: 86,
      Meropenem: 12,
      Cefepime: 4,
      Piperacillin_Tazobactam: 0,
    },
    intrinsicResistanceList: ['All Standard Beta-Lactams, Cephalosporins, Carbapenems without novel beta-lactamase inhibitor'],
  },
];

export class AntibiogramStewardshipService {
  /**
   * Recommend empiric antimicrobial therapy based on clinical syndrome and hospital antibiogram
   */
  public static recommendEmpiricRegimen(clinicalSyndrome: 'HAP_VAP' | 'UROSEPSIS' | 'INTRA_ABDOMINAL' | 'MENINGITIS' | 'FEBRILE_NEUTROPENIA'): {
    primaryRegimen: string[];
    alternativeRegimenIfBetaLactamAllergy: string[];
    pseudomonasCovered: boolean;
    mrsaCovered: boolean;
    clinicalRationale: string;
  } {
    switch (clinicalSyndrome) {
      case 'HAP_VAP':
        return {
          primaryRegimen: ['Cefepime 2g IV q8h (Extended Infusion)', 'Vancomycin 15-20 mg/kg IV q8-12h (Target AUC 400-600)'],
          alternativeRegimenIfBetaLactamAllergy: ['Levofloxacin 750mg IV q24h', 'Vancomycin 15-20 mg/kg IV q8-12h'],
          pseudomonasCovered: true,
          mrsaCovered: true,
          clinicalRationale: 'ATS/IDSA Guidelines: Dual coverage for Pseudomonas aeruginosa and MRSA indicated for hospital-acquired pneumonia with mortality risk.',
        };
      case 'UROSEPSIS':
        return {
          primaryRegimen: ['Ceftriaxone 2g IV q24h', 'or Piperacillin-Tazobactam 3.375g IV q6h if prior Pseudomonas or healthcare-associated'],
          alternativeRegimenIfBetaLactamAllergy: ['Aztreonam 2g IV q8h', 'or Gentamicin 5-7 mg/kg IV q24h single dose'],
          pseudomonasCovered: true,
          mrsaCovered: false,
          clinicalRationale: 'Gram-negative enterobacterales (E. coli, K. pneumoniae, Proteus) predominate. Escalate to carbapenem (Meropenem) if prior ESBL history.',
        };
      case 'INTRA_ABDOMINAL':
        return {
          primaryRegimen: ['Piperacillin-Tazobactam 3.375g IV q6h', 'or Ceftriaxone 2g IV q24h + Metronidazole 500mg IV q8h'],
          alternativeRegimenIfBetaLactamAllergy: ['Ciprofloxacin 400mg IV q12h + Metronidazole 500mg IV q8h + Vancomycin'],
          pseudomonasCovered: true,
          mrsaCovered: false,
          clinicalRationale: 'Requires enteric gram-negative bacillus and anaerobic (Bacteroides fragilis) coverage for ruptured intra-abdominal viscous.',
        };
      case 'MENINGITIS':
        return {
          primaryRegimen: ['Ceftriaxone 2g IV q12h', 'Vancomycin 15-20 mg/kg IV q8-12h', 'Ampicillin 2g IV q4h (if age > 50 for Listeria monocytogenes)', 'Dexamethasone 10mg IV prior to first antibiotic dose'],
          alternativeRegimenIfBetaLactamAllergy: ['Vancomycin + Moxifloxacin + Trimethoprim-Sulfamethoxazole (for Listeria)'],
          pseudomonasCovered: false,
          mrsaCovered: true,
          clinicalRationale: 'High-dose Ceftriaxone (CNS penetration) + Vancomycin (Cephalosporin-resistant S. pneumoniae) + Ampicillin (Listeria) + adjunctive steroid (reduces hearing loss).',
        };
      case 'FEBRILE_NEUTROPENIA':
        return {
          primaryRegimen: ['Cefepime 2g IV q8h (Extended Infusion)', 'Add Vancomycin only if hemodynamic instability, catheter-site infection, or pneumonia'],
          alternativeRegimenIfBetaLactamAllergy: ['Aztreonam 2g IV q8h + Vancomycin 15-20 mg/kg IV q12h'],
          pseudomonasCovered: true,
          mrsaCovered: false,
          clinicalRationale: 'IDSA Guideline: Monotherapy antipseudomonal beta-lactam (Cefepime/Meropenem/Zosyn). Routine empiric vancomycin is not recommended unless specific clinical criteria met.',
        };
    }
  }
}
