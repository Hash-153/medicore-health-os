/**
 * DICOM Information Object Definition (IOD) & PACS Metadata Models
 * Digital Imaging and Communications in Medicine (DICOM PS 3.3 / PS 3.4)
 */

export type DicomModality = 'CT' | 'MR' | 'CR' | 'DX' | 'US' | 'NM' | 'PET' | 'XA';

export interface DicomInstance {
  sopInstanceUid: string;
  sopClassUid: string; // e.g. 1.2.840.10008.5.1.4.1.1.2 (CT Image Storage)
  instanceNumber: number;
  rows: number;
  columns: number;
  pixelSpacing: [number, number]; // mm per pixel [rowSpacing, colSpacing]
  sliceThickness?: number; // mm
  sliceLocation?: number;
  windowCenter: number; // Hounsfield Unit (HU)
  windowWidth: number; // Hounsfield Unit (HU)
  rescaleIntercept: number;
  rescaleSlope: number;
  acquisitionDateTime: string;
  imageUrl: string;
}

export interface DicomSeries {
  seriesInstanceUid: string;
  seriesNumber: number;
  modality: DicomModality;
  seriesDescription: string;
  bodyPartExamined: string;
  numberOfInstances: number;
  protocolName?: string;
  instances: DicomInstance[];
}

export interface DicomStudy {
  studyInstanceUid: string;
  patientId: string;
  patientName: string;
  patientBirthDate: string;
  patientSex: 'M' | 'F' | 'O';
  accessionNumber: string;
  studyDate: string; // YYYYMMDD
  studyTime: string; // HHMMSS
  studyDescription: string;
  referringPhysicianName: string;
  modalitiesInStudy: DicomModality[];
  numberOfSeries: number;
  numberOfInstances: number;
  series: DicomSeries[];
}

export interface ModalityWorklistItem {
  accessionNumber: string;
  requestedProcedureId: string;
  requestedProcedureDescription: string;
  scheduledProcedureStepId: string;
  scheduledProcedureStepStartDate: string;
  scheduledProcedureStepStartTime: string;
  modality: DicomModality;
  scheduledStationAeTitle: string;
  patientId: string;
  patientName: string;
  patientSex: 'M' | 'F' | 'O';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

export interface RadiologyStructuredReport {
  id: string;
  studyInstanceUid: string;
  accessionNumber: string;
  patientId: string;
  radiologistId: string;
  radiologistName: string;
  technique: string;
  comparisonStudies?: string;
  findings: string;
  impression: string;
  structuredClassification?: {
    system: 'BI-RADS' | 'LUNG-RADS' | 'TI-RADS' | 'PI-RADS' | 'RECIST';
    categoryScore: string; // e.g. "BI-RADS 2: Benign" or "Lung-RADS 1: Negative"
    actionRecommendation: string;
  };
  criticalAlertFlag: boolean;
  status: 'PRELIMINARY' | 'FINALIZED' | 'AMENDED';
  signedAt?: string;
}
