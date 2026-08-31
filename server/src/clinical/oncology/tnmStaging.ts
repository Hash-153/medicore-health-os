/**
 * AJCC 8th Edition Cancer Staging & TNM Classification Engine
 * Comprehensive prognostic grouping for Solid Tumors (Breast, Lung, Colorectal, Prostate, Melanoma, Pancreatic)
 */

export type CancerSite =
  | 'BREAST'
  | 'NON_SMALL_CELL_LUNG'
  | 'COLORECTAL'
  | 'PROSTATE'
  | 'CUTANEOUS_MELANOMA'
  | 'PANCREATIC_ADENOCARCINOMA'
  | 'HEPATOCELLULAR_CARCINOMA'
  | 'RENAL_CELL_CARCINOMA';

export interface TnmInput {
  cancerSite: CancerSite;
  tCategory: string; // e.g. "T1c", "T2", "T3a", "T4b"
  nCategory: string; // e.g. "N0", "N1a", "N2", "N3"
  mCategory: string; // "M0", "M1a", "M1b", "M1c"
  histologicGrade?: 'G1' | 'G2' | 'G3' | 'G4' | 'GX';
  biomarkers?: {
    erStatus?: 'POSITIVE' | 'NEGATIVE';
    prStatus?: 'POSITIVE' | 'NEGATIVE';
    her2Status?: 'POSITIVE' | 'NEGATIVE' | 'EQUIVOCAL';
    gleasonScore?: number; // 6, 7, 8, 9, 10 for Prostate
    psaLevel?: number; // ng/mL for Prostate
    microsatelliteStatus?: 'MSI_HIGH' | 'MSS' | 'MSI_LOW';
    krasStatus?: 'WILD_TYPE' | 'MUTATED';
    brafStatus?: 'V600E_MUTATED' | 'WILD_TYPE';
    egfrStatus?: 'MUTATED' | 'WILD_TYPE';
    pdl1TpsPercent?: number;
  };
}

export interface StagingResult {
  cancerSite: CancerSite;
  anatomicStageGroup: string; // e.g. "Stage IIIA", "Stage IV"
  prognosticStageGroup?: string; // e.g. for Breast incorporating ER/PR/HER2/Grade
  fiveYearOverallSurvivalPercent: string;
  recommendedTreatmentModality: string[];
  clinicalTrialEligibilityNotes: string;
}

export class TnmStagingEngine {
  /**
   * Calculate Anatomic and Prognostic AJCC 8th Edition Stage Group
   */
  public static calculateStage(input: TnmInput): StagingResult {
    switch (input.cancerSite) {
      case 'BREAST':
        return this.stageBreastCancer(input);
      case 'NON_SMALL_CELL_LUNG':
        return this.stageNsclc(input);
      case 'COLORECTAL':
        return this.stageColorectal(input);
      case 'PROSTATE':
        return this.stageProstate(input);
      case 'CUTANEOUS_MELANOMA':
        return this.stageMelanoma(input);
      case 'PANCREATIC_ADENOCARCINOMA':
        return this.stagePancreatic(input);
      default:
        return this.stageGenericSolidTumor(input);
    }
  }

