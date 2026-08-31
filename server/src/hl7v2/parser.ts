/**
 * HL7 v2.5.1 Pipe-and-Hat Standard Message Parser
 * Decodes segments, fields, components, subcomponents, and escape sequences
 */

import type {
  MshSegment,
  PidSegment,
  Pv1Segment,
  ObrSegment,
  ObxSegment,
  Hl7ParsedMessage,
} from './types.ts';

export class Hl7Parser {
  /**
   * Parse an HL7 v2.x raw pipe-and-hat string into structured object
   */
  public static parse(rawMessage: string): Hl7ParsedMessage {
    const cleaned = rawMessage.trim().replace(/\r\n/g, '\r').replace(/\n/g, '\r');
    const segmentLines = cleaned.split('\r').filter((line) => line.trim().length > 0);

    if (segmentLines.length === 0) {
      throw new Error('HL7 Parsing Error: Empty message payload');
    }

    const firstLine = segmentLines[0];
    if (!firstLine.startsWith('MSH')) {
      throw new Error('HL7 Parsing Error: Message must begin with MSH segment');
    }

    const fieldSeparator = firstLine[3] || '|';
    const encodingChars = firstLine.substring(4, 8) || '^~\\&';
    const componentSeparator = encodingChars[0] || '^';
    const repetitionSeparator = encodingChars[1] || '~';
    const escapeChar = encodingChars[2] || '\\';
    const subcomponentSeparator = encodingChars[3] || '&';

    const segmentsMap: Record<string, string[][]> = {};
    let mshSegment: MshSegment | null = null;
    let pidSegment: PidSegment | undefined;
    let pv1Segment: Pv1Segment | undefined;
    let obrSegment: ObrSegment | undefined;
    const obxList: ObxSegment[] = [];

    for (const line of segmentLines) {
      const segName = line.substring(0, 3);
      let fields: string[];

      if (segName === 'MSH') {
        fields = [segName, fieldSeparator, ...line.substring(4).split(fieldSeparator)];
      } else {
        fields = line.split(fieldSeparator);
      }

      if (!segmentsMap[segName]) {
        segmentsMap[segName] = [];
      }
      segmentsMap[segName].push(fields);

      if (segName === 'MSH') {
        mshSegment = this.parseMsh(fields, componentSeparator);
      } else if (segName === 'PID') {
        pidSegment = this.parsePid(fields, componentSeparator, repetitionSeparator);
      } else if (segName === 'PV1') {
        pv1Segment = this.parsePv1(fields, componentSeparator);
      } else if (segName === 'OBR') {
        obrSegment = this.parseObr(fields, componentSeparator);
      } else if (segName === 'OBX') {
        obxList.push(this.parseObx(fields, componentSeparator));
      }
    }

    if (!mshSegment) {
      throw new Error('HL7 Parsing Error: MSH segment could not be parsed');
    }

    return {
      raw: rawMessage,
      msh: mshSegment,
      pid: pidSegment,
      pv1: pv1Segment,
      obr: obrSegment,
      obxList,
      segments: segmentsMap,
    };
  }

  private static parseMsh(fields: string[], compSep: string): MshSegment {
    const msgTypeParts = (fields[9] || '').split(compSep);

    return {
      fieldSeparator: fields[1] || '|',
      encodingCharacters: fields[2] || '^~\\&',
      sendingApplication: fields[3] || '',
      sendingFacility: fields[4] || '',
      receivingApplication: fields[5] || '',
      receivingFacility: fields[6] || '',
      messageDateTime: fields[7] || '',
      security: fields[8],
      messageType: {
        messageCode: msgTypeParts[0] || '',
        triggerEvent: msgTypeParts[1] || '',
        messageStructure: msgTypeParts[2] || `${msgTypeParts[0]}_${msgTypeParts[1]}`,
      },
      messageControlId: fields[10] || '',
      processingId: (fields[11] as any) || 'P',
      versionId: fields[12] || '2.5.1',
    };
  }

