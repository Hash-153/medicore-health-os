/**
 * Standardized Evidence-Based Clinical Order Sets & Hospital Care Pathways
 * Surviving Sepsis Campaign Hour-1, Acute Coronary Syndrome (ACS), DKA Insulin Protocol, Stroke, and ERAS Pathways
 */

export interface OrderSetItem {
  id: string;
  orderType: 'MEDICATION' | 'LAB_ORDER' | 'DIAGNOSTIC_IMAGING' | 'NURSING_INTERVENTION' | 'DIET_AND_NUTRITION' | 'CONSULT';
  title: string;
  instruction: string;
  priority: 'STAT' | 'ROUTINE' | 'URGENT';
  isPreChecked: boolean;
  clinicalRationale: string;
}

export interface StandardOrderSet {
  orderSetId: string;
  orderSetName: string;
  clinicalDomain: 'CRITICAL_CARE' | 'CARDIOLOGY' | 'ENDOCRINOLOGY' | 'NEUROLOGY' | 'SURGICAL_RECOVERY' | 'PULMONOLOGY';
  guidelineSource: string; // e.g. "2021 Surviving Sepsis Campaign Guidelines"
  targetPopulation: string;
  items: OrderSetItem[];
}

export const MASTER_ORDER_SETS: StandardOrderSet[] = [
  {
    orderSetId: 'SEPSIS_HOUR_1_BUNDLE',
    orderSetName: 'Surviving Sepsis Campaign: Hour-1 Resuscitation Bundle',
    clinicalDomain: 'CRITICAL_CARE',
    guidelineSource: 'Surviving Sepsis Campaign 2021 International Guidelines',
    targetPopulation: 'Adult patients with suspected sepsis, SIRS criteria + suspected infection source, or qSOFA >= 2',
    items: [
      {
        id: 'SEP-01',
        orderType: 'LAB_ORDER',
        title: 'STAT Serum Lactate (Point-of-Care or Venous Blood Gas)',
        instruction: 'Draw immediate baseline serum lactate. Re-measure within 2-4 hours if initial lactate > 2.0 mmol/L to guide fluid resuscitation.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Lactate > 2.0 indicates tissue hypoperfusion; Lactate >= 4.0 mmol/L indicates severe metabolic crisis and septic shock.',
      },
      {
        id: 'SEP-02',
        orderType: 'LAB_ORDER',
        title: 'Blood Cultures (2 Sets from 2 Separate Venipuncture Sites)',
        instruction: 'Draw 2 sets of aerobic and anaerobic blood cultures prior to antimicrobial initiation. Do not delay antibiotics by >45 minutes.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Maximizes microbiological pathogen identification prior to sterilization by antibiotics.',
      },
      {
        id: 'SEP-03',
        orderType: 'MEDICATION',
        title: 'Empiric Broad-Spectrum IV Antibiotics (Vancomycin + Cefepime / Zosyn)',
        instruction: 'Administer Vancomycin 25-30 mg/kg IV loading dose (max 2000mg) + Cefepime 2g IV over 30 mins within 1 hour of recognition.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Each hour of antimicrobial delay in septic shock increases in-hospital mortality by ~7.6%.',
      },
      {
        id: 'SEP-04',
        orderType: 'MEDICATION',
        title: 'Rapid Crystalloid Fluid Resuscitation (30 mL/kg Balanced Salt Solution)',
        instruction: 'Infuse Lactated Ringers or Plasma-Lyte 30 mL/kg IV bolus over 1-2 hours for MAP < 65 mmHg or initial Lactate >= 4.0 mmol/L.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Restores effective circulating intravascular volume and microvascular tissue perfusion.',
      },
      {
        id: 'SEP-05',
        orderType: 'MEDICATION',
        title: 'Norepinephrine Vasopressor Infusion (Titrate for MAP >= 65 mmHg)',
        instruction: 'Initiate Norepinephrine 0.05 mcg/kg/min continuous IV infusion via peripheral line (or central line); titrate rapidly for target MAP >= 65 mmHg.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'First-line vasopressor to restore vascular tone without excessive tachycardia.',
      },
      {
        id: 'SEP-06',
        orderType: 'NURSING_INTERVENTION',
        title: 'Strict Hourly Intake & Output with Foley Catheter with Temperature Sensor',
        instruction: 'Insert indwelling urinary catheter. Log hourly urine output (alert MD if < 0.5 mL/kg/hr for 2 consecutive hours). Continuous core temp.',
        priority: 'URGENT',
        isPreChecked: true,
        clinicalRationale: 'Direct indicator of renal perfusion and end-organ recovery.',
      },
    ],
  },
  {
    orderSetId: 'ACS_STEMI_NSTEMI_PROTOCOL',
    orderSetName: 'Acute Coronary Syndrome (ACS / STEMI / High-Risk NSTEMI) Admission',
    clinicalDomain: 'CARDIOLOGY',
    guidelineSource: '2023 ACC/AHA Guidelines for the Management of Patients with Acute Coronary Syndromes',
    targetPopulation: 'Patients presenting with acute ischemic chest pain, ST-elevation, ST-depression, or elevated Cardiac Troponin',
    items: [
      {
        id: 'ACS-01',
        orderType: 'MEDICATION',
        title: 'Aspirin 325 mg (Non-Enteric Coated Chewable)',
        instruction: 'Administer Aspirin 325 mg PO chewable immediately upon arrival.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Immediate platelet cyclooxygenase-1 (COX-1) inhibition reduces 30-day mortality in acute MI by 23%.',
      },
      {
        id: 'ACS-02',
        orderType: 'MEDICATION',
        title: 'P2Y12 Platelet Inhibitor Loading Dose (Ticagrelor 180 mg or Clopidogrel 600 mg)',
        instruction: 'Administer Ticagrelor 180 mg PO loading dose (or Clopidogrel 600 mg PO if anticoagulation or CABG anticipated).',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Dual antiplatelet therapy (DAPT) prevents stent thrombosis and ischemic re-infarction.',
      },
      {
        id: 'ACS-03',
        orderType: 'MEDICATION',
        title: 'Unfractionated Heparin (UFH) IV Bolus + Maintenance Infusion',
        instruction: 'Administer Heparin 60 Units/kg IV bolus (max 4000 Units), then 12 Units/kg/hr infusion (max 1000 Units/hr) titrated to anti-Xa 0.3-0.7.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Anticoagulation for acute intracoronary thrombus stabilization.',
      },
      {
        id: 'ACS-04',
        orderType: 'MEDICATION',
        title: 'Atorvastatin 80 mg PO (High-Intensity Statin)',
        instruction: 'Administer Atorvastatin 80 mg PO daily; give first dose immediately.',
        priority: 'URGENT',
        isPreChecked: true,
        clinicalRationale: 'Early high-dose statin stabilizes vulnerable plaque and reduces recurrent ischemic events.',
      },
      {
        id: 'ACS-05',
        orderType: 'MEDICATION',
        title: 'Nitroglycerin 0.4 mg Sublingual Tablets (PRN Ischemic Chest Pain)',
        instruction: 'Administer 1 tablet SL every 5 minutes x 3 doses for persistent angina. Hold if SBP < 90 mmHg, HR < 50, or PDE-5 inhibitor use.',
        priority: 'URGENT',
        isPreChecked: true,
        clinicalRationale: 'Coronary vasodilation and preload reduction.',
      },
      {
        id: 'ACS-06',
        orderType: 'LAB_ORDER',
        title: 'High-Sensitivity Cardiac Troponin I/T (Serial 0h, 1h, 3h Protocol)',
        instruction: 'Draw baseline hs-cTn, repeat at 1 hour and 3 hours post-presentation.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Rapid rule-in / rule-out algorithm for acute myocardial necrosis.',
      },
      {
        id: 'ACS-07',
        orderType: 'CONSULT',
        title: 'STAT Interventional Cardiology Consult (Primary PCI Activation)',
        instruction: 'Emergency activation of Cardiac Catheterization Team for STEMI (Door-to-Balloon target < 90 minutes).',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Emergent revascularization of occluded coronary artery.',
      },
    ],
  },
  {
    orderSetId: 'DKA_INSULIN_RESUSCITATION',
    orderSetName: 'Diabetic Ketoacidosis (DKA) & Hyperosmolar Hyperglycemic State (HHS)',
    clinicalDomain: 'ENDOCRINOLOGY',
    guidelineSource: '2023 American Diabetes Association (ADA) Standards of Care in Diabetes',
    targetPopulation: 'Patients with Blood Glucose > 250 mg/dL, Anion Gap > 12, positive serum ketones, and arterial/venous pH < 7.30',
    items: [
      {
        id: 'DKA-01',
        orderType: 'MEDICATION',
        title: 'Initial 0.9% Normal Saline Intravenous Fluid Resuscitation',
        instruction: 'Infuse 0.9% NS at 1000 mL/hr for the first 1-2 hours. Switch to 0.45% NS at 250-500 mL/hr once corrected sodium is normal or elevated.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Corrects profound osmotic diuresis and intravascular dehydration (typical 5-8 liter deficit).',
      },
      {
        id: 'DKA-02',
        orderType: 'MEDICATION',
        title: 'Regular Insulin Continuous Intravenous Infusion (0.1 Units/kg/hr)',
        instruction: 'Administer Regular Insulin 0.1 Units/kg/hr IV continuous infusion (100 Units / 100mL NS). DO NOT start insulin if serum K+ < 3.3 mEq/L.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Suppresses lipolysis, ketogenesis, and hepatic gluconeogenesis to close the metabolic anion gap.',
      },
      {
        id: 'DKA-03',
        orderType: 'MEDICATION',
        title: 'Potassium Chloride IV Replacement (20 - 30 mEq per liter of IV fluid)',
        instruction: 'Add 20-30 mEq KCl per liter of IV fluid once serum K+ falls below 5.2 mEq/L and urine output is established. Maintain K+ 4.0-5.0 mEq/L.',
        priority: 'URGENT',
        isPreChecked: true,
        clinicalRationale: 'Insulin and rehydration drive potassium intracellularly; prevents fatal hypokalemia-induced arrhythmias.',
      },
      {
        id: 'DKA-04',
        orderType: 'MEDICATION',
        title: 'Transition to Dextrose 5% in 0.45% NS (D5 1/2 NS) when Glucose < 200 mg/dL',
        instruction: 'When serum glucose reaches 200 mg/dL, add 5% Dextrose to IV fluids and reduce insulin to 0.02-0.05 Units/kg/hr to maintain glucose 150-200 while gap closes.',
        priority: 'URGENT',
        isPreChecked: true,
        clinicalRationale: 'Prevents hypoglycemia and cerebral edema while continuing insulin therapy to clear ketoacidosis.',
      },
      {
        id: 'DKA-05',
        orderType: 'LAB_ORDER',
        title: 'Basic Metabolic Panel, Venous Blood Gas & Beta-Hydroxybutyrate every 2-4 Hours',
        instruction: 'Serial laboratory draws every 2 hours until anion gap <= 12 and venous pH >= 7.30 (DKA resolved).',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Monitors anion gap closure, potassium shifts, and resolution of acidosis.',
      },
    ],
  },
  {
    orderSetId: 'ACUTE_ISCHEMIC_STROKE_CODE',
    orderSetName: 'Acute Ischemic Stroke Code & Thrombolysis (tPA / TNK) Protocol',
    clinicalDomain: 'NEUROLOGY',
    guidelineSource: '2023 AHA/ASA Guidelines for the Early Management of Patients with Acute Ischemic Stroke',
    targetPopulation: 'Patients presenting with acute focal neurological deficits within 4.5 hours of last known normal (LKN)',
    items: [
      {
        id: 'STR-01',
        orderType: 'DIAGNOSTIC_IMAGING',
        title: 'STAT Non-Contrast Head CT & CT Angiography (CTA Head & Neck)',
        instruction: 'Emergent non-contrast head CT (Door-to-CT completion < 20 minutes) to exclude acute intracranial hemorrhage and assess ASPECT score.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Exclusion of intracranial hemorrhage is the primary requirement prior to IV thrombolysis.',
      },
      {
        id: 'STR-02',
        orderType: 'MEDICATION',
        title: 'Blood Pressure Management (Labetalol IV / Nicardipine IV Drip)',
        instruction: 'Titrate Nicardipine 5-15 mg/hr IV infusion or Labetalol 10-20 mg IV push to maintain SBP < 185 mmHg and DBP < 110 mmHg prior to thrombolysis.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Blood pressure must be strictly below 185/110 mmHg to reduce the risk of hemorrhagic transformation.',
      },
      {
        id: 'STR-03',
        orderType: 'MEDICATION',
        title: 'Tenecteplase (TNKase) 0.25 mg/kg IV Bolus or Alteplase (Activase) 0.9 mg/kg',
        instruction: 'Administer Tenecteplase 0.25 mg/kg IV single bolus over 5 seconds (max 25 mg) if within 4.5h window and no contraindications.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Pharmacological thrombolysis restores cerebral blood flow to the ischemic penumbra.',
      },
      {
        id: 'STR-04',
        orderType: 'NURSING_INTERVENTION',
        title: 'Serial NIHSS & Neuro Vitals Check (every 15 mins x 2h, then q30m x 6h)',
        instruction: 'Perform NIH Stroke Scale exam and neurological checks every 15 minutes during thrombolytic infusion and for 2 hours post.',
        priority: 'STAT',
        isPreChecked: true,
        clinicalRationale: 'Rapidly detects neurological deterioration or acute intracranial hemorrhage.',
      },
      {
        id: 'STR-05',
        orderType: 'NURSING_INTERVENTION',
        title: 'Strict NPO until Formal Bedside Dysphagia Swallow Screen Passed',
        instruction: 'Keep patient strictly NPO (including oral medications and water) until verified bedside nurse swallow screening passed.',
        priority: 'URGENT',
        isPreChecked: true,
        clinicalRationale: 'Post-stroke dysphagia occurs in ~50% of acute strokes; prevents chemical aspiration pneumonia.',
      },
    ],
  },
];

export class OrderSetService {
  /**
   * Retrieve all standardized hospital order sets
   */
  public static getAllOrderSets(): StandardOrderSet[] {
    return MASTER_ORDER_SETS;
  }

  /**
   * Retrieve order set by ID
   */
  public static getOrderSetById(id: string): StandardOrderSet | undefined {
    return MASTER_ORDER_SETS.find((o) => o.orderSetId === id);
  }
}
