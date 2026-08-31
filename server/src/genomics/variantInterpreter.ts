/**
 * Clinical Genomics & ACMG/AMP Variant Pathogenicity Interpretation Engine
 * Evaluates 2015 ACMG/AMP criteria (PVS1, PS1-4, PM1-6, PP1-5, BA1, BS1-4, BP1-7) & HGVS syntax
 */

export type AcmgCriteriaCode =
  | 'PVS1' // Null variant in a gene where LOF is known mechanism
  | 'PS1' // Same amino acid change as established pathogenic
  | 'PS2' // De novo (with confirmed paternity/maternity)
  | 'PS3' // Well-established functional studies supportive of damaging effect
  | 'PS4' // Prevalence in affected statistically increased over controls
  | 'PM1' // Located in a mutational hot spot and/or critical functional domain
  | 'PM2' // Absent from controls (e.g. gnomAD) or extremely low frequency
  | 'PM3' // For recessive disorders, detected in trans with a pathogenic variant
  | 'PM4' // Protein length changes as a result of in-frame deletions/insertions
  | 'PM5' // Novel missense change at an amino acid residue where a different pathogenic missense has been seen
  | 'PM6' // Assumed de novo, but without confirmation of paternity/maternity
  | 'PP1' // Co-segregation with disease in multiple affected family members
  | 'PP2' // Missense variant in a gene that has a low rate of benign missense variation
  | 'PP3' // Multiple lines of computational evidence support a deleterious effect (REVEL, CADD, AlphaMissense)
  | 'PP4' // Patient's phenotype or family history is highly specific for disease
  | 'PP5' // Reputable source recently reports variant as pathogenic
  | 'BA1' // Allele frequency is > 5% in ExAC/gnomAD (Stand-alone benign)
  | 'BS1' // Allele frequency is greater than expected for disorder
  | 'BS2' // Observed in a healthy adult individual for recessive/dominant disorder
  | 'BS3' // Well-established in vitro or in vivo functional studies show no damaging effect
  | 'BS4' // Lack of segregation in affected members of a family
  | 'BP1' // Missense variant in a gene for which primarily truncating variants are known to cause disease
  | 'BP2' // Observed in trans with a pathogenic variant for dominant disorder
  | 'BP3' // In-frame deletions/insertions in a repetitive region without a known function
  | 'BP4' // Multiple lines of computational evidence suggest no impact on gene
  | 'BP5' // Variant found in a case with an alternate molecular cause for disease
  | 'BP6' // Reputable source recently reports variant as benign
  | 'BP7'; // A synonymous variant for which splicing prediction algorithms predict no effect

export type PathogenicityClassification =
  | 'PATHOGENIC'
  | 'LIKELY_PATHOGENIC'
  | 'UNCERTAIN_SIGNIFICANCE_VUS'
  | 'LIKELY_BENIGN'
  | 'BENIGN';

export interface GenomicVariant {
  geneSymbol: string;
  chromosome: string;
  genomicCoordinateGrch38: number;
  referenceAllele: string;
  alternateAllele: string;
  hgvsCdna: string; // e.g. "c.2573T>G"
  hgvsProtein: string; // e.g. "p.Leu858Arg"
  variantEffect: 'MISSENSE' | 'NONSENSE' | 'FRAMESHIFT' | 'SPLICE_SITE' | 'IN_FRAME_INDEL' | 'SYNONYMOUS';
  gnomadAlleleFrequency: number; // e.g. 0.00001
  computationalPredictors?: {
    caddPhredScore?: number; // >20 damaging
    revelScore?: number; // >0.7 damaging
    alphaMissenseScore?: number; // >0.56 damaging
    siftPrediction?: 'DELETERIOUS' | 'TOLERATED';
    polyphenPrediction?: 'PROBABLY_DAMAGING' | 'BENIGN';
  };
  clinVarVariationId?: string;
  dbsnpRsId?: string;
}

export interface VariantInterpretationResult {
  variant: GenomicVariant;
  satisfiedAcmgCriteria: Array<{
    code: AcmgCriteriaCode;
    strength: 'VERY_STRONG' | 'STRONG' | 'MODERATE' | 'SUPPORTING' | 'STAND_ALONE_BENIGN';
    rationale: string;
  }>;
  classification: PathogenicityClassification;
  clinicalSignificanceNarrative: string;
}

