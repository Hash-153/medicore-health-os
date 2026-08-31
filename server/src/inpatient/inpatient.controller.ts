import { Request, Response } from 'express';
import { InpatientService } from './inpatient.service.ts';

export class InpatientController {
  public static listBeds(req: Request, res: Response): void {
    const unitCode = req.query.unitCode as string;
    const status = req.query.status as string;
    const beds = InpatientService.listBeds({ unitCode, status });
    res.json({ success: true, count: beds.length, data: beds });
  }

  public static assignBed(req: Request, res: Response): void {
    try {
      const { bedId, patientId, patientName } = req.body;
      const updated = InpatientService.assignPatientToBed(bedId, patientId, patientName);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static dischargeBed(req: Request, res: Response): void {
    try {
      const { bedId } = req.params;
      const updated = InpatientService.dischargeBed(bedId);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static cleanBed(req: Request, res: Response): void {
    try {
      const { bedId } = req.params;
      const updated = InpatientService.completeBedCleaning(bedId);
      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static createSbarHandoff(req: Request, res: Response): void {
    try {
      const nurseName = req.user?.name || 'Robert Vance, RN';
      const handoff = InpatientService.compileSbarHandoff({
        ...req.body,
        nurseGivingHandoff: nurseName,
      });
      res.status(201).json({ success: true, data: handoff });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static getHandoffs(req: Request, res: Response): void {
    const { patientId } = req.params;
    const handoffs = InpatientService.getHandoffsForPatient(patientId);
    res.json({ success: true, count: handoffs.length, data: handoffs });
  }
}
