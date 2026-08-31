import test from 'node:test';
import assert from 'node:assert/strict';
import { SpecialtyCalculators } from '../src/clinical/specialtyCalculators.ts';

test('Specialty Calculators - HEART Score for Acute Chest Pain', () => {
  // Low risk: 35yo, non-suspicious, normal ECG, 0 risk factors, normal troponin
  const lowRisk = SpecialtyCalculators.calculateHeartScore({
    history: 0,
    ecg: 0,
    age: 35,
    riskFactorsCount: 0,
    troponinInitial: 0,
  });
  assert.equal(lowRisk.score, 0);
  assert.equal(lowRisk.riskCategory, 'LOW');

  // High risk: 70yo (+2), highly suspicious (+2), ST-elevation (+2), 4 risk factors (+2), elevated troponin (+2)
  const highRisk = SpecialtyCalculators.calculateHeartScore({
    history: 2,
    ecg: 2,
    age: 70,
    riskFactorsCount: 4,
    troponinInitial: 2,
  });
  assert.equal(highRisk.score, 10);
  assert.equal(highRisk.riskCategory, 'HIGH');
  assert.ok(highRisk.managementRecommendation.includes('angiography'));
});

test('Specialty Calculators - MELD-Na Liver Disease Score', () => {
  const result = SpecialtyCalculators.calculateMeldNa({
    creatinine: 2.1,
    bilirubin: 3.5,
    inr: 1.8,
    sodium: 128,
  });

  assert.ok(result.meldScore > 15);
  assert.ok(result.meldNaScore >= result.meldScore); // Hyponatremia raises MELD-Na
  assert.ok(result.threeMonthMortalityPercent);
});

test('Specialty Calculators - CURB-65 Pneumonia Severity', () => {
  // 68yo with confusion and BUN 28
  const res = SpecialtyCalculators.calculateCurb65({
    confusion: true,
    bun: 28,
    respiratoryRate: 22,
    systolicBp: 120,
    diastolicBp: 75,
    age: 68,
  });

  assert.equal(res.score, 3); // Confusion (1) + BUN (1) + Age >=65 (1)
  assert.equal(res.riskGroup, 'HIGH');
});

test('Specialty Calculators - Wells PE & FENa Nephrology Calculators', () => {
  // Wells PE High Risk
  const wells = SpecialtyCalculators.calculateWellsPe({
    clinicalSignsDvt: true, // 3.0
    peMostLikelyDiagnosis: true, // 3.0
    heartRateOver100: true, // 1.5
    immobilizationOrSurgeryInPast4Weeks: false,
    previousDvtOrPe: false,
    hemoptysis: false,
    malignancyTreatedInPast6Months: false,
  });

  assert.equal(wells.score, 7.5);
  assert.equal(wells.probabilityTier, 'HIGH');

  // FENa Pre-renal (<1%)
  const fena = SpecialtyCalculators.calculateFeNa({
    urineSodiumMmol: 10,
    serumSodiumMmol: 140,
    urineCreatinineMgDl: 100,
    serumCreatinineMgDl: 2.0,
  });

  // (10 * 2.0) / (140 * 100) * 100 = 20 / 14000 * 100 = 0.14%
  assert.equal(fena.feNaPercent, 0.14);
  assert.equal(fena.etiology, 'PRE_RENAL');
});