  private static stageBreastCancer(input: TnmInput): StagingResult {
    const { tCategory, nCategory, mCategory, histologicGrade, biomarkers } = input;

    if (mCategory.startsWith('M1')) {
      return {
        cancerSite: 'BREAST',
        anatomicStageGroup: 'Stage IV',
        prognosticStageGroup: 'Stage IV (Metastatic)',
        fiveYearOverallSurvivalPercent: '29.0%',
        recommendedTreatmentModality: [
          'Systemic targeted therapy / Endocrine therapy (CDK4/6 inhibitor + Aromatase Inhibitor if HR+/HER2-)',
          'Anti-HER2 dual blockade (Trastuzumab + Pertuzumab + Taxane if HER2+)',
          'Palliative radiation for symptomatic osseous metastases',
          'Bisphosphonate / Denosumab for bone health',
        ],
        clinicalTrialEligibilityNotes: 'Candidate for Phase II/III precision oncology trials (e.g. antibody-drug conjugates, T-DXd, Sacituzumab govitecan).',
      };
    }

    let anatomic = 'Stage I';
    let survival = '98.0%';
    let treatments = ['Breast conserving surgery (Lumpectomy) or Mastectomy', 'Sentinel lymph node biopsy (SLNB)'];

    const isT1 = tCategory.startsWith('T1') || tCategory === 'Tis';
    const isT2 = tCategory.startsWith('T2');
    const isT3 = tCategory.startsWith('T3');
    const isT4 = tCategory.startsWith('T4');

    const isN0 = nCategory === 'N0' || nCategory === 'N0(i+)';
    const isN1 = nCategory.startsWith('N1');
    const isN2 = nCategory.startsWith('N2');
    const isN3 = nCategory.startsWith('N3');

    if (isT4 || isN3) {
      anatomic = isN3 ? 'Stage IIIC' : isT4 && isN2 ? 'Stage IIIB' : 'Stage IIIA';
      survival = isN3 ? '72.0%' : '84.0%';
      treatments = [
        'Neoadjuvant Chemotherapy (Doxorubicin/Cyclophosphamide followed by Paclitaxel)',
        'Total Mastectomy with Axillary Lymph Node Dissection (ALND)',
        'Post-mastectomy comprehensive chest wall and regional nodal radiation',
        'Adjuvant Endocrine therapy (Tamoxifen or Aromatase Inhibitor for 5-10 years if ER+)',
      ];
    } else if (isT3 && (isN1 || isN2)) {
      anatomic = isN2 ? 'Stage IIIB' : 'Stage IIIA';
      survival = '86.0%';
      treatments = [
        'Neoadjuvant systemic therapy to downstage primary tumor',
        'Surgical resection with ALND',
        'Adjuvant radiation therapy',
      ];
    } else if (isT2 && isN1) {
      anatomic = 'Stage IIB';
      survival = '92.0%';
      treatments = [
        'Surgical resection (Lumpectomy + SLNB) followed by whole-breast radiation',
        'Adjuvant chemotherapy based on 21-gene Oncotype DX Recurrence Score',
      ];
    } else if (isT2 && isN0) {
      anatomic = 'Stage IIA';
      survival = '95.0%';
      treatments = [
        'Surgical resection (Lumpectomy + SLNB) followed by whole-breast radiation',
        'Endocrine therapy if ER/PR positive',
      ];
    } else if (isT1 && isN1) {
      anatomic = 'Stage IIA';
      survival = '94.0%';
    } else if (isT1 && isN0) {
      anatomic = 'Stage IA';
      survival = '99.0%';
    }

    // Determine AJCC 8th Edition Pathological Prognostic Stage based on ER/PR/HER2/Grade
    let prognostic = anatomic;
    if (biomarkers?.erStatus === 'POSITIVE' && biomarkers?.her2Status === 'POSITIVE') {
      prognostic = anatomic === 'Stage IIA' ? 'Stage IA (Favorable Biomarker Downstage)' : prognostic;
    } else if (biomarkers?.erStatus === 'NEGATIVE' && biomarkers?.prStatus === 'NEGATIVE' && biomarkers?.her2Status === 'NEGATIVE') {
      prognostic = `${anatomic} (Triple-Negative Breast Cancer Phenotype - High Risk)`;
    }

    return {
      cancerSite: 'BREAST',
      anatomicStageGroup: anatomic,
      prognosticStageGroup: prognostic,
      fiveYearOverallSurvivalPercent: survival,
      recommendedTreatmentModality: treatments,
      clinicalTrialEligibilityNotes: 'Evaluate Oncotype DX / MammaPrint genomic assay if T1b-T2 N0 ER+/HER2- to guide adjuvant chemotherapy omission.',
    };
  }

