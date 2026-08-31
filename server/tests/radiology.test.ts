import test from 'node:test';
import assert from 'node:assert/strict';
import { RadiologyService } from '../src/radiology/radiology.service.ts';

test('DICOM PACS - Study Hierarchy and Query Retrieval (C-FIND)', () => {
  const studies = RadiologyService.queryStudies({ patientId: 'PAT-001' });
  assert.equal(studies.length, 1);
  assert.equal(studies[0].modalitiesInStudy[0], 'CT');
  assert.equal(studies[0].series.length, 3);

  // Check Axial Angio series
  const angioSeries = studies[0].series.find((s) => s.seriesNumber === 2);
  assert.ok(angioSeries);
  assert.equal(angioSeries.bodyPartExamined, 'CHEST');
  assert.equal(angioSeries.instances[0].windowWidth, 700);
});

test('DICOM Structured Reporting - Authoring & BI-RADS/Lung-RADS Classification', () => {
  const report = RadiologyService.signReport({
    studyInstanceUid: '1.2.840.113619.2.55.3.2831154.912.1692819202.2',
    accessionNumber: 'ACC-RAD-89105',
    patientId: 'PAT-002',
    radiologistId: 'RAD-301',
    radiologistName: 'Dr. Gregory House, MD',
    technique: 'PA and lateral views of the chest.',
    findings: 'No pneumothorax. Heart size is normal.',
    impression: 'Normal 2-view chest radiograph.',
    structuredClassification: {
      system: 'LUNG-RADS',
      categoryScore: 'Lung-RADS 1: Negative',
      actionRecommendation: 'Annual screening.',
    },
    criticalAlertFlag: false,
  });

  assert.equal(report.status, 'FINALIZED');
  assert.equal(report.structuredClassification?.system, 'LUNG-RADS');
  assert.ok(report.signedAt);
});
