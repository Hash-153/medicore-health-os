/**
 * FHIR R4 Conformance & Structural Validator
 */

import type { FhirResourceType } from './types.ts';

export interface FhirValidationResult {
  valid: boolean;
  resourceType: string;
  errors: string[];
  warnings: string[];
}

export class FhirValidator {
  private static requiredFieldsByResource: Record<FhirResourceType, string[]> = {
    Patient: ['resourceType', 'id'],
    Practitioner: ['resourceType', 'id'],
    Encounter: ['resourceType', 'id', 'status', 'class', 'subject'],
    Observation: ['resourceType', 'id', 'status', 'code', 'subject'],
    Condition: ['resourceType', 'id', 'code', 'subject'],
    MedicationRequest: ['resourceType', 'id', 'status', 'intent', 'medicationCodeableConcept', 'subject'],
    DiagnosticReport: ['resourceType', 'id', 'status', 'code', 'subject'],
    Specimen: ['resourceType', 'id'],
    CarePlan: ['resourceType', 'id', 'status', 'intent', 'subject'],
    AllergyIntolerance: ['resourceType', 'id', 'patient'],
    Immunization: ['resourceType', 'id', 'status', 'vaccineCode', 'patient'],
    Appointment: ['resourceType', 'id', 'status', 'participant'],
    Claim: ['resourceType', 'id', 'status', 'type', 'use', 'patient', 'provider'],
    Bundle: ['resourceType', 'type'],
  };

  /**
   * Validate a FHIR resource instance against core structure constraints
   */
  public static validate(resource: any): FhirValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!resource || typeof resource !== 'object') {
      return {
        valid: false,
        resourceType: 'Unknown',
        errors: ['Payload is not a valid JSON object.'],
        warnings: [],
      };
    }

    const type = resource.resourceType as FhirResourceType;
    if (!type) {
      return {
        valid: false,
        resourceType: 'Unknown',
        errors: ['Missing mandatory top-level "resourceType" field.'],
        warnings: [],
      };
    }

    const required = this.requiredFieldsByResource[type];
    if (!required) {
      warnings.push(`Resource type "${type}" is not in standard profile registry, performing basic structure check.`);
    } else {
      for (const field of required) {
        if (resource[field] === undefined || resource[field] === null || resource[field] === '') {
          errors.push(`Missing required FHIR attribute "${field}" on resource "${type}".`);
        }
      }
    }

    // Deep check references
    if (resource.subject && typeof resource.subject === 'object') {
      if (!resource.subject.reference) {
        errors.push('Subject reference is missing "reference" URI string.');
      }
    }

    return {
      valid: errors.length === 0,
      resourceType: type,
      errors,
      warnings,
    };
  }
}
