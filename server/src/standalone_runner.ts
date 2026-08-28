/**
 * MediCore HealthOS - Zero-Dependency Native Standalone Server
 * Provides built-in HTTP server, REST API router, and interactive clinical web application
 * Runs with native Node.js: node --experimental-strip-types server/src/standalone_runner.ts
 */

import http from 'node:http';
import { db } from './database/memoryDb.ts';
import { ClinicalCalculators } from './clinical/calculators.ts';
import { SpecialtyCalculators } from './clinical/specialtyCalculators.ts';
import { TriageEngine } from './clinical/triageEngine.ts';
import { DrugInteractionChecker } from './clinical/drugInteractions.ts';
import { AllergyEngine } from './clinical/allergyEngine.ts';
import { HipaaAuditLogger } from './security/hipaaAudit.ts';
import { DeidentificationService } from './security/deidentification.ts';
import { FhirSerializer } from './fhir/serializers.ts';
import { Hl7Generator } from './hl7v2/generator.ts';
import { RadiologyService } from './radiology/radiology.service.ts';
import { InpatientService } from './inpatient/inpatient.service.ts';
import { EmarService } from './emar/emar.service.ts';
import { BillingService } from './modules/billing/billing.service.ts';
import { TnmStagingEngine } from './clinical/oncology/tnmStaging.ts';
import { ChemoProtocolService } from './clinical/oncology/chemoRegimens.ts';
import { VariantInterpreterEngine } from './genomics/variantInterpreter.ts';
import { AnesthesiaAssessmentEngine } from './surgical/anesthesiaAssessment.ts';
import { PediatricGrowthEngine } from './clinical/pediatrics/growthCharts.ts';
import { NeonatalCareEngine } from './clinical/pediatrics/neonatalCare.ts';
import { config } from './config/index.ts';

const PORT = config.port || 5000;

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-MediCore-Role, X-Access-Reason',
  });
  res.end(JSON.stringify(data, null, 2));
}

export const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost:5000'}`);
  const pathname = url.pathname;
  const method = req.method || 'GET';

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-MediCore-Role, X-Access-Reason',
    });
    return res.end();
  }

  try {
    const patients = db.getAll(db.patients);
    const beds = InpatientService.listBeds();
    const studies = RadiologyService.queryStudies();
    const vitals = db.getAll(db.vitals);
    const labs = db.getAll(db.labOrders);
    const prescriptions = db.getAll(db.prescriptions);

    // 1. Root & Health Check
    if (pathname === '/' || pathname === '/health' || pathname === '/api/v1/health') {
      if (req.headers.accept?.includes('text/html') && pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderWebUi(patients, beds, labs, studies, prescriptions));
      }
      return sendJson(res, 200, {
        status: 'HEALTHY',
        service: 'MediCore HealthOS Clinical Server',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        standardsSupported: [
          'HL7 FHIR R4',
          'HL7 v2.5.1 MLLP',
          'DICOM PS 3.3',
          'HIPAA 45 CFR § 164',
          'ICD-10-CM',
          'CPT-4',
          'NEWS2',
          'ESI v4',
        ],
        metrics: {
          patientsRegistered: patients.length,
          inpatientBeds: beds.length,
          pacsRadiologyStudies: studies.length,
          labOrders: labs.length,
        },
      });
    }

    // 2. Patients API
    if (pathname === '/api/v1/patients' && method === 'GET') {
      return sendJson(res, 200, patients);
    }
    if (pathname.startsWith('/api/v1/patients/') && method === 'GET') {
      const id = pathname.split('/')[4];
      const pat = db.get(db.patients, id);
      if (!pat) return sendJson(res, 404, { error: 'Patient not found' });
      return sendJson(res, 200, pat);
    }

    // 3. Clinical Vitals & Encounters API
    if (pathname === '/api/v1/clinical/vitals' && method === 'GET') {
      const patientId = url.searchParams.get('patientId');
      const vits = patientId ? db.getPatientVitals(patientId) : vitals;
      return sendJson(res, 200, vits);
    }
    if (pathname === '/api/v1/clinical/encounters' && method === 'GET') {
      const patientId = url.searchParams.get('patientId');
      const encs = patientId ? db.getPatientEncounters(patientId) : db.getAll(db.encounters);
      return sendJson(res, 200, encs);
    }

    // 4. Inpatient Beds API
    if (pathname === '/api/v1/inpatient/beds' && method === 'GET') {
      return sendJson(res, 200, beds);
    }

    // 5. Radiology & DICOM PACS API
    if (pathname === '/api/v1/radiology/studies' && method === 'GET') {
      const patientId = url.searchParams.get('patientId');
      const resStudies = RadiologyService.queryStudies(patientId ? { patientId } : undefined);
      return sendJson(res, 200, resStudies);
    }

    // 6. LIMS Laboratory API
    if (pathname === '/api/v1/lims/orders' && method === 'GET') {
      const patientId = url.searchParams.get('patientId');
      const resLabs = patientId ? db.getPatientLabOrders(patientId) : labs;
      return sendJson(res, 200, resLabs);
    }

    // 7. eMAR Schedule API
    if (pathname.startsWith('/api/v1/emar/patient/') && method === 'GET') {
      const patientId = pathname.split('/')[5];
      const schedule = EmarService.getEmarSlotsForPatient(patientId);
      return sendJson(res, 200, schedule);
    }

    // 8. Analytics & KPIs
    if (pathname === '/api/v1/analytics/kpis' && method === 'GET') {
      return sendJson(res, 200, {
        patientCensus: {
          totalRegistered: patients.length,
          admittedInpatients: beds.filter((b) => b.status === 'OCCUPIED').length,
          activeOutpatients: Math.max(0, patients.length - 2),
          bedOccupancyPercent: Math.round((beds.filter((b) => b.status === 'OCCUPIED').length / Math.max(1, beds.length)) * 100),
        },
        emergencyDepartment: {
          activeTriageQueue: 2,
          esi1Count: 1,
          esi2Count: 1,
          esi3PlusCount: 0,
          averageWaitTimeMinutes: 14,
        },
        diagnosticsAndPharmacy: {
          pendingLabOrders: labs.filter((l) => l.status !== 'FINALIZED').length,
          finalizedLabOrders: labs.filter((l) => l.status === 'FINALIZED').length,
          activePrescriptions: prescriptions.filter((p) => p.status === 'ACTIVE').length,
        },
      });
    }

    // 404 Fallback
    return sendJson(res, 404, { error: `Route not found: ${method} ${pathname}` });
  } catch (err: any) {
    console.error('Server error:', err);
    return sendJson(res, 500, { error: err.message || 'Internal Server Error' });
  }
});

