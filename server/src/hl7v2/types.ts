/**
 * HL7 v2.5.1 Standard Message Structure & Segment Definitions
 * Minimal Lower Layer Protocol (MLLP) Framing and Segment Types
 */

export interface MshSegment {
  fieldSeparator: string;
  encodingCharacters: string;
  sendingApplication: string;
  sendingFacility: string;
  receivingApplication: string;
  receivingFacility: string;
  messageDateTime: string;
  security?: string;
  messageType: {
    messageCode: string; // e.g. ADT, ORU, ORM, RDE
    triggerEvent: string; // e.g. A01, A03, R01, O01
    messageStructure: string;
  };
  messageControlId: string;
  processingId: 'P' | 'T' | 'D'; // Production, Test, Debug
  versionId: string; // '2.5.1'
}

export interface PidSegment {
  setID?: string;
  patientId: string;
  patientIdentifierList: Array<{
    id: string;
    typeCode: string; // e.g. 'MR' for Medical Record Number, 'SS' for SSN
    assigningAuthority?: string;
  }>;
  patientName: {
    familyName: string;
    givenName: string;
    middleName?: string;
    prefix?: string;
    suffix?: string;
  };
  dateTimeOfBirth: string; // YYYYMMDD
  administrativeSex: 'M' | 'F' | 'O' | 'U';
  patientAddress: Array<{
    streetAddress: string;
    city: string;
    stateOrProvince: string;
    zipOrPostalCode: string;
    country: string;
  }>;
  phoneNumberHome?: string;
  phoneNumberBusiness?: string;
  primaryLanguage?: string;
  maritalStatus?: string;
  ssnNumber?: string;
}

export interface Pv1Segment {
  setID?: string;
  patientClass: 'I' | 'O' | 'E' | 'P'; // Inpatient, Outpatient, Emergency, Preadmit
  assignedPatientLocation?: {
    pointOfCare?: string; // Ward / Unit (e.g. 4-ICU)
    room?: string; // e.g. 402
    bed?: string; // e.g. B-01
    facility?: string;
  };
  admissionType?: 'E' | 'U' | 'R' | 'N'; // Emergency, Urgent, Routine, Newborn
  attendingDoctor?: {
    idNumber: string;
    familyName: string;
    givenName: string;
    prefix?: string;
  };
  hospitalService?: string; // CARDIOLOGY, SURGERY, etc.
  admitDateTime: string;
  dischargeDateTime?: string;
}

export interface ObxSegment {
  setID: number;
  valueType: 'NM' | 'ST' | 'TX' | 'CE' | 'CWE'; // Numeric, String, Text, Coded Entry
  observationIdentifier: {
    identifier: string; // LOINC code
    text: string;
    nameOfCodingSystem: string; // 'LN'
  };
  observationSubID?: string;
  observationValue: string | number;
  units?: {
    identifier: string;
    text: string;
    nameOfCodingSystem?: string;
  };
  referencesRange?: string;
  abnormalFlags?: 'L' | 'H' | 'LL' | 'HH' | '<' | '>' | 'N' | 'A' | 'AA'; // Low, High, Panic Low, Panic High, etc.
  probability?: number;
  natureOfAbnormalTest?: string;
  observationResultStatus: 'F' | 'P' | 'C' | 'D' | 'X'; // Final, Preliminary, Corrected, Deleted, Cannot obtain
  dateTimeOfObservation: string;
}

export interface ObrSegment {
  setID: number;
  placerOrderNumber: string;
  fillerOrderNumber?: string;
  universalServiceIdentifier: {
    identifier: string;
    text: string;
    nameOfCodingSystem: string;
  };
  priority?: 'STAT' | 'ROUTINE' | 'URGENT';
  requestedDateTime?: string;
  observationDateTime?: string;
  specimenReceivedDateTime?: string;
  orderingProvider?: {
    idNumber: string;
    familyName: string;
    givenName: string;
  };
  resultStatus: 'F' | 'P' | 'C' | 'A';
}

export interface Hl7ParsedMessage {
  raw: string;
  msh: MshSegment;
  pid?: PidSegment;
  pv1?: Pv1Segment;
  obr?: ObrSegment;
  obxList: ObxSegment[];
  segments: Record<string, string[][]>;
}
