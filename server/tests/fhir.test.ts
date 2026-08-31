import test from 'node:test';
import assert from 'node:assert/strict';
import { FhirSerializer } from '../src/fhir/serializers.ts';
import { FhirValidator } from '../src/fhir/validators.ts';

test('HL7 FHIR R4 - Patient Serialization & Validation', () => {
  const internalPatient = {
    id: 'PAT-100',
    mrn: 'MRN-123456',
    fullName: 'Jane Elizabeth Doe',
    dob: '1984-07-22',
    gender: 'FEMALE',
    phone: '(555) 123-4567',
    email: 'jane.doe@example.com',
    address: {
      street: '100 Main Street',
      city: 'Boston',
      state: 'MA',
      zip: '02110',
      country: 'USA',
    },
    status: 'ACTIVE',
  };

  const fhirPatient = FhirSerializer.toFhirPatient(internalPatient);

  assert.equal(fhirPatient.resourceType, 'Patient');
  assert.equal(fhirPatient.id, 'PAT-100');
  assert.equal(fhirPatient.gender, 'female');
  assert.equal(fhirPatient.birthDate, '1984-07-22');
  assert.equal(fhirPatient.name?.[0].family, 'Elizabeth Doe');
  assert.equal(fhirPatient.identifier?.[0].value, 'MRN-123456');

  // Validate conformance
  const validation = FhirValidator.validate(fhirPatient);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
});

test('HL7 FHIR R4 - Observation Serialization & Validation', () => {
  const internalObs = {
    id: 'OBS-001',
    patientId: 'PAT-100',
    patientName: 'Jane Elizabeth Doe',
    category: 'VITAL_SIGNS',
    code: '8867-4',
    loincCode: '8867-4',
    name: 'Heart rate',
    valueNumeric: 72,
    unit: 'beats/minute',
    status: 'FINAL',
    referenceRangeLow: 60,
    referenceRangeHigh: 100,
    interpretation: 'NORMAL',
  };

  const fhirObs = FhirSerializer.toFhirObservation(internalObs);

  assert.equal(fhirObs.resourceType, 'Observation');
  assert.equal(fhirObs.id, 'OBS-001');
  assert.equal(fhirObs.valueQuantity?.value, 72);
  assert.equal(fhirObs.valueQuantity?.unit, 'beats/minute');
  assert.equal(fhirObs.subject.reference, 'Patient/PAT-100');

  const validation = FhirValidator.validate(fhirObs);
  assert.equal(validation.valid, true);
  assert.equal(validation.errors.length, 0);
});