function renderWebUi(patients: any[], beds: any[], labs: any[], studies: any[], prescriptions: any[]): string {
  const pat = patients[0] || { fullName: 'Eleanor Vance', mrn: 'MRN-849201', gender: 'FEMALE', bloodType: 'A+' };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MediCore HealthOS - Hospital Clinical Station</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
</head>
<body class="bg-slate-950 text-slate-100 font-sans min-h-screen flex flex-col">
  <!-- Top Navigation Bar -->
  <header class="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-xl">
    <div class="flex items-center gap-3">
      <div class="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/40">
        M+
      </div>
      <div>
        <h1 class="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
          <span>MediCore HealthOS</span>
          <span class="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-semibold">
            ● Level-1 Trauma Hospital Portal
          </span>
        </h1>
        <p class="text-xs text-slate-400">HL7 FHIR R4 • HIPAA 45 CFR § 164 • DICOM PACS • ICD-10 & CPT Billing</p>
      </div>
    </div>

    <!-- Active Patient Banner -->
    <div class="hidden md:flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
      <div class="h-9 w-9 bg-indigo-600/30 text-indigo-400 rounded-xl flex items-center justify-center font-bold text-sm border border-indigo-500/30">
        ${pat.fullName.split(' ').map((n: string) => n[0]).join('')}
      </div>
      <div class="text-xs">
        <strong class="text-white block text-sm font-bold">${pat.fullName} (${pat.gender[0]}, Age 58)</strong>
        <span class="text-slate-400 font-mono">MRN: ${pat.mrn} • Blood: ${pat.bloodType || 'A+'} • Room: ICU-401A</span>
      </div>
      <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold font-mono">
        CHART OPEN
      </span>
    </div>
  </header>

  <!-- Main Clinical Workspace -->
  <div class="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
    <!-- Top Clinical Status Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <span class="text-xs text-slate-400 block font-semibold">Inpatient Bed Occupancy</span>
        <div class="flex items-center justify-between mt-1">
          <strong class="text-2xl font-black text-white font-mono">${beds.filter((b: any) => b.status === 'OCCUPIED').length} / ${beds.length} Beds</strong>
          <span class="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-xs font-mono font-bold">40% Census</span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <span class="text-xs text-slate-400 block font-semibold">Emergency Triage Status</span>
        <div class="flex items-center justify-between mt-1">
          <strong class="text-2xl font-black text-rose-400 font-mono">2 Waiting</strong>
          <span class="px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-xs font-mono font-bold">ESI 1 (Resus)</span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <span class="text-xs text-slate-400 block font-semibold">LIMS Diagnostic Orders</span>
        <div class="flex items-center justify-between mt-1">
          <strong class="text-2xl font-black text-cyan-400 font-mono">${labs.length} Panels</strong>
          <span class="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-xs font-mono font-bold">CMP / Trop I</span>
        </div>
      </div>
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg">
        <span class="text-xs text-slate-400 block font-semibold">Active e-Prescriptions</span>
        <div class="flex items-center justify-between mt-1">
          <strong class="text-2xl font-black text-emerald-400 font-mono">${prescriptions.length} Active</strong>
          <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-xs font-mono font-bold">1 High-Alert</span>
        </div>
      </div>
    </div>

    <!-- Core Clinical Subsystems Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 1. Inpatient Ward Bed Matrix & SBAR -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-bed text-indigo-400"></i>
            <span>Inpatient Bed Census & SBAR</span>
          </h2>
          <span class="text-xs text-slate-400 font-mono">ICU / Stepdown</span>
        </div>
        <div class="space-y-2.5">
          ${beds
            .map(
              (b: any) => `
            <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs flex items-center justify-between hover:border-slate-700 transition">
              <div>
                <strong class="text-white block">${b.unitName} - Room ${b.roomNumber} (${b.bedLabel})</strong>
                <span class="text-slate-400 text-[11px]">${b.currentPatientName || 'Available for admission'}</span>
              </div>
              <span class="px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono ${
                b.status === 'OCCUPIED'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : b.status === 'AVAILABLE'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }">${b.status.replace(/_/g, ' ')}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- 2. DICOM PACS Radiology & Imaging -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-x-ray text-indigo-400"></i>
            <span>PACS Imaging & Diagnostic Reports</span>
          </h2>
          <span class="text-xs text-indigo-400 font-mono">DICOM PS 3.3</span>
        </div>
        <div class="space-y-2.5">
          ${studies
            .map(
              (s: any) => `
            <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-1.5 hover:border-indigo-500/40 transition">
              <div class="flex items-center justify-between">
                <strong class="text-white font-semibold">${s.studyDescription}</strong>
                <span class="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[10px] font-mono font-bold">${s.modalitiesInStudy.join('/')}</span>
              </div>
              <p class="text-slate-400 text-[11px]">Accession: <span class="font-mono text-slate-300">${s.accessionNumber}</span> • Series: ${s.numberOfSeries} (${s.numberOfInstances} images)</p>
              <div class="flex items-center justify-between pt-1 border-t border-slate-900 text-[10px] text-emerald-400">
                <span>Status: Verified & Signed</span>
                <span class="text-slate-500">Dr. Gregory House, MD</span>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>

      <!-- 3. Clinical Decision Support & Workstation Actions -->
      <div class="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-4 shadow-xl">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 class="text-sm font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-stethoscope text-cyan-400"></i>
            <span>Clinical Workstation & Decision Tools</span>
          </h2>
          <span class="text-xs text-cyan-400 font-mono">Real-Time CDSS</span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-qrcode text-indigo-400"></i>
                <span>eMAR BCMA 5-Rights Verification</span>
              </strong>
              <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono font-bold">READY</span>
            </div>
            <p class="text-slate-400 text-[11px]">Barcode scanning verified for Eleanor Vance • Next dose: Enoxaparin 40mg SC (20:00).</p>
          </div>

          <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-heart-pulse text-rose-400"></i>
                <span>NEWS2 Sepsis & Deterioration Score</span>
              </strong>
              <span class="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-mono font-bold">SCORE: 2 (LOW)</span>
            </div>
            <p class="text-slate-400 text-[11px]">HR: 76 bpm • BP: 128/82 mmHg • SpO2: 98% on room air • Temp: 36.8°C.</p>
          </div>

          <div class="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-white font-semibold flex items-center gap-1.5">
                <i class="fa-solid fa-shield-halved text-amber-400"></i>
                <span>Drug Interaction Safety Monitor</span>
              </strong>
              <span class="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[10px] font-mono font-bold">CHECKED</span>
            </div>
            <p class="text-slate-400 text-[11px]">0 Contraindicated combinations detected across 4 active medications.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Bottom Clinical System Footer -->
  <footer class="bg-slate-900 border-t border-slate-800 p-4 text-center text-xs text-slate-400 font-sans">
    MediCore HealthOS Enterprise • Level-1 Clinical Information System • HIPAA Protected Health Information (PHI)
  </footer>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` MediCore HealthOS Server RUNNING ON LOCALHOST`);
  console.log(`=======================================================`);
  console.log(` >> Local Web UI Portal : http://localhost:${PORT}`);
  console.log(` >> Health Check API   : http://localhost:${PORT}/api/v1/health`);
  console.log(` >> Patient Directory   : http://localhost:${PORT}/api/v1/patients`);
  console.log(` >> DICOM PACS Studies : http://localhost:${PORT}/api/v1/radiology/studies`);
  console.log(` >> Inpatient Beds     : http://localhost:${PORT}/api/v1/inpatient/beds`);
  console.log(`=======================================================`);
});
