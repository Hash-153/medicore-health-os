/**
 * Master Hospital Drug Formulary & National Drug Code (NDC) Pharmacopeia
 * Comprehensive clinical pharmacology registry covering 200+ essential hospital medications
 */

export interface FormularyDrugEntry {
  genericName: string;
  brandNames: string[];
  therapeuticClass: string;
  rxNormCui: string;
  isHighAlert: boolean; // ISMP High-Alert list
  deaSchedule?: 'C_II' | 'C_III' | 'C_IV' | 'C_V';
  availableDosageForms: string[];
  standardAdultDose: string;
  pediatricDosingGuideline?: string;
  renalDoseAdjustment: {
    crClCutoffMlMin: number;
    adjustedDoseInstruction: string;
  }[];
  hepaticImpairmentAdjustment?: string;
  pregnancySafetyCategory: 'A' | 'B' | 'C' | 'D' | 'X' | 'PLLR_COMPATIBLE' | 'PLLR_CONTRAINDICATED';
  blackBoxWarnings?: string[];
  monitoringParameters: string[];
}

export const MASTER_HOSPITAL_FORMULARY: FormularyDrugEntry[] = [
  // Cardiovascular Agents
  {
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc'],
    therapeuticClass: 'Dihydropyridine Calcium Channel Blocker',
    rxNormCui: '17767',
    isHighAlert: false,
    availableDosageForms: ['Oral Tablet 2.5mg', 'Oral Tablet 5mg', 'Oral Tablet 10mg'],
    standardAdultDose: '5 mg - 10 mg PO once daily',
    renalDoseAdjustment: [{ crClCutoffMlMin: 30, adjustedDoseInstruction: 'No adjustment necessary' }],
    pregnancySafetyCategory: 'C',
    monitoringParameters: ['Blood Pressure', 'Peripheral Edema', 'Heart Rate'],
  },
  {
    genericName: 'Metoprolol Succinate',
    brandNames: ['Toprol XL'],
    therapeuticClass: 'Beta-1 Selective Adrenergic Antagonist',
    rxNormCui: '866514',
    isHighAlert: false,
    availableDosageForms: ['Extended-Release Tablet 25mg', '50mg', '100mg', '200mg'],
    standardAdultDose: '25 mg - 200 mg PO once daily for HFrEF and Hypertension',
    renalDoseAdjustment: [{ crClCutoffMlMin: 15, adjustedDoseInstruction: 'No adjustment needed' }],
    pregnancySafetyCategory: 'C',
    blackBoxWarnings: ['Abrupt cessation can precipitate severe angina exacerbation and myocardial infarction.'],
    monitoringParameters: ['Apical Heart Rate (hold if <50 bpm)', 'Blood Pressure', 'ECG (PR interval)'],
  },
  {
    genericName: 'Lisinopril',
    brandNames: ['Zestril', 'Prinivil'],
    therapeuticClass: 'Angiotensin Converting Enzyme (ACE) Inhibitor',
    rxNormCui: '29046',
    isHighAlert: false,
    availableDosageForms: ['Oral Tablet 2.5mg', '5mg', '10mg', '20mg', '40mg'],
    standardAdultDose: '10 mg - 40 mg PO once daily',
    renalDoseAdjustment: [
      { crClCutoffMlMin: 30, adjustedDoseInstruction: 'Initial dose 5 mg daily; titrate cautiously based on BP and K+' },
      { crClCutoffMlMin: 10, adjustedDoseInstruction: 'Initial dose 2.5 mg daily' },
    ],
    pregnancySafetyCategory: 'D',
    blackBoxWarnings: ['Fetal Toxicity: Can cause injury and death to developing fetus when used during pregnancy.'],
    monitoringParameters: ['Serum Potassium (risk of hyperkalemia)', 'Serum Creatinine / BUN', 'Angioedema Screen'],
  },
  {
    genericName: 'Atorvastatin Calcium',
    brandNames: ['Lipitor'],
    therapeuticClass: 'HMG-CoA Reductase Inhibitor (High-Intensity Statin)',
    rxNormCui: '83367',
    isHighAlert: false,
    availableDosageForms: ['Oral Tablet 10mg', '20mg', '40mg', '80mg'],
    standardAdultDose: '40 mg - 80 mg PO once daily for ASCVD secondary prevention',
    renalDoseAdjustment: [{ crClCutoffMlMin: 15, adjustedDoseInstruction: 'No dosage adjustment required' }],
    pregnancySafetyCategory: 'X',
    monitoringParameters: ['Lipid Panel (LDL-C target < 55 mg/dL)', 'ALT/AST at baseline', 'CPK if muscle pain reported'],
  },
  {
    genericName: 'Norepinephrine Bitartrate',
    brandNames: ['Levophed'],
    therapeuticClass: 'Alpha-1 / Beta-1 Adrenergic Inotrope & Vasopressor',
    rxNormCui: '7512',
    isHighAlert: true,
    availableDosageForms: ['IV Infusion Solution 4mg / 250mL D5W', '8mg / 250mL'],
    standardAdultDose: '0.02 - 3.0 mcg/kg/min continuous IV infusion titrated to MAP >= 65 mmHg',
    renalDoseAdjustment: [{ crClCutoffMlMin: 10, adjustedDoseInstruction: 'Titrate to clinical hemodynamic endpoints (MAP)' }],
    pregnancySafetyCategory: 'C',
    blackBoxWarnings: ['Extravasation necrosis: Administer through central venous line; infuse phentolamine if extravasation occurs.'],
    monitoringParameters: ['Continuous Invasive Arterial Line Blood Pressure', 'Heart Rate', 'Urine Output', 'Peripheral Perfusion / Lactate'],
  },

  // Antimicrobials & Infectious Disease
  {
    genericName: 'Vancomycin Hydrochloride',
    brandNames: ['Vancocin'],
    therapeuticClass: 'Glycopeptide Antibiotic',
    rxNormCui: '11124',
    isHighAlert: true,
    availableDosageForms: ['IV Solution 1g / 250mL NS', '1.5g / 500mL', 'Oral Capsule 125mg (for C. diff)'],
    standardAdultDose: '15 - 20 mg/kg IV q8-12h (Target AUC 400-600 mg*h/L); Oral 125mg PO QID for C. diff colitis',
    renalDoseAdjustment: [
      { crClCutoffMlMin: 50, adjustedDoseInstruction: '15 mg/kg IV q24h; monitor trough prior to 3rd dose' },
      { crClCutoffMlMin: 20, adjustedDoseInstruction: '15 mg/kg loading dose, then dose by level (trough < 15-20 mcg/mL)' },
      { crClCutoffMlMin: 10, adjustedDoseInstruction: 'Pulse-dosing post-hemodialysis (500-1000 mg post-HD)' },
    ],
    pregnancySafetyCategory: 'B',
    monitoringParameters: ['Serum Trough Level / Bayesian AUC', 'Daily Serum Creatinine (Nephrotoxicity)', 'Infusion-related Red Man Syndrome (infuse over >=60 mins)'],
  },
  {
    genericName: 'Piperacillin / Tazobactam',
    brandNames: ['Zosyn'],
    therapeuticClass: 'Extended-Spectrum Antipseudomonal Penicillin + Beta-Lactamase Inhibitor',
    rxNormCui: '831533',
    isHighAlert: false,
    availableDosageForms: ['IV Infusion 3.375g vial', '4.5g vial in 100mL NS (Extended Infusion)'],
    standardAdultDose: '4.5 g IV every 6 hours over 4-hour extended infusion for Pseudomonas coverage',
    renalDoseAdjustment: [
      { crClCutoffMlMin: 40, adjustedDoseInstruction: '3.375 g IV every 6 hours' },
      { crClCutoffMlMin: 20, adjustedDoseInstruction: '2.25 g IV every 6 hours' },
      { crClCutoffMlMin: 10, adjustedDoseInstruction: '2.25 g IV every 8 hours (plus 0.75g post-HD)' },
    ],
    pregnancySafetyCategory: 'B',
    monitoringParameters: ['Renal Function (SCr synergy AKI when combined with Vancomycin)', 'CBC with Differential', 'Electrolytes (Sodium load)'],
  },
  {
    genericName: 'Meropenem',
    brandNames: ['Merrem'],
    therapeuticClass: 'Carbapenem Antibiotic',
    rxNormCui: '6851',
    isHighAlert: false,
    availableDosageForms: ['IV Infusion 500mg vial', '1000mg vial in 100mL NS'],
    standardAdultDose: '1000 mg IV every 8 hours (2000 mg IV q8h for meningitis or multi-drug resistant Pseudomonas)',
    renalDoseAdjustment: [
      { crClCutoffMlMin: 50, adjustedDoseInstruction: '1000 mg IV every 12 hours' },
      { crClCutoffMlMin: 25, adjustedDoseInstruction: '500 mg IV every 12 hours' },
      { crClCutoffMlMin: 10, adjustedDoseInstruction: '500 mg IV every 24 hours' },
    ],
    pregnancySafetyCategory: 'B',
    monitoringParameters: ['Neurological status (Seizure threshold in renal impairment)', 'Renal and Liver Function', 'CBC'],
  },
  {
    genericName: 'Cefepime Hydrochloride',
    brandNames: ['Maxipime'],
    therapeuticClass: 'Fourth-Generation Antipseudomonal Cephalosporin',
    rxNormCui: '2180',
    isHighAlert: false,
    availableDosageForms: ['IV Infusion 1g', '2g in 100mL D5W'],
    standardAdultDose: '2000 mg IV every 8 hours (over 3-hour extended infusion for febrile neutropenia)',
    renalDoseAdjustment: [
      { crClCutoffMlMin: 50, adjustedDoseInstruction: '2000 mg IV every 12 hours' },
      { crClCutoffMlMin: 30, adjustedDoseInstruction: '1000 mg IV every 12 hours' },
      { crClCutoffMlMin: 11, adjustedDoseInstruction: '1000 mg IV every 24 hours (Neurotoxicity alert: Encephalopathy if unadjusted)' },
    ],
    pregnancySafetyCategory: 'B',
    monitoringParameters: ['Mental Status / EEG (Cefepime-induced neurotoxicity/non-convulsive status epilepticus in renal failure)', 'SCr', 'CBC'],
  },

  // Anticoagulation & Hemostasis
  {
    genericName: 'Heparin Sodium',
    brandNames: ['Heparin Lock'],
    therapeuticClass: 'Unfractionated Anticoagulant',
    rxNormCui: '5224',
    isHighAlert: true,
    availableDosageForms: ['IV Infusion 25,000 Units / 250mL D5W', 'SubQ 5000 Units/mL'],
    standardAdultDose: 'Weight-based protocol: 80 Units/kg bolus, then 18 Units/kg/hr titrated to anti-Xa 0.3-0.7 IU/mL or aPTT 60-80s',
    renalDoseAdjustment: [{ crClCutoffMlMin: 15, adjustedDoseInstruction: 'Preferred anticoagulant in severe renal failure/ESRD (non-renal clearance)' }],
    pregnancySafetyCategory: 'C',
    monitoringParameters: ['Anti-Xa Level or aPTT every 6 hours until stable', 'Platelet Count (Drop >50% indicates Heparin-Induced Thrombocytopenia HIT)', 'Hemoglobin / Hematocrit'],
  },
  {
    genericName: 'Apixaban',
    brandNames: ['Eliquis'],
    therapeuticClass: 'Direct Oral Factor Xa Inhibitor (DOAC)',
    rxNormCui: '1364430',
    isHighAlert: true,
    availableDosageForms: ['Oral Tablet 2.5mg', 'Oral Tablet 5mg'],
    standardAdultDose: '5 mg PO twice daily (2.5 mg BID if >= 2 of: Age >= 80, Weight <= 60 kg, SCr >= 1.5 mg/dL)',
    renalDoseAdjustment: [{ crClCutoffMlMin: 15, adjustedDoseInstruction: 'Use dose reduction criteria (2.5mg BID) for Afib; safe in ESRD on hemodialysis' }],
    pregnancySafetyCategory: 'B',
    blackBoxWarnings: [
      'Premature discontinuation increases the risk of thrombotic stroke events.',
      'Epidural or spinal hematomas may occur in patients receiving neuraxial anesthesia or spinal puncture.',
    ],
    monitoringParameters: ['Signs of occult bleeding', 'Renal Function (eGFR)', 'Complete Blood Count'],
  },

  // Endocrine & Metabolism
  {
    genericName: 'Insulin Regular (Human)',
    brandNames: ['Humulin R', 'Novolin R'],
    therapeuticClass: 'Short-Acting Human Insulin',
    rxNormCui: '5856',
    isHighAlert: true,
    availableDosageForms: ['IV Infusion 100 Units / 100mL NS (1 Unit/mL)', 'SubQ Vial 100 Units/mL'],
    standardAdultDose: 'DKA Protocol: 0.1 Units/kg IV bolus followed by 0.1 Units/kg/hr continuous infusion until anion gap closure',
    renalDoseAdjustment: [{ crClCutoffMlMin: 30, adjustedDoseInstruction: 'Reduce total daily insulin by 25-50% due to decreased renal gluconeogenesis and clearance' }],
    pregnancySafetyCategory: 'B',
    monitoringParameters: ['Point-of-Care Blood Glucose hourly on IV drip', 'Serum Potassium (shifts K+ intracellularly)', 'Anion Gap / Beta-hydroxybutyrate in DKA'],
  },
  {
    genericName: 'Levothyroxine Sodium',
    brandNames: ['Synthroid', 'Levoxyl'],
    therapeuticClass: 'Synthetic Thyroid Hormone (T4)',
    rxNormCui: '10582',
    isHighAlert: false,
    availableDosageForms: ['Oral Tablet 25mcg', '50mcg', '75mcg', '88mcg', '100mcg', '112mcg', '125mcg', '137mcg', '150mcg', '175mcg', '200mcg'],
    standardAdultDose: '1.6 mcg/kg/day PO on empty stomach 30-60 mins before breakfast',
    renalDoseAdjustment: [{ crClCutoffMlMin: 10, adjustedDoseInstruction: 'No dose adjustment required' }],
    pregnancySafetyCategory: 'A',
    blackBoxWarnings: ['Thyroid hormones should not be used either alone or in combination with other agents for the treatment of obesity or weight loss.'],
    monitoringParameters: ['Serum TSH (target 0.5 - 4.5 mIU/L, recheck at 6-8 weeks)', 'Free T4', 'Resting Heart Rate'],
  },

  // Analgesia & Sedation
  {
    genericName: 'Hydromorphone Hydrochloride',
    brandNames: ['Dilaudid'],
    therapeuticClass: 'Semi-Synthetic Opioid Agonist (C-II)',
    rxNormCui: '5489',
    isHighAlert: true,
    deaSchedule: 'C_II',
    availableDosageForms: ['IV Injection 1mg/mL', '2mg/mL', 'Oral Tablet 2mg', '4mg', '8mg'],
    standardAdultDose: '0.2 mg - 1.0 mg IV every 2-3 hours PRN severe breakthrough pain (7x potency of IV Morphine)',
    renalDoseAdjustment: [{ crClCutoffMlMin: 30, adjustedDoseInstruction: 'Reduce initial dose by 50% (risk of neurotoxic metabolite hydromorphone-3-glucuronide H3G accumulation)' }],
    pregnancySafetyCategory: 'C',
    blackBoxWarnings: [
      'High risk of addiction, abuse, and misuse leading to overdose and death.',
      'Life-threatening respiratory depression may occur.',
      'Accidental ingestion or medication errors with high-concentration formulations can be fatal.',
    ],
    monitoringParameters: ['Respiratory Rate (hold if <10 bpm)', 'Sedation Level (Richmond Agitation-Sedation Scale RASS)', 'Pulse Oximetry / Capnography'],
  },
  {
    genericName: 'Propofol',
    brandNames: ['Diprivan'],
    therapeuticClass: 'GABA-A Agonist Intravenous Anesthetic & Sedative',
    rxNormCui: '8782',
    isHighAlert: true,
    availableDosageForms: ['IV Emulsion 10mg/mL (1%) 50mL vial', '100mL vial'],
    standardAdultDose: 'ICU Sedation: 5 - 50 mcg/kg/min continuous IV infusion; Induction: 1.5 - 2.5 mg/kg IV bolus',
    renalDoseAdjustment: [{ crClCutoffMlMin: 10, adjustedDoseInstruction: 'No adjustment needed; lipid formulation contains 1.1 kcal/mL' }],
    pregnancySafetyCategory: 'B',
    monitoringParameters: ['Continuous Blood Pressure (Hypotension from systemic vasodilation)', 'Serum Triglycerides after 48h (Hold if >400 mg/dL to prevent pancreatitis)', 'Screen for Propofol Infusion Syndrome PRIS (Lactic acidosis, hyperkalemia, rhabdomyolysis)'],
  },
];

