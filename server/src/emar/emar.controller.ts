import { Request, Response } from 'express';
import { EmarService } from './emar.service.ts';

export class EmarController {
  public static getSlots(req: Request, res: Response): void {
    const { patientId } = req.params;
    const slots = EmarService.getEmarSlotsForPatient(patientId);
    res.json({ success: true, count: slots.length, data: slots });
  }

  public static verifyFiveRights(req: Request, res: Response): void {
    try {
      const result = EmarService.verifyFiveRights(req.body);
      res.json({ success: true, data: result });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  public static recordAdmin(req: Request, res: Response): void {
    try {
      const nurseId = req.user?.id || 'NURSE-202';
      const nurseName = req.user?.name || 'Robert Vance, RN';

      const updated = EmarService.recordAdministration({
        ...req.body,
        nurseId,
        nurseName,
      });

      res.json({ success: true, data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  }
}
