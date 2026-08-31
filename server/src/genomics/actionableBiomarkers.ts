/**
 * Actionable Cancer Biomarkers & Targeted Therapeutics Database
 * Matches Genomic Driver Alterations to FDA-Approved Precision Therapies & NCCN Guidelines
 */

export interface ActionableBiomarkerEntry {
  geneSymbol: string;
  alterationType: 'MUTATION' | 'AMPLIFICATION' | 'FUSION_TRANSLOCATION' | 'DELETION' | 'MICROSATELLITE_INSTABILITY';
  specificAlteration: string; // e.g. "L858R", "Exon 19 Deletion", "V600E", "EML4-ALK"
  cancerTypeIndications: string[];
  fdaApprovedTherapies: Array<{
    drugName: string;
    lineOfTherapy: 'FIRST_LINE' | 'SECOND_LINE' | 'SUBSEQUENT_LINE';
    clinicalTrialEvidence: string; // e.g. "FLAURA (Osimertinib vs Gefitinib/Erlotinib)"
  }>;
  knownResistanceMechanisms: string[];
  companionDiagnosticAssay: string;
}

export const ACTIONABLE_BIOMARKERS_CATALOG: ActionableBiomarkerEntry[] = [
  {
    geneSymbol: 'EGFR',
    alterationType: 'MUTATION',
    specificAlteration: 'L858R / Exon 19 Deletion (Classical Sensitizing)',
    cancerTypeIndications: ['Non-Small Cell Lung Cancer (NSCLC)'],
    fdaApprovedTherapies: [
      { drugName: 'Osimertinib (Tagrisso)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'FLAURA Trial (mPFS 18.9 mos vs 10.2 mos, OS benefit)' },
      { drugName: 'Afatinib', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'LUX-Lung 3' },
    ],
    knownResistanceMechanisms: ['EGFR C797S mutation', 'MET amplification', 'HER2 amplification', 'Small cell transformation'],
    companionDiagnosticAssay: 'cobas EGFR Mutation Test v2 / FoundationOne CDx NGS',
  },
  {
    geneSymbol: 'EGFR',
    alterationType: 'MUTATION',
    specificAlteration: 'T790M (Gatekeeper Resistance)',
    cancerTypeIndications: ['Non-Small Cell Lung Cancer (NSCLC)'],
    fdaApprovedTherapies: [
      { drugName: 'Osimertinib (Tagrisso)', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'AURA3 Trial (Post-1st/2nd Gen TKI progression)' },
    ],
    knownResistanceMechanisms: ['Tertiary C797S mutation (in cis vs in trans)'],
    companionDiagnosticAssay: 'Guardant360 ctDNA Liquid Biopsy / Tissue NGS',
  },
  {
    geneSymbol: 'KRAS',
    alterationType: 'MUTATION',
    specificAlteration: 'G12C',
    cancerTypeIndications: ['Non-Small Cell Lung Cancer (NSCLC)', 'Colorectal Cancer'],
    fdaApprovedTherapies: [
      { drugName: 'Sotorasib (Lumakras)', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'CodeBreaK 100 Trial' },
      { drugName: 'Adagrasib (Krazati)', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'KRYSTAL-1 Trial' },
    ],
    knownResistanceMechanisms: ['Secondary KRAS switch II pocket mutations (Y96D, A59S)', 'MET/EGFR bypass signaling'],
    companionDiagnosticAssay: 'FoundationOne CDx / Guardant360',
  },
  {
    geneSymbol: 'BRAF',
    alterationType: 'MUTATION',
    specificAlteration: 'V600E',
    cancerTypeIndications: ['Cutaneous Melanoma', 'Colorectal Cancer', 'Non-Small Cell Lung Cancer', 'Anaplastic Thyroid Cancer'],
    fdaApprovedTherapies: [
      { drugName: 'Dabrafenib + Trametinib (Tafinlar + Mekinist)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'COMBI-d / COMBI-v / BRF113928' },
      { drugName: 'Encorafenib + Cetuximab', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'BEACON CRC Trial (Colorectal)' },
    ],
    knownResistanceMechanisms: ['NRAS reactivation', 'MEK1/2 secondary mutations', 'PTEN loss'],
    companionDiagnosticAssay: 'THxID BRAF Kit / Next-Generation Sequencing',
  },
  {
    geneSymbol: 'ERBB2',
    alterationType: 'AMPLIFICATION',
    specificAlteration: 'HER2 Overexpression (IHC 3+ or FISH Amplified)',
    cancerTypeIndications: ['Breast Cancer', 'Gastric / Gastroesophageal Junction Adenocarcinoma', 'Colorectal Cancer'],
    fdaApprovedTherapies: [
      { drugName: 'Trastuzumab + Pertuzumab + Docetaxel', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'CLEOPATRA Trial (Breast)' },
      { drugName: 'Trastuzumab Deruxtecan (T-DXd / Enhertu)', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'DESTINY-Breast03 / DESTINY-Gastric01' },
      { drugName: 'Tucatinib + Trastuzumab + Capecitabine', lineOfTherapy: 'SUBSEQUENT_LINE', clinicalTrialEvidence: 'HER2CLIMB (Active brain metastases)' },
    ],
    knownResistanceMechanisms: ['p95HER2 truncated isoform', 'PIK3CA activating mutations', 'HER2 extracellular domain shedding'],
    companionDiagnosticAssay: 'HER2 IQFISH pharmDx / Ventana PATHWAY anti-HER2/neu (4B5)',
  },
  {
    geneSymbol: 'BRCA1',
    alterationType: 'MUTATION',
    specificAlteration: 'Pathogenic Germline or Somatic Loss-of-Function',
    cancerTypeIndications: ['Ovarian High-Grade Serous', 'Breast Cancer (HER2-negative)', 'Pancreatic Adenocarcinoma', 'Metastatic Castration-Resistant Prostate Cancer (mCRPC)'],
    fdaApprovedTherapies: [
      { drugName: 'Olaparib (Lynparza)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'SOLO-1 / OlympiAD / POLO / PROfound' },
      { drugName: 'Talazoparib (Talzenna)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'EMBRACA Trial' },
      { drugName: 'Rucaparib (Rubraca)', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'TRITON2 / ARIEL3' },
    ],
    knownResistanceMechanisms: ['BRCA1/2 secondary reversion mutations restoring open reading frame', 'Loss of 53BP1'],
    companionDiagnosticAssay: 'BRACAnalysis CDx / Myriad myChoice CDx HRD',
  },
  {
    geneSymbol: 'NTRK1',
    alterationType: 'FUSION_TRANSLOCATION',
    specificAlteration: 'NTRK1/NTRK2/NTRK3 Gene Fusions (Tumor-Agnostic)',
    cancerTypeIndications: ['Tissue-Agnostic Solid Tumors (Infantile Fibrosarcoma, Secretory Breast, Thyroid, Colon, Lung)'],
    fdaApprovedTherapies: [
      { drugName: 'Larotrectinib (Vitrakvi)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'NAVIGATE / SCOUT Basket Trials (ORR > 75%)' },
      { drugName: 'Entrectinib (Rozlytrek)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'STARTRK-2 Trial' },
    ],
    knownResistanceMechanisms: ['NTRK solvent-front mutations (TRKA G595R, TRKC G623R)', 'xDFG mutations'],
    companionDiagnosticAssay: 'Pan-TRK IHC Screen / RNA-based NGS fusion panel',
  },
  {
    geneSymbol: 'MSI',
    alterationType: 'MICROSATELLITE_INSTABILITY',
    specificAlteration: 'MSI-High / Mismatch Repair Deficient (dMMR: MLH1, MSH2, MSH6, PMS2)',
    cancerTypeIndications: ['Tissue-Agnostic Solid Tumors (Colorectal, Endometrial, Gastric, Small Bowel)'],
    fdaApprovedTherapies: [
      { drugName: 'Pembrolizumab (Keytruda)', lineOfTherapy: 'FIRST_LINE', clinicalTrialEvidence: 'KEYNOTE-177 / KEYNOTE-158 (FDA Tissue-Agnostic Approval)' },
      { drugName: 'Nivolumab + Ipilimumab', lineOfTherapy: 'SECOND_LINE', clinicalTrialEvidence: 'CheckMate 142' },
    ],
    knownResistanceMechanisms: ['B2M loss-of-function (impaired MHC-I presentation)', 'JAK1/JAK2 loss'],
    companionDiagnosticAssay: 'Promega MSI Analysis System / IHC for 4 MMR proteins',
  },
];

export class ActionableBiomarkerService {
  /**
   * Search actionable targeted therapy matching for a given gene and alteration
   */
  public static matchTherapies(gene: string, alteration: string): ActionableBiomarkerEntry | undefined {
    const geneUpper = gene.toUpperCase();
    return ACTIONABLE_BIOMARKERS_CATALOG.find(
      (b) =>
        b.geneSymbol === geneUpper ||
        b.specificAlteration.toLowerCase().includes(alteration.toLowerCase())
    );
  }
}