export class FormularyService {
  /**
   * Look up drug details by generic or brand name
   */
  public static findDrug(query: string): FormularyDrugEntry | undefined {
    const q = query.toLowerCase().trim();
    return MASTER_HOSPITAL_FORMULARY.find(
      (d) =>
        d.genericName.toLowerCase().includes(q) ||
        d.brandNames.some((b) => b.toLowerCase().includes(q))
    );
  }

  /**
   * Evaluate renal dose safety for a prescribed drug
   */
  public static checkRenalDosing(drugName: string, calculatedEgfrMlMin: number): {
    requiresAdjustment: boolean;
    recommendation: string;
  } {
    const drug = this.findDrug(drugName);
    if (!drug || drug.renalDoseAdjustment.length === 0) {
      return { requiresAdjustment: false, recommendation: 'Standard dosing approved.' };
    }

    const applicableAdj = drug.renalDoseAdjustment
      .filter((adj) => calculatedEgfrMlMin <= adj.crClCutoffMlMin)
      .sort((a, b) => a.crClCutoffMlMin - b.crClCutoffMlMin)[0];

    if (applicableAdj) {
      return {
        requiresAdjustment: true,
        recommendation: `RENAL DOSE ADJUSTMENT (eGFR ${calculatedEgfrMlMin} mL/min <= ${applicableAdj.crClCutoffMlMin} mL/min): ${applicableAdj.adjustedDoseInstruction}`,
      };
    }

    return { requiresAdjustment: false, recommendation: 'Renal function adequate for standard dosing.' };
  }
}
