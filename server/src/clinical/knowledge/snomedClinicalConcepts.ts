/**
 * SNOMED CT Clinical Terms Master Ontology Knowledge Base
 * Standard international healthcare terminology mapping Concepts, FSNs, Semantic Tags, and Concept Hierarchies
 */

export interface SnomedConceptRecord {
  conceptId: string;
  fullySpecifiedName: string;
  preferredTerm: string;
  semanticTag: 'disorder' | 'finding' | 'procedure' | 'body structure' | 'substance' | 'observable entity' | 'organism';
  parentConceptId?: string;
  isPrimitive: boolean;
  icd10Mapping?: string;
}

export const MASTER_SNOMED_CONCEPTS: SnomedConceptRecord[] = [
  // Clinical Findings & Disorders (Cardiovascular)
  {
    conceptId: '59621000',
    fullySpecifiedName: 'Essential hypertension (disorder)',
    preferredTerm: 'Essential hypertension',
    semanticTag: 'disorder',
    parentConceptId: '38341003',
    isPrimitive: false,
    icd10Mapping: 'I10',
  },
  {
    conceptId: '401303003',
    fullySpecifiedName: 'Acute ST segment elevation myocardial infarction of anterior wall (disorder)',
    preferredTerm: 'Acute anterior STEMI',
    semanticTag: 'disorder',
    parentConceptId: '22298006',
    isPrimitive: false,
    icd10Mapping: 'I21.09',
  },
  {
    conceptId: '401314000',
    fullySpecifiedName: 'Acute non-ST segment elevation myocardial infarction (disorder)',
    preferredTerm: 'Acute NSTEMI',
    semanticTag: 'disorder',
    parentConceptId: '22298006',
    isPrimitive: false,
    icd10Mapping: 'I21.4',
  },
  {
    conceptId: '282825002',
    fullySpecifiedName: 'Paroxysmal atrial fibrillation (disorder)',
    preferredTerm: 'Paroxysmal atrial fibrillation',
    semanticTag: 'disorder',
    parentConceptId: '49436004',
    isPrimitive: false,
    icd10Mapping: 'I48.0',
  },
  {
    conceptId: '441481004',
    fullySpecifiedName: 'Chronic systolic heart failure (disorder)',
    preferredTerm: 'Chronic systolic heart failure (HFrEF)',
    semanticTag: 'disorder',
    parentConceptId: '84114007',
    isPrimitive: false,
    icd10Mapping: 'I50.22',
  },
  {
    conceptId: '441482006',
    fullySpecifiedName: 'Chronic diastolic heart failure (disorder)',
    preferredTerm: 'Chronic diastolic heart failure (HFpEF)',
    semanticTag: 'disorder',
    parentConceptId: '84114007',
    isPrimitive: false,
    icd10Mapping: 'I50.32',
  },
  {
    conceptId: '59282003',
    fullySpecifiedName: 'Pulmonary embolism (disorder)',
    preferredTerm: 'Pulmonary embolism',
    semanticTag: 'disorder',
    parentConceptId: '128053003',
    isPrimitive: false,
    icd10Mapping: 'I26.99',
  },

  // Endocrine & Metabolic Disorders
  {
    conceptId: '44054006',
    fullySpecifiedName: 'Type 2 diabetes mellitus (disorder)',
    preferredTerm: 'Type 2 diabetes mellitus',
    semanticTag: 'disorder',
    parentConceptId: '73211009',
    isPrimitive: false,
    icd10Mapping: 'E11.9',
  },
  {
    conceptId: '46635009',
    fullySpecifiedName: 'Type 1 diabetes mellitus (disorder)',
    preferredTerm: 'Type 1 diabetes mellitus',
    semanticTag: 'disorder',
    parentConceptId: '73211009',
    isPrimitive: false,
    icd10Mapping: 'E10.9',
  },
  {
    conceptId: '420422005',
    fullySpecifiedName: 'Diabetic ketoacidosis (disorder)',
    preferredTerm: 'Diabetic ketoacidosis',
    semanticTag: 'disorder',
    parentConceptId: '73211009',
    isPrimitive: false,
    icd10Mapping: 'E10.10',
  },
  {
    conceptId: '40930008',
    fullySpecifiedName: 'Hypothyroidism (disorder)',
    preferredTerm: 'Hypothyroidism',
    semanticTag: 'disorder',
    parentConceptId: '362969004',
    isPrimitive: false,
    icd10Mapping: 'E03.9',
  },
  {
    conceptId: '55822004',
    fullySpecifiedName: 'Hyperlipidemia (disorder)',
    preferredTerm: 'Hyperlipidemia',
    semanticTag: 'disorder',
    parentConceptId: '370992007',
    isPrimitive: false,
    icd10Mapping: 'E78.5',
  },
  {
    conceptId: '238136002',
    fullySpecifiedName: 'Morbid obesity (disorder)',
    preferredTerm: 'Morbid obesity',
    semanticTag: 'disorder',
    parentConceptId: '414916001',
    isPrimitive: false,
    icd10Mapping: 'E66.01',
  },

  // Respiratory Disorders
  {
    conceptId: '195951007',
    fullySpecifiedName: 'Acute exacerbation of chronic obstructive pulmonary disease (disorder)',
    preferredTerm: 'Acute exacerbation of COPD',
    semanticTag: 'disorder',
    parentConceptId: '13645005',
    isPrimitive: false,
    icd10Mapping: 'J44.1',
  },
  {
    conceptId: '195967001',
    fullySpecifiedName: 'Asthma (disorder)',
    preferredTerm: 'Asthma',
    semanticTag: 'disorder',
    parentConceptId: '195951007',
    isPrimitive: false,
    icd10Mapping: 'J45.909',
  },
  {
    conceptId: '233604007',
    fullySpecifiedName: 'Pneumonia (disorder)',
    preferredTerm: 'Pneumonia',
    semanticTag: 'disorder',
    parentConceptId: '128601007',
    isPrimitive: false,
    icd10Mapping: 'J18.9',
  },

  // Renal & Genitourinary Disorders
  {
    conceptId: '14669001',
    fullySpecifiedName: 'Acute renal failure syndrome (disorder)',
    preferredTerm: 'Acute kidney injury',
    semanticTag: 'disorder',
    parentConceptId: '70650003',
    isPrimitive: false,
    icd10Mapping: 'N17.9',
  },
  {
    conceptId: '433144002',
    fullySpecifiedName: 'Chronic kidney disease stage 3 (disorder)',
    preferredTerm: 'Chronic kidney disease stage 3',
    semanticTag: 'disorder',
    parentConceptId: '709044004',
    isPrimitive: false,
    icd10Mapping: 'N18.30',
  },
  {
    conceptId: '431856006',
    fullySpecifiedName: 'Chronic kidney disease stage 4 (disorder)',
    preferredTerm: 'Chronic kidney disease stage 4',
    semanticTag: 'disorder',
    parentConceptId: '709044004',
    isPrimitive: false,
    icd10Mapping: 'N18.4',
  },
  {
    conceptId: '46177005',
    fullySpecifiedName: 'End stage renal disease (disorder)',
    preferredTerm: 'End stage renal disease',
    semanticTag: 'disorder',
    parentConceptId: '709044004',
    isPrimitive: false,
    icd10Mapping: 'N18.6',
  },

  // Infectious Disease
  {
    conceptId: '91302008',
    fullySpecifiedName: 'Sepsis (disorder)',
    preferredTerm: 'Sepsis',
    semanticTag: 'disorder',
    parentConceptId: '40733004',
    isPrimitive: false,
    icd10Mapping: 'A41.9',
  },
  {
    conceptId: '86406008',
    fullySpecifiedName: 'Human immunodeficiency virus infection (disorder)',
    preferredTerm: 'HIV infection',
    semanticTag: 'disorder',
    parentConceptId: '86406008',
    isPrimitive: false,
    icd10Mapping: 'B20',
  },
];

export class SnomedConceptService {
  /**
   * Look up SNOMED concept by ID or term
   */
  public static findConcept(query: string): SnomedConceptRecord | undefined {
    const q = query.toLowerCase().trim();
    return MASTER_SNOMED_CONCEPTS.find(
      (c) =>
        c.conceptId === query ||
        c.preferredTerm.toLowerCase().includes(q) ||
        c.fullySpecifiedName.toLowerCase().includes(q)
    );
  }
}
