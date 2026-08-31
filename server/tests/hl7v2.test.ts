import test from 'node:test';
import assert from 'node:assert/strict';
import { Hl7Parser } from '../src/hl7v2/parser.ts';
import { Hl7Generator } from '../src/hl7v2/generator.ts';
import { SEED_PATIENTS, SEED_ENCOUNTERS, SEED_LAB_ORDERS } from '../src/database/seeds.ts';

test('HL7 v2.5.1 - ADT^A01 Patient Admission Generation and Parsing', () => {
  const patient = SEED_PATIENTS[0];
  const encounter = SEED_ENCOUNTERS[0];

  const rawHl7 = Hl7Generator.generateAdtA01(patient, encounter);
  assert.ok(rawHl7.startsWith('MSH|^~\\&|MEDICORE_EHR'));
  assert.ok(rawHl7.includes('ADT^A01^ADT_A01'));
  assert.ok(rawHl7.includes(patient.mrn));

  // Parse back
  const parsed = Hl7Parser.parse(rawHl7);
  assert.equal(parsed.msh.messageType.messageCode, 'ADT');
  assert.equal(parsed.msh.messageType.triggerEvent, 'A01');
  assert.equal(parsed.pid?.patientName.givenName, 'Eleanor');
  assert.equal(parsed.pid?.administrativeSex, 'F');
  assert.equal(parsed.pv1?.patientClass, 'O');
});

test('HL7 v2.5.1 - ORU^R01 Lab Results Generation & Parsing', () => {
  const patient = SEED_PATIENTS[0];
  const labOrder = SEED_LAB_ORDERS[0]; // CMP panel

  const rawOru = Hl7Generator.generateOruR01(patient, labOrder);
  assert.ok(rawOru.includes('ORU^R01^ORU_R01'));
  assert.ok(rawOru.includes('OBR|1|'));
  assert.ok(rawOru.includes('OBX|1|NM|'));

  const parsed = Hl7Parser.parse(rawOru);
  assert.equal(parsed.msh.messageType.messageCode, 'ORU');
  assert.equal(parsed.obxList.length, labOrder.tests.length);
  assert.equal(parsed.obxList[0].observationIdentifier.identifier, '2345-7'); // Glucose LOINC
});

test('HL7 v2.5.1 - MLLP Framing and ACK Generation', () => {
  const rawMsg = 'MSH|^~\\&|APP|FAC|||20260828||ADT^A01|MSG-999|P|2.5.1\rPID|1||123\r';
  const mllpPacket = Hl7Generator.wrapMllp(rawMsg);

  assert.equal(mllpPacket.startsWith('\x0B'), true);
  assert.equal(mllpPacket.endsWith('\x1C\x0D'), true);

  const unwrapped = Hl7Generator.unwrapMllp(mllpPacket);
  assert.equal(unwrapped, rawMsg);

  const ack = Hl7Generator.generateAck(
    {
      messageControlId: 'MSG-999',
      sendingApplication: 'APP',
      sendingFacility: 'FAC',
    },
    'AA',
    'Admit message processed'
  );

  assert.ok(ack.includes('MSA|AA|MSG-999|Admit message processed'));
});
