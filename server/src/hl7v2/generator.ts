/**
 * HL7 v2.5.1 Message Generator & MLLP Framing Engine
 * Assembles standard clinical messages (ADT, ORU, ORM, ACK) with MLLP byte enveloping
 */

import type { PatientRecord, VitalSignRecord, LabOrderRecord, ClinicalEncounter } from '../database/types.ts';

export class Hl7Generator {
  private static MLLP_START = '\x0B'; // 0x0B Vertical Tab
  private static MLLP_END = '\x1C\x0D'; // 0x1C File Separator + 0x0D CR

  /**
   * Envelop raw HL7 message in MLLP transport framing
   */
  public static wrapMllp(hl7Text: string): string {
    return `${this.MLLP_START}${hl7Text}${this.MLLP_END}`;
  }

  /**
   * Strip MLLP framing bytes from a raw transport packet
   */
  public static unwrapMllp(mllpPacket: string): string {
    return mllpPacket.replace(/^\x0B/, '').replace(/\x1C\x0D$/, '');
  }

  /**
   * Format current or given timestamp as HL7 TS format (YYYYMMDDHHMMSS)
   */
  private static formatTimestamp(dateStr?: string): string {
    const d = dateStr ? new Date(dateStr) : new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  }

  /**
   * Generate ADT^A01 (Admit / Visit Notification)
   */
  public static generateAdtA01(patient: PatientRecord, encounter: ClinicalEncounter): string {
    const timestamp = this.formatTimestamp(encounter.startTime);
    const controlId = `MSG-ADT-${Date.now()}`;
    const [givenName, ...familyNames] = patient.fullName.split(' ');
    const familyName = familyNames.join(' ') || givenName;
    const dob = patient.dob.replace(/-/g, '');
    const sex = patient.gender === 'MALE' ? 'M' : patient.gender === 'FEMALE' ? 'F' : 'O';

    const msh = `MSH|^~\\&|MEDICORE_EHR|MEDICORE_HOSPITAL|CENTRAL_PACS|REGISTRATION|${timestamp}||ADT^A01^ADT_A01|${controlId}|P|2.5.1`;
    const evn = `EVN|A01|${timestamp}|||DOC-101^Mitchell^Sarah^^^^MD`;
    const pid = `PID|1||${patient.id}^^^MEDICORE^MR~${patient.mrn}^^^HOSPITAL^MR||${familyName}^${givenName}||${dob}|${sex}|||${patient.address?.street || '100 Medical Blvd'}^^${patient.address?.city || 'Healthcare City'}^${patient.address?.state || 'CA'}^${patient.address?.zip || '90210'}^USA||${patient.phone}|||${patient.preferredLanguage || 'English'}|${patient.maritalStatus || 'M'}|||${patient.ssnMasked}`;
    const pv1 = `PV1|1|${encounter.encounterType === 'INPATIENT' ? 'I' : encounter.encounterType === 'EMERGENCY' ? 'E' : 'O'}|4-MED^402^B-01^MEDICORE||||DOC-101^Mitchell^Sarah^^^^MD||||||||||||${encounter.id}|||||||||||||||||||||||||${timestamp}`;

    return [msh, evn, pid, pv1].join('\r') + '\r';
  }

  /**
   * Generate ORU^R01 (Unsolicited Observation / Lab Results Message)
   */
  public static generateOruR01(patient: PatientRecord, labOrder: LabOrderRecord): string {
    const timestamp = this.formatTimestamp(labOrder.updatedAt || labOrder.orderedAt);
    const controlId = `MSG-ORU-${Date.now()}`;
    const [givenName, ...familyNames] = patient.fullName.split(' ');
    const familyName = familyNames.join(' ') || givenName;
    const dob = patient.dob.replace(/-/g, '');
    const sex = patient.gender === 'MALE' ? 'M' : patient.gender === 'FEMALE' ? 'F' : 'O';

    const msh = `MSH|^~\\&|MEDICORE_LIMS|LABORATORY_CORE|MEDICORE_EHR|CLINICAL_STATION|${timestamp}||ORU^R01^ORU_R01|${controlId}|P|2.5.1`;
    const pid = `PID|1||${patient.id}^^^MEDICORE^MR~${patient.mrn}^^^HOSPITAL^MR||${familyName}^${givenName}||${dob}|${sex}`;
    const obr = `OBR|1|${labOrder.id}|${labOrder.specimenBarcode}|LAB-PANEL^${labOrder.panelName}^LN|||${timestamp}|||||||||DOC-101^Mitchell^Sarah|||||||${timestamp}|||${labOrder.status === 'FINALIZED' ? 'F' : 'P'}`;

    const obxLines = labOrder.tests.map((test, index) => {
      const abnormalFlag = test.isCriticalAlert
        ? 'HH'
        : test.interpretation === 'HIGH'
        ? 'H'
        : test.interpretation === 'LOW'
        ? 'L'
        : 'N';
      const refRange =
        test.referenceRangeLow !== undefined && test.referenceRangeHigh !== undefined
          ? `${test.referenceRangeLow}-${test.referenceRangeHigh}`
          : '';

      return `OBX|${index + 1}|NM|${test.loincCode || test.testCode}^${test.testName}^LN||${test.resultValue ?? 'PENDING'}|${test.resultUnit || ''}|${refRange}|${abnormalFlag}|||${labOrder.status === 'FINALIZED' ? 'F' : 'P'}|||${timestamp}`;
    });

    return [msh, pid, obr, ...obxLines].join('\r') + '\r';
  }

  /**
   * Generate General Acknowledgement (ACK)
   */
  public static generateAck(
    incomingMsh: {
      messageControlId: string;
      sendingApplication: string;
      sendingFacility: string;
    },
    ackCode: 'AA' | 'AE' | 'AR' = 'AA',
    textMessage: string = 'Message accepted successfully'
  ): string {
    const timestamp = this.formatTimestamp();
    const controlId = `ACK-${Date.now()}`;

    const msh = `MSH|^~\\&|MEDICORE_EHR|MEDICORE_HOSPITAL|${incomingMsh.sendingApplication}|${incomingMsh.sendingFacility}|${timestamp}||ACK|${controlId}|P|2.5.1`;
    const msa = `MSA|${ackCode}|${incomingMsh.messageControlId}|${textMessage}`;

    return [msh, msa].join('\r') + '\r';
  }
}