  private static parsePid(fields: string[], compSep: string, repSep: string): PidSegment {
    const rawIdentifiers = (fields[3] || '').split(repSep);
    const identifierList = rawIdentifiers.map((rawId) => {
      const parts = rawId.split(compSep);
      return {
        id: parts[0] || '',
        typeCode: parts[4] || 'MR',
        assigningAuthority: parts[3],
      };
    });

    const nameParts = (fields[5] || '').split(compSep);
    const addrParts = (fields[11] || '').split(compSep);

    return {
      setID: fields[1],
      patientId: fields[2] || identifierList[0]?.id || '',
      patientIdentifierList: identifierList,
      patientName: {
        familyName: nameParts[0] || '',
        givenName: nameParts[1] || '',
        middleName: nameParts[2],
        prefix: nameParts[5],
        suffix: nameParts[4],
      },
      dateTimeOfBirth: fields[7] || '',
      administrativeSex: (fields[8] as any) || 'U',
      patientAddress: [
        {
          streetAddress: addrParts[0] || '',
          city: addrParts[2] || '',
          stateOrProvince: addrParts[3] || '',
          zipOrPostalCode: addrParts[4] || '',
          country: addrParts[5] || 'USA',
        },
      ],
      phoneNumberHome: fields[13],
      phoneNumberBusiness: fields[14],
      primaryLanguage: fields[15],
      maritalStatus: fields[16],
      ssnNumber: fields[19],
    };
  }

  private static parsePv1(fields: string[], compSep: string): Pv1Segment {
    const locParts = (fields[3] || '').split(compSep);
    const docParts = (fields[7] || '').split(compSep);

    return {
      setID: fields[1],
      patientClass: (fields[2] as any) || 'O',
      assignedPatientLocation: {
        pointOfCare: locParts[0],
        room: locParts[1],
        bed: locParts[2],
        facility: locParts[3],
      },
      admissionType: fields[4] as any,
      attendingDoctor: docParts[0]
        ? {
            idNumber: docParts[0],
            familyName: docParts[1] || '',
            givenName: docParts[2] || '',
            prefix: docParts[5],
          }
        : undefined,
      hospitalService: fields[10],
      admitDateTime: fields[44] || '',
      dischargeDateTime: fields[45],
    };
  }

  private static parseObr(fields: string[], compSep: string): ObrSegment {
    const serviceParts = (fields[4] || '').split(compSep);
    const docParts = (fields[16] || '').split(compSep);

    return {
      setID: parseInt(fields[1] || '1', 10),
      placerOrderNumber: fields[2] || '',
      fillerOrderNumber: fields[3],
      universalServiceIdentifier: {
        identifier: serviceParts[0] || '',
        text: serviceParts[1] || '',
        nameOfCodingSystem: serviceParts[2] || 'LN',
      },
      priority: fields[5] as any,
      requestedDateTime: fields[6],
      observationDateTime: fields[7],
      specimenReceivedDateTime: fields[14],
      orderingProvider: docParts[0]
        ? {
            idNumber: docParts[0],
            familyName: docParts[1] || '',
            givenName: docParts[2] || '',
          }
        : undefined,
      resultStatus: (fields[25] as any) || 'F',
    };
  }

  private static parseObx(fields: string[], compSep: string): ObxSegment {
    const idParts = (fields[3] || '').split(compSep);
    const unitParts = (fields[6] || '').split(compSep);

    return {
      setID: parseInt(fields[1] || '1', 10),
      valueType: (fields[2] as any) || 'NM',
      observationIdentifier: {
        identifier: idParts[0] || '',
        text: idParts[1] || '',
        nameOfCodingSystem: idParts[2] || 'LN',
      },
      observationSubID: fields[4],
      observationValue: fields[5] || '',
      units: unitParts[0]
        ? {
            identifier: unitParts[0],
            text: unitParts[1] || unitParts[0],
            nameOfCodingSystem: unitParts[2],
          }
        : undefined,
      referencesRange: fields[7],
      abnormalFlags: fields[8] as any,
      observationResultStatus: (fields[11] as any) || 'F',
      dateTimeOfObservation: fields[14] || '',
    };
  }
}