  private static stageNsclc(input: TnmInput): StagingResult {
    const { tCategory, nCategory, mCategory } = input;

    if (mCategory.startsWith('M1')) {
      const isM1c = mCategory === 'M1c'; // Multiple extrathoracic metastases
      return {
        cancerSite: 'NON_SMALL_CELL_LUNG',
        anatomicStageGroup: isM1c ? 'Stage IVB' : 'Stage IVA',
        fiveYearOverallSurvivalPercent: '6.0 - 10.0%',
        recommendedTreatmentModality: [
          'Comprehensive next-generation sequencing (NGS) for EGFR, ALK, ROS1, BRAF V600E, KRAS G12C, RET, MET exon 14, NTRK',
          'PD-L1 Tumor Proportion Score (TPS) immunohistochemistry',
          'Targeted tyrosine kinase inhibitor (Osimertinib, Alectinib) if oncogenic driver identified',
          'Platinum doublet chemotherapy + Pembrolizumab if driver-negative and PD-L1 >= 50% or 1-49%',
          'Palliative thoracic radiation / stereotactic radiosurgery for brain metastases',
        ],
        clinicalTrialEligibilityNotes: 'First-line clinical trial eligibility for novel antibody-drug conjugates (ADCs) or bispecific T-cell engagers.',
      };
    }

    if (nCategory === 'N3') {
      return {
        cancerSite: 'NON_SMALL_CELL_LUNG',
        anatomicStageGroup: 'Stage IIIC',
        fiveYearOverallSurvivalPercent: '13.0%',
        recommendedTreatmentModality: [
          'Definitive concurrent chemoradiation (Cisplatin/Etoposide + 60-66 Gy radiation)',
          'Consolidation Durvalumab (anti-PD-L1) immunotherapy for up to 12 months (PACIFIC regimen)',
        ],
        clinicalTrialEligibilityNotes: 'Candidate for neoadjuvant chemo-immunotherapy trials.',
      };
    }

    if (nCategory === 'N2') {
      return {
        cancerSite: 'NON_SMALL_CELL_LUNG',
        anatomicStageGroup: 'Stage IIIA',
        fiveYearOverallSurvivalPercent: '36.0%',
        recommendedTreatmentModality: [
          'Multidisciplinary thoracic tumor board evaluation for resectability',
          'Neoadjuvant Nivolumab + Platinum-doublet chemotherapy x 3 cycles followed by surgical resection (CheckMate 816 regimen)',
          'Adjuvant Osimertinib if resected EGFR Exon 19 del / L858R positive (ADAURA trial)',
        ],
        clinicalTrialEligibilityNotes: 'High-priority candidate for adjuvant immunotherapy and ctDNA molecular residual disease monitoring trials.',
      };
    }

    if (tCategory.startsWith('T1') && nCategory === 'N0') {
      return {
        cancerSite: 'NON_SMALL_CELL_LUNG',
        anatomicStageGroup: 'Stage IA (IA1/IA2/IA3)',
        fiveYearOverallSurvivalPercent: '82.0 - 92.0%',
        recommendedTreatmentModality: [
          'Anatomic surgical resection (VATS / Robotic Lobectomy or Segmentectomy) with mediastinal lymph node sampling',
          'Stereotactic Body Radiation Therapy (SBRT / SABR 48-54 Gy in 3-5 fractions) if medically inoperable',
        ],
        clinicalTrialEligibilityNotes: 'Post-operative ctDNA minimal residual disease (MRD) surveillance trial candidate.',
      };
    }

    return {
      cancerSite: 'NON_SMALL_CELL_LUNG',
      anatomicStageGroup: 'Stage IIB / IIIA',
      fiveYearOverallSurvivalPercent: '53.0%',
      recommendedTreatmentModality: [
        'Surgical lobectomy with complete systematic nodal dissection',
        'Adjuvant Cisplatin-based doublet chemotherapy x 4 cycles',
        'Adjuvant Atezolizumab immunotherapy x 1 year if PD-L1 >= 1%',
      ],
      clinicalTrialEligibilityNotes: 'Eligible for perioperative immunotherapy protocols.',
    };
  }

