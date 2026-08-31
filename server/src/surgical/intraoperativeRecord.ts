/**
 * Intraoperative Surgical & Anesthesia Continuous Recording Engine
 * WHO Surgical Safety Checklist State Machine, 5-Minute Time-Series Vitals & Fluid Balance Management
 */

export interface WhoChecklistStage {
  signInCompleted: boolean; // Before induction: Patient identity, site mark, anesthesia machine check, pulse ox, allergy check, difficult airway check, aspiration risk, blood loss risk >500mL
  timeOutCompleted: boolean; // Before skin incision: Entire surgical team introduced, patient name/procedure confirmed, antibiotic prophylaxis given within 60 mins, critical non-routine steps reviewed, sterility indicators confirmed, imaging displayed
  signOutCompleted: boolean; // Before leaving OR: Nurse verbally confirms name of procedure, needle/sponge/instrument counts correct, specimen labeled with patient name/ID, equipment issues addressed, key post-op recovery concerns reviewed
  attendingSurgeonSignOff: string;
  anesthesiologistSignOff: string;
  circulatingNurseSignOff: string;
  completedAt: string;
}

export interface IntraopVitalsSnapshot {
  minuteTimestamp: number; // e.g. 0, 5, 10, 15, 20...
  heartRateBpm: number;
  systolicBp: number;
  diastolicBp: number;
  meanArterialPressure: number;
  spo2Percent: number;
  endTidalCo2Mmhg: number; // Normal: 35-45 mmHg
  fractionInspiredO2Percent: number; // e.g. 50%
  peepCmH2o: number; // Normal: 5-8 cmH2O
  peakInspiratoryPressureCmH2o: number; // High if > 30 cmH2O
  tidalVolumeMl: number;
  respiratoryRate: number;
  agentName: 'SEVOFLURANE' | 'DESFLURANE' | 'ISOFLURANE' | 'PROPOFOL_TIVA';
  agentMacEquivalent: number; // Minimum Alveolar Concentration (e.g. 1.0 - 1.2 MAC)
  bispectralIndexBis?: number; // Target general anesthesia: 40 - 60
  trainOfFourTwitches?: 0 | 1 | 2 | 3 | 4; // 0 = profound block, 4 = baseline/recovered
}

export interface IntraopFluidBalance {
  crystalloidAdministeredMl: number; // Lactated Ringers, Plasma-Lyte
  colloidAdministeredMl: number; // Albumin 5%
  packedRedBloodCellsUnits: number;
  freshFrozenPlasmaUnits: number;
  plateletsUnits: number;
  estimatedBloodLossMl: number;
  urineOutputMl: number;
  irrigationFluidUsedMl: number;
  irrigationFluidSuctionedMl: number;
}

export interface SurgicalProcedureRecord {
  id: string;
  patientId: string;
  patientName: string;
  operatingRoomNumber: string;
  primarySurgeonName: string;
  primaryAnesthesiologistName: string;
  procedureName: string;
  preOperativeDiagnosis: string;
  postOperativeDiagnosis: string;
  startTime: string;
  endTime?: string;
  whoChecklist: WhoChecklistStage;
  vitalsSeries: IntraopVitalsSnapshot[];
  fluidBalance: IntraopFluidBalance;
  surgicalCountsStatus: 'CORRECT_AND_VERIFIED' | 'DISCREPANCY_NOTED' | 'XRAY_CONFIRMATION_PENDING';
  neuromuscularReversal?: {
    reversalAgent: 'SUGAMMADEX' | 'NEOSTIGMINE_GLYCOPYRROLATE';
    doseMg: number;
    postReversalTofRatio: number; // Target >= 0.90 for safe extubation
  };
}

export class IntraoperativeService {
  /**
   * Calculate exact net fluid balance for intraoperative case
   */
  public static calculateNetFluidBalance(fluid: IntraopFluidBalance): {
    totalIntakeMl: number;
    totalOutputMl: number;
    netBalanceMl: number;
    estimatedBloodVolumeLostPercent: number; // Assuming 70 mL/kg for 75kg adult = 5250 mL
  } {
    const prbcMl = fluid.packedRedBloodCellsUnits * 300;
    const ffpMl = fluid.freshFrozenPlasmaUnits * 250;
    const pltMl = fluid.plateletsUnits * 200;

    const totalIntake =
      fluid.crystalloidAdministeredMl +
      fluid.colloidAdministeredMl +
      prbcMl +
      ffpMl +
      pltMl;

    const netSurgicalSuctionLoss = Math.max(0, fluid.irrigationFluidSuctionedMl - fluid.irrigationFluidUsedMl);
    const totalOutput = fluid.estimatedBloodLossMl + fluid.urineOutputMl + netSurgicalSuctionLoss;
    const netBalance = totalIntake - totalOutput;

    const assumedEbv = 5250; // 70 mL/kg for 75kg standard
    const bloodLossPercent = parseFloat(((fluid.estimatedBloodLossMl / assumedEbv) * 100).toFixed(1));

    return {
      totalIntakeMl: totalIntake,
      totalOutputMl: totalOutput,
      netBalanceMl: netBalance,
      estimatedBloodVolumeLostPercent: bloodLossPercent,
    };
  }

  /**
   * Determine exact Sugammadex Neuromuscular Reversal Dose based on Train-of-Four depth
   */
  public static calculateSugammadexDose(input: {
    weightKg: number;
    tofTwitches: 0 | 1 | 2 | 3 | 4;
    postTetanicCount?: number; // If TOF = 0
    isImmediateEmergencyRescue: boolean; // e.g. "Cannot Intubate Cannot Ventilate" (CICV)
  }): {
    recommendedDoseMg: number;
    dosePerKgMg: number;
    clinicalRationale: string;
  } {
    if (input.isImmediateEmergencyRescue) {
      // Immediate reversal of high-dose (1.2 mg/kg) rocuronium
      const dose = 16 * input.weightKg;
      return {
        recommendedDoseMg: dose,
        dosePerKgMg: 16,
        clinicalRationale: `EMERGENCY RESCUE DOSE (16 mg/kg = ${dose} mg): Indicated for immediate reversal of profound rocuronium blockade in failed airway / CICV scenario.`,
      };
    }

    if (input.tofTwitches >= 2) {
      // Moderate neuromuscular block (reappearance of second twitch T2)
      const dose = 2 * input.weightKg;
      return {
        recommendedDoseMg: dose,
        dosePerKgMg: 2,
        clinicalRationale: `MODERATE BLOCK DOSE (2 mg/kg = ${dose} mg): Reverses moderate blockade (TOF >= 2 twitches) to TOF ratio >0.9 within 3 minutes.`,
      };
    }

    // Deep neuromuscular block (1-2 post-tetanic counts with 0 TOF twitches)
    const dose = 4 * input.weightKg;
    return {
      recommendedDoseMg: dose,
      dosePerKgMg: 4,
      clinicalRationale: `DEEP BLOCK DOSE (4 mg/kg = ${dose} mg): Reverses deep blockade (TOF = 0 with >=1 post-tetanic twitches) to TOF ratio >0.9 within 5 minutes.`,
    };
  }
}
