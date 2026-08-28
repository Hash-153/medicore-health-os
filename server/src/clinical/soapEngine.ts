/**
 * SOAP Clinical Note Engine
 * Handles Subjective, Objective, Assessment, and Plan structured charting
 */

export interface SoapNoteInput {
  patientId: string;
  encounterId: string;
  authorId: string;
  authorName: string;
  subjective: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    reviewOfSystems: Record<string, string>;
    pastMedicalHistory?: string[];
  };
  objective: {
    vitalSignsSummary: string;
    physicalExamination: Record<string, string>; // e.g. HEENT, CVS, Resp, Abd, Neuro
    diagnosticResultsSummary?: string;
  };
  assessment: {
    primaryDiagnosis: {
      code: string; // ICD-10
      description: string;
    };
    differentialDiagnoses: Array<{
      code: string;
      description: string;
      probability: 'HIGH' | 'MODERATE' | 'LOW';
    }>;
    clinicalImpression: string;
  };
  plan: {
    medicationsOrdered: string[];
    labsOrdered: string[];
    imagingOrdered: string[];
    patientInstructions: string;
    followUpInDays: number;
    disposition: 'DISCHARGED' | 'ADMITTED' | 'TRANSFERRED' | 'PENDING_RESULTS';
  };
}

export interface FormattedSoapNote {
  id: string;
  createdAt: string;
  formattedText: string;
  structured: SoapNoteInput;
  summary: string;
}

export class SoapNoteEngine {
  /**
   * Validate and assemble a structured SOAP note with formatted clinical narrative
   */
  public static processNote(input: SoapNoteInput): FormattedSoapNote {
    const id = `SOAP-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const peNarrative = Object.entries(input.objective.physicalExamination)
      .map(([system, findings]) => `  - ${system.toUpperCase()}: ${findings}`)
      .join('\n');

    const diffNarrative = input.assessment.differentialDiagnoses
      .map((d) => `  - [${d.code}] ${d.description} (${d.probability} likelihood)`)
      .join('\n');

    const formattedText = `
================================================================================
CLINICAL PROGRESS NOTE (SOAP FORMAT)
Patient ID: ${input.patientId} | Encounter: ${input.encounterId}
Author: ${input.authorName} | Date: ${createdAt}
================================================================================

[SUBJECTIVE]
Chief Complaint:
  ${input.subjective.chiefComplaint}

History of Present Illness (HPI):
  ${input.subjective.historyOfPresentIllness}

[OBJECTIVE]
Vital Signs:
  ${input.objective.vitalSignsSummary}

Physical Examination:
${peNarrative || '  - Unremarkable exam'}

Diagnostic / Laboratory Findings:
  ${input.objective.diagnosticResultsSummary || 'Pending laboratory results.'}

[ASSESSMENT]
Primary Diagnosis:
  [${input.assessment.primaryDiagnosis.code}] ${input.assessment.primaryDiagnosis.description}

Differential Diagnoses:
${diffNarrative || '  - None documented'}

Clinical Impression & Synthesis:
  ${input.assessment.clinicalImpression}

[PLAN]
Medications & Therapeutics:
  ${input.plan.medicationsOrdered.length > 0 ? input.plan.medicationsOrdered.join(', ') : 'No new medications.'}

Diagnostic Workup Ordered:
  Labs: ${input.plan.labsOrdered.join(', ') || 'None'}
  Imaging: ${input.plan.imagingOrdered.join(', ') || 'None'}

Patient Instructions:
  ${input.plan.patientInstructions}

Disposition & Follow-up:
  Disposition: ${input.plan.disposition}
  Follow-up: In ${input.plan.followUpInDays} days
================================================================================
`.trim();

    const summary = `${input.assessment.primaryDiagnosis.description} (${input.assessment.primaryDiagnosis.code}) - ${input.plan.disposition}, follow up in ${input.plan.followUpInDays} days.`;

    return {
      id,
      createdAt,
      formattedText,
      structured: input,
      summary,
    };
  }
}