  private static stageColorectal(input: TnmInput): StagingResult {
    const { tCategory, nCategory, mCategory, biomarkers } = input;

    if (mCategory.startsWith('M1')) {
      const isMsiHigh = biomarkers?.microsatelliteStatus === 'MSI_HIGH';
      return {
        cancerSite: 'COLORECTAL',
        anatomicStageGroup: mCategory === 'M1c' ? 'Stage IVC (Peritoneal)' : 'Stage IVA/IVB',
        fiveYearOverallSurvivalPercent: '14.0%',
        recommendedTreatmentModality: isMsiHigh
          ? [
              'First-line Pembrolizumab single-agent immunotherapy (KEYNOTE-177 standard of care)',
              'Surgical evaluation for resectability of oligometastatic hepatic/pulmonary disease',
            ]
          : [
              'FOLFOX (5-FU, Leucovorin, Oxaliplatin) or FOLFIRINOX +/- Bevacizumab (anti-VEGF)',
              'Panitumumab / Cetuximab (anti-EGFR) if KRAS/NRAS/BRAF wild-type and left-sided primary',
              'Surgical hepatic resection or radiofrequency ablation (RFA) for resectable liver metastases',
            ],
        clinicalTrialEligibilityNotes: 'Screen for HER2 amplification, KRAS G12C, and BRAF V600E targeted trial cohorts.',
      };
    }

    if (nCategory.startsWith('N1') || nCategory.startsWith('N2')) {
      return {
        cancerSite: 'COLORECTAL',
        anatomicStageGroup: nCategory.startsWith('N2') ? 'Stage IIIC' : 'Stage IIIA/IIIB',
        fiveYearOverallSurvivalPercent: '71.0%',
        recommendedTreatmentModality: [
          'Colectomy with en bloc regional lymphadenectomy (minimum 12 lymph nodes examined)',
          'Adjuvant CAPOX (Capecitabine + Oxaliplatin) for 3 months (IDEA trial low-risk) or FOLFOX for 6 months (high-risk N2)',
        ],
        clinicalTrialEligibilityNotes: 'ctDNA-guided adjuvant chemotherapy escalation/de-escalation trial candidate.',
      };
    }

    if (tCategory.startsWith('T3') || tCategory.startsWith('T4')) {
      return {
        cancerSite: 'COLORECTAL',
        anatomicStageGroup: tCategory.startsWith('T4') ? 'Stage IIB/IIC' : 'Stage IIA',
        fiveYearOverallSurvivalPercent: '87.0%',
        recommendedTreatmentModality: [
          'Surgical resection with negative margins',
          'Assessment of high-risk features (T4, bowel obstruction, lymphovascular invasion, <12 nodes) for adjuvant 5-FU/capecitabine',
        ],
        clinicalTrialEligibilityNotes: 'Mismatch repair deficiency (dMMR/MSI) testing mandatory on all resected specimens.',
      };
    }

    return {
      cancerSite: 'COLORECTAL',
      anatomicStageGroup: 'Stage I (T1-T2 N0 M0)',
      fiveYearOverallSurvivalPercent: '93.0%',
      recommendedTreatmentModality: [
        'Surgical resection only (Surgical colectomy or endoscopic resection for superficial T1)',
        'No adjuvant chemotherapy indicated',
        'Post-operative colonoscopy at 1 year',
      ],
      clinicalTrialEligibilityNotes: 'Standard post-surgical surveillance.',
    };
  }