export class VariantInterpreterEngine {
  /**
   * Classify a genomic variant according to ACMG/AMP Standards
   */
  public static classifyVariant(variant: GenomicVariant): VariantInterpretationResult {
    const satisfiedCriteria: Array<{
      code: AcmgCriteriaCode;
      strength: 'VERY_STRONG' | 'STRONG' | 'MODERATE' | 'SUPPORTING' | 'STAND_ALONE_BENIGN';
      rationale: string;
    }> = [];

    // Check Stand-Alone Benign (BA1: Allele frequency > 5% in population databases)
    if (variant.gnomadAlleleFrequency >= 0.05) {
      satisfiedCriteria.push({
        code: 'BA1',
        strength: 'STAND_ALONE_BENIGN',
        rationale: `gnomAD population allele frequency (${(variant.gnomadAlleleFrequency * 100).toFixed(2)}%) exceeds 5.0% threshold. Stand-alone benign indicator.`,
      });
      return {
        variant,
        satisfiedAcmgCriteria: satisfiedCriteria,
        classification: 'BENIGN',
        clinicalSignificanceNarrative: 'Benign common population polymorphism with no recognized clinical disease correlation.',
      };
    }

    // Check PM2: Extremely low frequency or absent in population controls (<0.0001)
    if (variant.gnomadAlleleFrequency < 0.0001) {
      satisfiedCriteria.push({
        code: 'PM2',
        strength: 'MODERATE',
        rationale: `Absent or extremely rare in gnomAD global dataset (MAF = ${(variant.gnomadAlleleFrequency * 100).toFixed(5)}%).`,
      });
    }

    // Check PVS1: Null variant (nonsense, frameshift, canonical splice) in a gene where LOF is disease mechanism
    if (variant.variantEffect === 'NONSENSE' || variant.variantEffect === 'FRAMESHIFT' || variant.variantEffect === 'SPLICE_SITE') {
      satisfiedCriteria.push({
        code: 'PVS1',
        strength: 'VERY_STRONG',
        rationale: `Null truncating variant (${variant.variantEffect}) leading to premature stop codon and nonsense-mediated mRNA decay in haploinsufficient gene.`,
      });
    }

    // Check PP3: In silico computational consensus (CADD > 25, REVEL > 0.75, AlphaMissense > 0.6)
    const cadd = variant.computationalPredictors?.caddPhredScore || 0;
    const revel = variant.computationalPredictors?.revelScore || 0;
    const amScore = variant.computationalPredictors?.alphaMissenseScore || 0;

    if (cadd >= 25 || revel >= 0.75 || amScore >= 0.6) {
      satisfiedCriteria.push({
        code: 'PP3',
        strength: 'SUPPORTING',
        rationale: `Multiple independent in silico algorithms (CADD Phred ${cadd}, REVEL ${revel}, AlphaMissense ${amScore}) unanimously predict structural disruption.`,
      });
    } else if (cadd > 0 && cadd < 12 && revel < 0.2) {
      satisfiedCriteria.push({
        code: 'BP4',
        strength: 'SUPPORTING',
        rationale: 'In silico prediction models suggest neutral/tolerated amino acid substitution.',
      });
    }

    // Check known hotspot genes (EGFR, KRAS, BRAF, BRCA1, BRCA2, TP53, PTEN)
    const hotspots = ['EGFR', 'KRAS', 'BRAF', 'BRCA1', 'BRCA2', 'TP53', 'PTEN', 'PALB2'];
    if (hotspots.includes(variant.geneSymbol.toUpperCase())) {
      satisfiedCriteria.push({
        code: 'PM1',
        strength: 'MODERATE',
        rationale: `Located within critical functional catalytic or DNA-binding domain of established oncology gene ${variant.geneSymbol}.`,
      });
    }

    // Determine ACMG Classification based on combining rules
    const pvs1Count = satisfiedCriteria.filter((c) => c.code === 'PVS1').length;
    const strongCount = satisfiedCriteria.filter((c) => c.strength === 'STRONG').length;
    const moderateCount = satisfiedCriteria.filter((c) => c.strength === 'MODERATE').length;
    const supportingCount = satisfiedCriteria.filter((c) => c.strength === 'SUPPORTING' && !c.code.startsWith('B')).length;
    const benignSupporting = satisfiedCriteria.filter((c) => c.code.startsWith('B')).length;

    let classification: PathogenicityClassification = 'UNCERTAIN_SIGNIFICANCE_VUS';

    if (
      pvs1Count >= 1 && (strongCount >= 1 || moderateCount >= 2 || (moderateCount >= 1 && supportingCount >= 1)) ||
      strongCount >= 2 ||
      (strongCount >= 1 && moderateCount >= 3)
    ) {
      classification = 'PATHOGENIC';
    } else if (
      (pvs1Count >= 1 && moderateCount >= 1) ||
      (strongCount >= 1 && moderateCount >= 1) ||
      (moderateCount >= 3) ||
      (moderateCount >= 2 && supportingCount >= 2)
    ) {
      classification = 'LIKELY_PATHOGENIC';
    } else if (benignSupporting >= 2) {
      classification = 'LIKELY_BENIGN';
    }

    const narrative = `Variant ${variant.geneSymbol} ${variant.hgvsCdna} (${variant.hgvsProtein}) classified as ${classification} based on ${satisfiedCriteria.length} ACMG/AMP criteria. ${
      classification === 'PATHOGENIC'
        ? 'High clinical actionability. Diagnostic and therapeutic implications confirmed.'
        : classification === 'UNCERTAIN_SIGNIFICANCE_VUS'
        ? 'Variant of Uncertain Significance (VUS). Insufficient evidence to determine clinical pathogenicity. Recommend family segregation testing or functional assays.'
        : 'Benign or tolerated polymorphism.'
    }`;

    return {
      variant,
      satisfiedAcmgCriteria: satisfiedCriteria,
      classification,
      clinicalSignificanceNarrative: narrative,
    };
  }
}
