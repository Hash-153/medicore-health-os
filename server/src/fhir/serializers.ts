/**
 * FHIR R4 Serializers & Transformers
 * Maps between MediCore domain models and HL7 FHIR R4 JSON payloads
 */

import type {
  FhirPatient,
  FhirObservation,
  FhirCondition,
  FhirMedicationRequest,
  FhirDiagnosticReport,
  FhirBundle,
} from './types.ts';

export class FhirSerializer {
  /**
   * Convert internal patient model to FHIR R4 Patient
   */
  public static toFhirPatient(patient: any): FhirPatient {
    const [firstName, ...lastNames] = (patient.fullName || patient.name || '').split(' ');
    const lastName = lastNames.join(' ');

    return {
      resourceType: 'Patient',
      id: patient.id,
      meta: {
        lastUpdated: patient.updatedAt || new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient'],
      },
      identifier: [
        {
          use: 'official',
          system: 'urn:medicore:mrn',
          value: patient.mrn,
        },
      ],
      active: patient.status !== 'INACTIVE',
      name: [
        {
          use: 'official',
          family: lastName || 'Doe',
          given: [firstName || 'John'],
          text: patient.fullName || `${firstName} ${lastName}`,
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: patient.phone || '',
          use: 'mobile',
        },
        {
          system: 'email',
          value: patient.email || '',
          use: 'home',
        },
      ],
      gender: (patient.gender?.toLowerCase() as any) || 'unknown',
      birthDate: patient.dob,
      address: [
        {
          use: 'home',
          line: patient.address?.street ? [patient.address.street] : [],
          city: patient.address?.city,
          state: patient.address?.state,
          postalCode: patient.address?.zip,
          country: patient.address?.country || 'USA',
        },
      ],
    };
  }

  /**
   * Convert vital sign / lab observation to FHIR R4 Observation
   */
  public static toFhirObservation(obs: any): FhirObservation {
    return {
      resourceType: 'Observation',
      id: obs.id,
      meta: {
        lastUpdated: obs.recordedAt || new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Observation'],
      },
      status: obs.status === 'FINAL' ? 'final' : 'preliminary',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: obs.category === 'VITAL_SIGNS' ? 'vital-signs' : 'laboratory',
              display: obs.category === 'VITAL_SIGNS' ? 'Vital Signs' : 'Laboratory',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: obs.loincCode ? 'http://loinc.org' : 'urn:medicore:codes',
            code: obs.loincCode || obs.code,
            display: obs.name || obs.testName,
          },
        ],
        text: obs.name || obs.testName,
      },
      subject: {
        reference: `Patient/${obs.patientId}`,
        display: obs.patientName,
      },
      encounter: obs.encounterId
        ? {
            reference: `Encounter/${obs.encounterId}`,
          }
        : undefined,
      effectiveDateTime: obs.effectiveDateTime || obs.recordedAt || new Date().toISOString(),
      valueQuantity:
        obs.valueNumeric !== undefined
          ? {
              value: obs.valueNumeric,
              unit: obs.unit,
              system: 'http://unitsofmeasure.org',
              code: obs.unit,
            }
          : undefined,
      valueString: obs.valueString,
      interpretation: obs.interpretation
        ? [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
                  code: obs.interpretation,
                  display: obs.interpretation,
                },
              ],
            },
          ]
        : undefined,
      referenceRange:
        obs.referenceRangeLow !== undefined || obs.referenceRangeHigh !== undefined
          ? [
              {
                low: obs.referenceRangeLow !== undefined ? { value: obs.referenceRangeLow, unit: obs.unit } : undefined,
                high: obs.referenceRangeHigh !== undefined ? { value: obs.referenceRangeHigh, unit: obs.unit } : undefined,
              },
            ]
          : undefined,
    };
  }

  /**
   * Convert prescription record to FHIR R4 MedicationRequest
   */
  public static toFhirMedicationRequest(rx: any): FhirMedicationRequest {
    return {
      resourceType: 'MedicationRequest',
      id: rx.id,
      meta: {
        lastUpdated: rx.updatedAt || new Date().toISOString(),
      },
      status: rx.status === 'ACTIVE' ? 'active' : rx.status === 'COMPLETED' ? 'completed' : 'draft',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: rx.rxNormCode || rx.medicationCode,
            display: rx.medicationName,
          },
        ],
        text: `${rx.medicationName} ${rx.dosage}`,
      },
      subject: {
        reference: `Patient/${rx.patientId}`,
      },
      authoredOn: rx.prescribedAt || new Date().toISOString(),
      requester: {
        reference: `Practitioner/${rx.prescribedById}`,
        display: rx.prescribedByName,
      },
      dosageInstruction: [
        {
          text: rx.instructions || `${rx.dosage} ${rx.frequency}, ${rx.route}`,
          route: {
            text: rx.route || 'Oral',
          },
        },
      ],
      dispenseRequest: {
        numberOfRepeatsAllowed: rx.refillsAllowed || 0,
        quantity: {
          value: rx.quantity || 30,
          unit: 'tablets',
        },
      },
    };
  }

  /**
   * Bundle a collection of resources into a FHIR R4 SearchSet Bundle
   */
  public static toBundle(resources: any[], total?: number): FhirBundle {
    return {
      resourceType: 'Bundle',
      id: `BUNDLE-${Date.now()}`,
      type: 'searchset',
      total: total !== undefined ? total : resources.length,
      entry: resources.map((r) => ({
        fullUrl: `urn:medicore:${r.resourceType}/${r.id}`,
        resource: r,
      })),
    };
  }
}