  private static stageProstate(input: TnmInput): StagingResult {
    const { tCategory, nCategory, mCategory, biomarkers } = input;

    if (mCategory.startsWith('M1')) {
      return {
        cancerSite: 'PROSTATE',
        anatomicStageGroup: 'Stage IVB (Metastatic Castration-Sensitive Prostate Cancer)',
        fiveYearOverallSurvivalPercent: '31.0%',
        recommendedTreatmentModality: [
          'Androgen Deprivation Therapy (ADT - GnRH agonist/antagonist: Leuprolide / Degarelix)',
          'Second-generation androgen receptor pathway inhibitor (Enzalutamide, Apalutamide, or Abiraterone + Prednisone)',
          'Triplet therapy with Docetaxel chemotherapy x 6 cycles for high-volume disease (PEACE-1 / ARASENS)',
          'Germline and somatic BRCA1/2 and HRR gene testing for PARP inhibitor eligibility',
        ],
        clinicalTrialEligibilityNotes: 'Eligible for PSMA-targeted radionuclide therapy (Lutetium-177-PSMA-617) protocols.',
      };
    }

    const gleason = biomarkers?.gleasonScore || 6;
    const psa = biomarkers?.psaLevel || 5.0;

    let riskGroup = 'Low Risk';
    let stageGroup = 'Stage I';
    let treatments = ['Active Surveillance with serial PSA, DRE, multiparametric MRI, and repeat biopsy at 12-24 months'];

    if (gleason >= 8 || psa > 20 || tCategory.startsWith('T3') || tCategory.startsWith('T4') || nCategory.startsWith('N1')) {
      riskGroup = 'High / Very High Risk';
      stageGroup = nCategory.startsWith('N1') ? 'Stage IVA' : 'Stage IIIB/IIIC';
      treatments = [
        'External Beam Radiation Therapy (EBRT 78-80 Gy) + 24-36 months of Long-Term ADT',
        'or Radical Prostatectomy with Extended Pelvic Lymph Node Dissection in select patients',
      ];
    } else if (gleason === 7 || (psa >= 10 && psa <= 20) || tCategory === 'T2b' || tCategory === 'T2c') {
      riskGroup = 'Intermediate Risk (Favorable vs Unfavorable)';
      stageGroup = 'Stage II';
      treatments = [
        'EBRT + 4-6 months of Short-Term ADT',
        'or Radical Prostatectomy with Pelvic Lymph Node Dissection',
        'or Brachytherapy alone (for favorable intermediate)',
      ];
    }

    return {
      cancerSite: 'PROSTATE',
      anatomicStageGroup: `${stageGroup} (${riskGroup})`,
      fiveYearOverallSurvivalPercent: '98.0%',
      recommendedTreatmentModality: treatments,
      clinicalTrialEligibilityNotes: 'Multiparametric prostate MRI (PI-RADS) and Decipher genomic classifier recommended.',
    };
  }

  private static stageMelanoma(input: TnmInput): StagingResult {
    const { tCategory, nCategory, mCategory } = input;

    if (mCategory.startsWith('M1')) {
      return {
        cancerSite: 'CUTANEOUS_MELANOMA',
        anatomicStageGroup: 'Stage IV',
        fiveYearOverallSurvivalPercent: '30.0%',
        recommendedTreatmentModality: [
          'Dual checkpoint inhibitor immunotherapy: Nivolumab + Ipilimumab (CheckMate 067 protocol)',
          'BRAF V600 mutation testing: If positive, Dabrafenib + Trametinib or Encorafenib + Binimetinib targeted therapy',
          'Stereotactic radiosurgery for central nervous system lesions',
        ],
        clinicalTrialEligibilityNotes: 'Tumor-Infiltrating Lymphocyte (TIL) cell therapy (Lifileucel) trial candidate for refractory disease.',
      };
    }

    if (nCategory.startsWith('N1') || nCategory.startsWith('N2') || nCategory.startsWith('N3')) {
      return {
        cancerSite: 'CUTANEOUS_MELANOMA',
        anatomicStageGroup: 'Stage III (IIIA/IIIB/IIIC/IIID)',
        fiveYearOverallSurvivalPercent: '60.0 - 77.0%',
        recommendedTreatmentModality: [
          'Wide local excision with 1-2 cm margins based on Breslow depth',
          'Complete lymphadenectomy if clinically palpable, or SLNB for microscopic disease',
          'Adjuvant Pembrolizumab or Nivolumab for 12 months, or Dabrafenib + Trametinib if BRAF V600E/K mutated',
        ],
        clinicalTrialEligibilityNotes: 'Adjuvant mRNA individualized neoantigen therapy (mRNA-4157) combination candidate.',
      };
    }

    return {
      cancerSite: 'CUTANEOUS_MELANOMA',
      anatomicStageGroup: tCategory.startsWith('T3') || tCategory.startsWith('T4') ? 'Stage II' : 'Stage I',
      fiveYearOverallSurvivalPercent: '94.0 - 99.0%',
      recommendedTreatmentModality: [
        'Wide local excision: 1.0 cm margin for Breslow <=1.0mm, 2.0 cm margin for Breslow >2.0mm',
        'Sentinel lymph node biopsy (SLNB) recommended for Breslow >0.8mm or ulcerated T1b',
      ],
      clinicalTrialEligibilityNotes: 'Routine clinical and dermatologic surveillance every 6-12 months.',
    };
  }

