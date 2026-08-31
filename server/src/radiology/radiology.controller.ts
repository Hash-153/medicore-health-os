import { Request, Response } from 'express';
import { RadiologyService } from './radiology.service.ts';
import type { DicomModality } from './types.ts';

export class RadiologyController {
  public static queryStudies(req: Request, res: Response): void {
    const patientId = req.query.patientId as string;
    const accessionNumber = req.query.accessionNumber as string;
    const modality = req.query.modality as DicomModality;

    const studies = RadiologyService.queryStudies({ patientId, accessionNumber, modality });
    res.json({ success: true, count: studies.length, data: studies });
  }

  public static getStudy(req: Request, res: Response): void {
    const { uid } = req.params;
    const study = RadiologyService.getStudyByUid(uid);
    if (!study) {
      res.status(404).json({ success: false, error: 'DICOM Study not found' });
      return;
    }
    res.json({ success: true, data: study });
  }

  public static getReport(req: Request, res: Response): void {
    const { uid } = req.params;
    const report = RadiologyService.getReportForStudy(uid);
    if (!report) {
      res.status(404).json({ success: false, error: 'Radiology report not found for study' });
      return;
    }
    res.json({ success: true, data: report });
  }

  public static signReport(req: Request, res: Response): void {
    try {
      const radiologistId = req.user?.id || 'RAD-301';
      const radiologistName = req.user?.name || 'Dr. Gregory House, MD';

      const report = RadiologyService.signReport({
        ...req.body,
        radiologistId,
        radiologistName,
      });

      res.status(201).json({ success: true, data: report });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
