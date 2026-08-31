/**
 * National Institutes of Health Stroke Scale (NIHSS) & Acute Neurovascular Engine
 * Standardized 15-item acute stroke deficit quantification, LVO prediction & EVT eligibility
 */

export interface NihssExamInput {
  item1aLoc: 0 | 1 | 2 | 3; // 0 = alert, 1 = not alert but arousable, 2 = not alert/requires repeated stimuli, 3 = unresponsive/reflexive
  item1bLocQuestions: 0 | 1 | 2; // 0 = answers both correctly, 1 = answers 1 correctly, 2 = answers neither correctly
  item1cLocCommands: 0 | 1 | 2; // 0 = performs both tasks correctly, 1 = performs 1 task correctly, 2 = performs neither
  item2BestGaze: 0 | 1 | 2; // 0 = normal, 1 = partial gaze palsy, 2 = forced deviation / total gaze paresis
  item3VisualFields: 0 | 1 | 2 | 3; // 0 = no visual loss, 1 = partial hemianopia, 2 = complete hemianopia, 3 = bilateral hemianopia / cortical blindness
  item4FacialPalsy: 0 | 1 | 2 | 3; // 0 = normal symmetrical, 1 = minor paralysis (flattened nasolabial fold), 2 = partial paralysis (total lower face), 3 = complete paralysis
  item5aMotorLeftArm: 0 | 1 | 2 | 3 | 4; // 0 = no drift (10s), 1 = drift before 10s, 2 = some effort against gravity, 3 = no effort against gravity, 4 = no movement
  item5bMotorRightArm: 0 | 1 | 2 | 3 | 4;
  item6aMotorLeftLeg: 0 | 1 | 2 | 3 | 4; // 0 = no drift (5s), 1 = drift before 5s, 2 = some effort against gravity, 3 = no effort against gravity, 4 = no movement
  item6bMotorRightLeg: 0 | 1 | 2 | 3 | 4;
  item7LimbAtaxia: 0 | 1 | 2; // 0 = absent, 1 = present in 1 limb (finger-nose/heel-shin), 2 = present in 2 limbs
  item8Sensory: 0 | 1 | 2; // 0 = normal, 1 = mild-to-moderate sensory loss, 2 = severe or total sensory loss
  item9BestLanguage: 0 | 1 | 2 | 3; // 0 = no aphasia, 1 = mild-to-moderate aphasia, 2 = severe aphasia, 3 = mute / global aphasia
  item10Dysarthria: 0 | 1 | 2; // 0 = normal articulation, 1 = mild-to-moderate slurring, 2 = severe dysarthria / unintelligible
  item11ExtinctionInattention: 0 | 1 | 2; // 0 = no abnormality, 1 = visual/tactile/auditory/spatial neglect in 1 modality, 2 = profound hemi-inattention in multiple modalities
}

export interface NihssEvaluationResult {
  totalNihssScore: number;
  severityCategory: 'NO_STROKE_SYMPTOMS' | 'MINOR_STROKE' | 'MODERATE_STROKE' | 'MODERATE_TO_SEVERE_STROKE' | 'SEVERE_STROKE';
  isLargeVesselOcclusionLikely: boolean; // NIHSS >= 6 (or >= 10) predicts LVO with high sensitivity
  ivThrombolysisEligibilityGuideline: string;
  mechanicalThrombectomyEligibilityGuideline: string;
  prognosticFunctionalOutcome: string;
}

export class NihssEngine {
  /**
   * Calculate complete 15-item NIHSS score and clinical action pathways
   */
  public static evaluateNihss(input: NihssExamInput): NihssEvaluationResult {
    const total =
      input.item1aLoc +
      input.item1bLocQuestions +
      input.item1cLocCommands +
      input.item2BestGaze +
      input.item3VisualFields +
      input.item4FacialPalsy +
      input.item5aMotorLeftArm +
      input.item5bMotorRightArm +
      input.item6aMotorLeftLeg +
      input.item6bMotorRightLeg +
      input.item7LimbAtaxia +
      input.item8Sensory +
      input.item9BestLanguage +
      input.item10Dysarthria +
      input.item11ExtinctionInattention;

    let cat: NihssEvaluationResult['severityCategory'] = 'NO_STROKE_SYMPTOMS';
    if (total >= 21) cat = 'SEVERE_STROKE';
    else if (total >= 16) cat = 'MODERATE_TO_SEVERE_STROKE';
    else if (total >= 5) cat = 'MODERATE_STROKE';
    else if (total >= 1) cat = 'MINOR_STROKE';

    const isLvo = total >= 6;

    // IV Thrombolysis Guidance (0-4.5h window)
    let lyticsGuideline = '';
    if (total >= 25) {
      lyticsGuideline = 'VERY SEVERE STROKE (NIHSS >= 25): IV Thrombolytic therapy can be administered within 4.5h window, but carries higher risk of symptomatic intracranial hemorrhage (~8-10%). Monitor closely.';
    } else if (total >= 4) {
      lyticsGuideline = 'STANDARD THROMBOLYSIS ELIGIBLE (NIHSS 4-24): Administer IV Tenecteplase 0.25 mg/kg (or Alteplase 0.9 mg/kg) if within 4.5h of last known normal and no contraindications (platelets >= 100k, INR <= 1.7, no recent major surgery/hemorrhage, BP < 185/110).';
    } else {
      lyticsGuideline = 'MINOR / NON-DISABLING STROKE (NIHSS 1-3): Evaluate if deficit is disabling (e.g. complete hemianopsia, severe aphasia, isolated hand weakness). If non-disabling, Dual Antiplatelet Therapy (DAPT: Aspirin + Clopidogrel for 21 days) is preferred (POINT / CHANCE trials).';
    }

    // Mechanical Thrombectomy Guidance (0-24h window)
    let evtGuideline = '';
    if (isLvo) {
      evtGuideline = `HIGH PROBABILITY OF LARGE VESSEL OCCLUSION (NIHSS ${total} >= 6): Perform STAT CT Angiography (CTA Head & Neck). If occlusion in ICA or MCA-M1/M2 confirmed, patient is a candidate for Endovascular Mechanical Thrombectomy (EVT) within 6 hours of onset (or up to 24 hours if DAWN/DEFUSE-3 perfusion mismatch criteria met).`;
    } else {
      evtGuideline = 'Low probability of proximal large vessel occlusion. Obtain standard CTA to evaluate for distal intracranial branch stenosis or carotid atherosclerosis.';
    }

    // Prognosis
    let outcome = 'Favorable prognosis. Expected excellent functional independence (mRS 0-1) at 90 days with appropriate rehabilitation.';
    if (total >= 16) {
      outcome = 'Guarded prognosis. High risk of long-term disability, dysphagia, cerebral edema, and midline shift. Neuro-ICU admission indicated.';
    } else if (total >= 7) {
      outcome = 'Moderate deficit. Expected benefit from inpatient acute stroke rehabilitation and physical/occupational/speech therapy.';
    }

    return {
      totalNihssScore: total,
      severityCategory: cat,
      isLargeVesselOcclusionLikely: isLvo,
      ivThrombolysisEligibilityGuideline: lyticsGuideline,
      mechanicalThrombectomyEligibilityGuideline: evtGuideline,
      prognosticFunctionalOutcome: outcome,
    };
  }
}
