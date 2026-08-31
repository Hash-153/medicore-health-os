/**
 * RECIST 1.1 (Response Evaluation Criteria in Solid Tumors) Engine
 * Quantitative Tumor Burden Assessment & Oncologic Treatment Response Categorization
 */

export interface TumorLesion {
  lesionId: string;
  anatomicLocation: string; // e.g. "Right Hepatic Lobe Segment VII", "Left Upper Lobe Lung"
  isTargetLesion: boolean; // Max 5 total target lesions, max 2 per organ
  longestDiameterMm: number; // For non-nodal lesions
  shortAxisDiameterMm?: number; // For lymph nodes (pathologic if >= 15mm)
  notes?: string;
}

export interface RecistEvaluationInput {
  patientId: string;
  evaluationDate: string;
  timepoint: 'BASELINE' | 'FOLLOW_UP_CYCLE_2' | 'FOLLOW_UP_CYCLE_4' | 'FOLLOW_UP_CYCLE_6' | 'RESTAGING';
  baselineSumLongestDiametersMm?: number;
  nadirSumLongestDiametersMm?: number;
  currentLesions: TumorLesion[];
  hasUnequivocalNonTargetProgression: boolean;
  hasNewMetastaticLesions: boolean;
  newLesionsDescription?: string;
}

export interface RecistEvaluationResult {
  timepoint: string;
  targetLesionsCount: number;
  currentSumLongestDiametersMm: number;
  percentChangeFromBaseline?: number;
  percentChangeFromNadir?: number;
  targetLesionResponse: 'COMPLETE_RESPONSE' | 'PARTIAL_RESPONSE' | 'STABLE_DISEASE' | 'PROGRESSIVE_DISEASE' | 'NOT_EVALUABLE';
  overallRecistResponse: 'CR' | 'PR' | 'SD' | 'PD';
  clinicalInterpretation: string;
  actionableRecommendation: string;
}

export class RecistEngine {
  /**
   * Evaluate RECIST 1.1 Response for a CT / MRI restaging scan
   */
  public static evaluate(input: RecistEvaluationInput): RecistEvaluationResult {
    const targetLesions = input.currentLesions.filter((l) => l.isTargetLesion);
    const currentSld = targetLesions.reduce((acc, l) => {
      const dim = l.shortAxisDiameterMm !== undefined ? l.shortAxisDiameterMm : l.longestDiameterMm;
      return acc + dim;
    }, 0);

    if (input.timepoint === 'BASELINE') {
      return {
        timepoint: 'BASELINE',
        targetLesionsCount: targetLesions.length,
        currentSumLongestDiametersMm: currentSld,
        targetLesionResponse: 'NOT_EVALUABLE',
        overallRecistResponse: 'SD',
        clinicalInterpretation: `Baseline Tumor Burden Established. Sum of Longest Diameters (SLD) = ${currentSld} mm across ${targetLesions.length} target lesions.`,
        actionableRecommendation: 'Initiate planned cycle 1 systemic therapy. Schedule restaging CT at 6-8 weeks.',
      };
    }

    const baselineSld = input.baselineSumLongestDiametersMm || currentSld;
    const nadirSld = input.nadirSumLongestDiametersMm || baselineSld;

    const percentChangeBaseline = parseFloat((((currentSld - baselineSld) / baselineSld) * 100).toFixed(1));
    const percentChangeNadir = parseFloat((((currentSld - nadirSld) / nadirSld) * 100).toFixed(1));

    let targetResponse: 'COMPLETE_RESPONSE' | 'PARTIAL_RESPONSE' | 'STABLE_DISEASE' | 'PROGRESSIVE_DISEASE' = 'STABLE_DISEASE';

    if (currentSld === 0 && targetLesions.every((l) => (l.shortAxisDiameterMm || 0) < 10)) {
      targetResponse = 'COMPLETE_RESPONSE';
    } else if (percentChangeBaseline <= -30.0) {
      targetResponse = 'PARTIAL_RESPONSE';
    } else if (percentChangeNadir >= 20.0 && currentSld - nadirSld >= 5.0) {
      targetResponse = 'PROGRESSIVE_DISEASE';
    } else {
      targetResponse = 'STABLE_DISEASE';
    }

    // Determine Overall Response incorporating non-target and new lesions
    let overallResponse: 'CR' | 'PR' | 'SD' | 'PD' = 'SD';
    let interp = '';
    let recommendation = '';

    if (input.hasNewMetastaticLesions || input.hasUnequivocalNonTargetProgression) {
      overallResponse = 'PD';
      interp = `PROGRESSIVE DISEASE (PD) confirmed due to ${
        input.hasNewMetastaticLesions ? 'emergence of NEW metastatic lesions' : 'unequivocal non-target progression'
      }. Current target SLD: ${currentSld} mm (${percentChangeBaseline > 0 ? '+' : ''}${percentChangeBaseline}% from baseline).`;
      recommendation = 'Discontinue current regimen due to disease progression. Tumor board review for second-line systemic therapy or clinical trial enrolment.';
    } else if (targetResponse === 'COMPLETE_RESPONSE') {
      overallResponse = 'CR';
      interp = 'COMPLETE RESPONSE (CR): Disappearance of all target lesions and reduction in pathologic lymph nodes to <10 mm short axis.';
      recommendation = 'Continue maintenance therapy or surveillance protocol per disease guidelines.';
    } else if (targetResponse === 'PARTIAL_RESPONSE') {
      overallResponse = 'PR';
      interp = `PARTIAL RESPONSE (PR): >=30% decrease in target lesion SLD from baseline (${percentChangeBaseline}% reduction, current SLD ${currentSld} mm vs baseline ${baselineSld} mm).`;
      recommendation = 'Favorable therapeutic response. Continue current chemotherapy / immunotherapy protocol.';
    } else if (targetResponse === 'PROGRESSIVE_DISEASE') {
      overallResponse = 'PD';
      interp = `PROGRESSIVE DISEASE (PD): >=20% increase in target lesion SLD from nadir (${percentChangeNadir}% increase, current SLD ${currentSld} mm vs nadir ${nadirSld} mm).`;
      recommendation = 'Primary treatment failure. Restage brain and skeleton; transition to subsequent line of therapy.';
    } else {
      overallResponse = 'SD';
      interp = `STABLE DISEASE (SD): Insufficient shrinkage for PR (-30%) and insufficient growth for PD (+20%). Current SLD: ${currentSld} mm (${percentChangeBaseline}% from baseline).`;
      recommendation = 'Clinical benefit maintained. Proceed with next scheduled cycle of therapy.';
    }

    return {
      timepoint: input.timepoint,
      targetLesionsCount: targetLesions.length,
      currentSumLongestDiametersMm: currentSld,
      percentChangeFromBaseline: percentChangeBaseline,
      percentChangeFromNadir: percentChangeNadir,
      targetLesionResponse: targetResponse,
      overallRecistResponse: overallResponse,
      clinicalInterpretation: interp,
      actionableRecommendation: recommendation,
    };
  }
}
