/**
 * HL7 FHIR R4 (Fast Healthcare Interoperability Resources) Standard Models
 * Specification reference: HL7 FHIR Release 4 (v4.0.1)
 */

export type FhirResourceType =
  | 'Patient'
  | 'Practitioner'
  | 'Encounter'
  | 'Observation'
  | 'Condition'
  | 'MedicationRequest'
  | 'DiagnosticReport'
  | 'Specimen'
  | 'CarePlan'
  | 'AllergyIntolerance'
  | 'Immunization'
  | 'Appointment'
  | 'Claim'
  | 'Bundle';

export interface FhirMeta {
  versionId?: string;
  lastUpdated?: string;
  profile?: string[];
}

export interface FhirIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary';
  system?: string;
  value: string;
}

export interface FhirHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FhirContactPoint {
  system?: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export interface FhirAddress {
  use?: 'home' | 'work' | 'temp' | 'old' | 'billing';
  line?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface FhirCodeableConcept {
  coding?: Array<{
    system?: string;
    version?: string;
    code?: string;
    display?: string;
  }>;
  text?: string;
}

export interface FhirReference {
  reference: string;
  type?: string;
  display?: string;
}

export interface FhirPeriod {
  start?: string;
  end?: string;
}

export interface FhirQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>';
  unit?: string;
  system?: string;
  code?: string;
}

// FHIR R4: Patient
export interface FhirPatient {
  resourceType: 'Patient';
  id: string;
  meta?: FhirMeta;
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: FhirContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  address?: FhirAddress[];
  maritalStatus?: FhirCodeableConcept;
  generalPractitioner?: FhirReference[];
}

// FHIR R4: Practitioner
export interface FhirPractitioner {
  resourceType: 'Practitioner';
  id: string;
  meta?: FhirMeta;
  identifier?: FhirIdentifier[];
  active?: boolean;
  name?: FhirHumanName[];
  telecom?: FhirContactPoint[];
  qualification?: Array<{
    code: FhirCodeableConcept;
    issuer?: FhirReference;
  }>;
}

// FHIR R4: Encounter
export interface FhirEncounter {
  resourceType: 'Encounter';
  id: string;
  meta?: FhirMeta;
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
  class: {
    system?: string;
    code: 'AMB' | 'EMER' | 'IMP' | 'VR' | 'OBSENC'; // Ambulatory, Emergency, Inpatient, Virtual, Observation
    display?: string;
  };
  subject: FhirReference; // Patient
  participant?: Array<{
    individual?: FhirReference;
  }>;
  period?: FhirPeriod;
  reasonCode?: FhirCodeableConcept[];
}

// FHIR R4: Observation (Vitals, Labs, Biometrics)
export interface FhirObservation {
  resourceType: 'Observation';
  id: string;
  meta?: FhirMeta;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled';
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference; // Patient
  encounter?: FhirReference;
  effectiveDateTime?: string;
  valueQuantity?: FhirQuantity;
  valueString?: string;
  interpretation?: FhirCodeableConcept[];
  referenceRange?: Array<{
    low?: FhirQuantity;
    high?: FhirQuantity;
    text?: string;
  }>;
}

// FHIR R4: Condition (Problem list, Diagnoses)
export interface FhirCondition {
  resourceType: 'Condition';
  id: string;
  meta?: FhirMeta;
  clinicalStatus?: FhirCodeableConcept;
  verificationStatus?: FhirCodeableConcept;
  category?: FhirCodeableConcept[];
  severity?: FhirCodeableConcept;
  code: FhirCodeableConcept;
  subject: FhirReference;
  encounter?: FhirReference;
  onsetDateTime?: string;
  recordedDate?: string;
}

// FHIR R4: MedicationRequest (e-Prescription)
export interface FhirMedicationRequest {
  resourceType: 'MedicationRequest';
  id: string;
  meta?: FhirMeta;
  status: 'active' | 'on-hold' | 'cancelled' | 'completed' | 'entered-in-error' | 'stopped' | 'draft';
  intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
  medicationCodeableConcept: FhirCodeableConcept;
  subject: FhirReference;
  encounter?: FhirReference;
  authoredOn?: string;
  requester?: FhirReference; // Practitioner
  dosageInstruction?: Array<{
    text?: string;
    timing?: {
      repeat?: {
        frequency?: number;
        period?: number;
        periodUnit?: 'd' | 'wk' | 'mo' | 'h';
      };
    };
    route?: FhirCodeableConcept;
    doseAndRate?: Array<{
      doseQuantity?: FhirQuantity;
    }>;
  }>;
  dispenseRequest?: {
    numberOfRepeatsAllowed?: number;
    quantity?: FhirQuantity;
    expectedSupplyDuration?: FhirQuantity;
  };
}

// FHIR R4: DiagnosticReport (LIMS Lab & Radiology results)
export interface FhirDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  meta?: FhirMeta;
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'appended' | 'cancelled';
  category?: FhirCodeableConcept[];
  code: FhirCodeableConcept;
  subject: FhirReference;
  encounter?: FhirReference;
  effectiveDateTime?: string;
  issued?: string;
  performer?: FhirReference[];
  result?: FhirReference[]; // References to Observations
  conclusion?: string;
}

// FHIR R4: Bundle
export interface FhirBundle {
  resourceType: 'Bundle';
  id: string;
  type: 'searchset' | 'transaction' | 'batch' | 'collection' | 'history';
  total?: number;
  entry?: Array<{
    fullUrl?: string;
    resource: any;
  }>;
}