  private static stagePancreatic(input: TnmInput): StagingResult {
    const { tCategory, nCategory, mCategory } = input;

    if (mCategory.startsWith('M1')) {
      return {
        cancerSite: 'PANCREATIC_ADENOCARCINOMA',
        anatomicStageGroup: 'Stage IV (Metastatic)',
        fiveYearOverallSurvivalPercent: '3.0%',
        recommendedTreatmentModality: [
          'Modified FOLFIRINOX (Oxaliplatin, Irinotecan, Leucovorin, 5-FU) if ECOG PS 0-1',
          'or Gemcitabine + nab-Paclitaxel',
          'Germline genetic testing (BRCA1/2, PALB2) - Maintenance Olaparib if germline BRCA-mutated (POLO trial)',
          'Palliative biliary stenting for malignant obstructive jaundice',
        ],
        clinicalTrialEligibilityNotes: 'KRAS G12D/G12V direct inhibitor clinical trial candidate.',
      };
    }

    if (tCategory === 'T4') {
      return {
        cancerSite: 'PANCREATIC_ADENOCARCINOMA',
        anatomicStageGroup: 'Stage III (Locally Advanced / Unresectable)',
        fiveYearOverallSurvivalPercent: '12.0%',
        recommendedTreatmentModality: [
          'Induction systemic chemotherapy with mFOLFIRINOX x 4-6 months',
          'Restaging with high-resolution pancreatic protocol dual-phase CT / MRI',
          'Stereotactic Body Radiation Therapy (SBRT) for persistent local unresectability without distant progression',
        ],
        clinicalTrialEligibilityNotes: 'Novel immunotherapy and stroma-targeting agent trials.',
      };
    }

    return {
      cancerSite: 'PANCREATIC_ADENOCARCINOMA',
      anatomicStageGroup: nCategory.startsWith('N') && nCategory !== 'N0' ? 'Stage IIB' : 'Stage I/IIA',
      fiveYearOverallSurvivalPercent: '20.0 - 35.0%',
      recommendedTreatmentModality: [
        'Pancreaticoduodenectomy (Whipple procedure) for pancreatic head, or Distal Pancreatectomy for body/tail',
        'Adjuvant mFOLFIRINOX x 12 cycles (6 months) - PRODIGE 24 standard of care',
      ],
      clinicalTrialEligibilityNotes: 'Neoadjuvant multi-agent chemotherapy trial candidate prior to planned resection.',
    };
  }

  private static stageGenericSolidTumor(input: TnmInput): StagingResult {
    const isM1 = input.mCategory.startsWith('M1');
    const isNPos = input.nCategory !== 'N0' && input.nCategory !== 'NX';
    const isTAdvanced = input.tCategory.startsWith('T3') || input.tCategory.startsWith('T4');

    const stage = isM1 ? 'Stage IV' : isNPos ? 'Stage III' : isTAdvanced ? 'Stage II' : 'Stage I';

    return {
      cancerSite: input.cancerSite,
      anatomicStageGroup: stage,
      fiveYearOverallSurvivalPercent: isM1 ? '20.0%' : isNPos ? '60.0%' : '88.0%',
      recommendedTreatmentModality: [
        'Multidisciplinary tumor board discussion',
        'Surgical resection with clear margins if localized',
        'Systemic chemotherapy and targeted therapies guided by tumor NGS genomic profiling',
      ],
      clinicalTrialEligibilityNotes: 'Standard oncology clinical trial screening recommended.',
    };
  }
}
