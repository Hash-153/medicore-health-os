/**
 * DICOM PACS Imaging & Radiology Reporting Service
 * Manages DICOM Studies, Series, SOP Instances, Modality Worklist (MWL) and Structured Reports
 */

import type {
  DicomStudy,
  DicomSeries,
  DicomInstance,
  ModalityWorklistItem,
  RadiologyStructuredReport,
  DicomModality,
} from './types.ts';

export const SEED_DICOM_STUDIES: DicomStudy[] = [
  {
    studyInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1',
    patientId: 'PAT-001',
    patientName: 'Vance^Eleanor',
    patientBirthDate: '19680412',
    patientSex: 'F',
    accessionNumber: 'ACC-RAD-89102',
    studyDate: '20260825',
    studyTime: '094500',
    studyDescription: 'CT Chest Angiography with IV Contrast (PE Protocol)',
    referringPhysicianName: 'Mitchell^Sarah^MD',
    modalitiesInStudy: ['CT'],
    numberOfSeries: 3,
    numberOfInstances: 120,
    series: [
      {
        seriesInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1.1',
        seriesNumber: 1,
        modality: 'CT',
        seriesDescription: 'Scout Topogram 0.6mm',
        bodyPartExamined: 'CHEST',
        numberOfInstances: 2,
        instances: [
          {
            sopInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1.1.1',
            sopClassUid: '1.2.840.10008.5.1.4.1.1.2',
            instanceNumber: 1,
            rows: 512,
            columns: 512,
            pixelSpacing: [0.75, 0.75],
            sliceThickness: 5.0,
            windowCenter: 40,
            windowWidth: 400,
            rescaleIntercept: -1024,
            rescaleSlope: 1,
            acquisitionDateTime: '20260825094510',
            imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
      {
        seriesInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1.2',
        seriesNumber: 2,
        modality: 'CT',
        seriesDescription: 'Axial Angio 1.25mm Standard Recon',
        bodyPartExamined: 'CHEST',
        numberOfInstances: 60,
        instances: [
          {
            sopInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1.2.1',
            sopClassUid: '1.2.840.10008.5.1.4.1.1.2',
            instanceNumber: 1,
            rows: 512,
            columns: 512,
            pixelSpacing: [0.68, 0.68],
            sliceThickness: 1.25,
            windowCenter: 100,
            windowWidth: 700,
            rescaleIntercept: -1024,
            rescaleSlope: 1,
            acquisitionDateTime: '20260825094620',
            imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
      {
        seriesInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1.3',
        seriesNumber: 3,
        modality: 'CT',
        seriesDescription: 'Axial Lung Window High-Res 1.0mm',
        bodyPartExamined: 'CHEST',
        numberOfInstances: 58,
        instances: [
          {
            sopInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1.3.1',
            sopClassUid: '1.2.840.10008.5.1.4.1.1.2',
            instanceNumber: 1,
            rows: 512,
            columns: 512,
            pixelSpacing: [0.65, 0.65],
            sliceThickness: 1.0,
            windowCenter: -600,
            windowWidth: 1500,
            rescaleIntercept: -1024,
            rescaleSlope: 1,
            acquisitionDateTime: '20260825094700',
            imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    ],
  },
  {
    studyInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819202.2',
    patientId: 'PAT-002',
    patientName: 'Chen^Marcus',
    patientBirthDate: '19541103',
    patientSex: 'M',
    accessionNumber: 'ACC-RAD-89105',
    studyDate: '20260826',
    studyTime: '141000',
    studyDescription: 'Chest Radiograph 2-Views (PA and Lateral)',
    referringPhysicianName: 'Mitchell^Sarah^MD',
    modalitiesInStudy: ['DX'],
    numberOfSeries: 1,
    numberOfInstances: 2,
    series: [
      {
        seriesInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819202.2.1',
        seriesNumber: 1,
        modality: 'DX',
        seriesDescription: 'Digital Chest PA/LAT',
        bodyPartExamined: 'CHEST',
        numberOfInstances: 2,
        instances: [
          {
            sopInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819202.2.1.1',
            sopClassUid: '1.2.840.10008.5.1.4.1.1.1',
            instanceNumber: 1,
            rows: 2048,
            columns: 2048,
            pixelSpacing: [0.14, 0.14],
            windowCenter: 2048,
            windowWidth: 4096,
            rescaleIntercept: 0,
            rescaleSlope: 1,
            acquisitionDateTime: '20260826141022',
            imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          },
        ],
      },
    ],
  },
];

export const SEED_RADIOLOGY_REPORTS: RadiologyStructuredReport[] = [
  {
    id: 'REP-RAD-001',
    studyInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819201.1',
    accessionNumber: 'ACC-RAD-89102',
    patientId: 'PAT-001',
    radiologistId: 'RAD-301',
    radiologistName: 'Dr. Gregory House, MD (Diagnostic Radiology)',
    technique: 'Helical multidetector CT chest performed with 75mL Omnipaque 350 IV contrast timed for pulmonary arterial enhancement.',
    comparisonStudies: 'None available.',
    findings: 'No filling defect identified within the main, lobar, segmental, or subsegmental pulmonary arterial branches. Heart size is within normal limits without pericardial effusion. Lung parenchyma demonstrates clear bilateral lung fields with no focal consolidation, pneumothorax, or pleural effusion. Visualized upper abdomen is unremarkable.',
    impression: '1. Negative for acute pulmonary embolism.\n2. No acute cardiopulmonary abnormality.',
    structuredClassification: {
      system: 'LUNG-RADS',
      categoryScore: 'Lung-RADS 1: Negative',
      actionRecommendation: 'Continue routine age-appropriate screening as clinically indicated.',
    },
    criticalAlertFlag: false,
    status: 'FINALIZED',
    signedAt: '2026-08-25T10:30:00.000Z',
  },
];

export class RadiologyService {
  private static studies: DicomStudy[] = [...SEED_DICOM_STUDIES];
  private static reports: RadiologyStructuredReport[] = [...SEED_RADIOLOGY_REPORTS];

  /**
   * Query PACS studies by patient ID, accession number, or modality (C-FIND simulation)
   */
  public static queryStudies(filter?: {
    patientId?: string;
    accessionNumber?: string;
    modality?: DicomModality;
  }): DicomStudy[] {
    let results = this.studies;
    if (filter?.patientId) {
      results = results.filter((s) => s.patientId === filter.patientId);
    }
    if (filter?.accessionNumber) {
      results = results.filter((s) => s.accessionNumber.toLowerCase().includes(filter.accessionNumber!.toLowerCase()));
    }
    if (filter?.modality) {
      results = results.filter((s) => s.modalitiesInStudy.includes(filter.modality!));
    }
    return results;
  }

  /**
   * Retrieve a full DICOM study by StudyInstanceUID
   */
  public static getStudyByUid(studyInstanceUid: string): DicomStudy | undefined {
    return this.studies.find((s) => s.studyInstanceUid === studyInstanceUid);
  }

  /**
   * List or retrieve reports
   */
  public static getReportForStudy(studyInstanceUid: string): RadiologyStructuredReport | undefined {
    return this.reports.find((r) => r.studyInstanceUid === studyInstanceUid);
  }

  /**
   * Author & sign a new structured report
   */
  public static signReport(input: {
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
      categoryScore: string;
      actionRecommendation: string;
    };
    criticalAlertFlag?: boolean;
  }): RadiologyStructuredReport {
    const existingIndex = this.reports.findIndex((r) => r.studyInstanceUid === input.studyInstanceUid);

    const report: RadiologyStructuredReport = {
      id: existingIndex >= 0 ? this.reports[existingIndex].id : `REP-RAD-${Date.now()}`,
      studyInstanceUid: input.studyInstanceUid,
      accessionNumber: input.accessionNumber,
      patientId: input.patientId,
      radiologistId: input.radiologistId,
      radiologistName: input.radiologistName,
      technique: input.technique,
      comparisonStudies: input.comparisonStudies,
      findings: input.findings,
      impression: input.impression,
      structuredClassification: input.structuredClassification,
      criticalAlertFlag: input.criticalAlertFlag || false,
      status: 'FINALIZED',
      signedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.reports[existingIndex] = report;
    } else {
      this.reports.push(report);
    }

    return report;
  }
}
