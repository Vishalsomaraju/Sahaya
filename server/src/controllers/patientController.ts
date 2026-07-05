import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAssessmentSchema, wearableVitalsSchema } from '../utils/validation';
import { generateTriageRecommendation } from '../services/triageService';

export const recordWearableVitals = async (req: Request, res: Response) => {
  try {
    const validatedData = wearableVitalsSchema.parse(req.body);
    console.log('[WEARABLE] Received vitals payload:', validatedData);

    let patientId = validatedData.patientId;
    
    // Configurable mapping fallback for hackathon
    if (!patientId) {
      patientId = process.env.WEARABLE_DEFAULT_PATIENT || 'demo-patient';
    } else {
      // check if patient exists, if not fallback
      const userExists = await prisma.user.findUnique({ where: { id: patientId } });
      if (!userExists) {
        console.warn(`[WEARABLE] Patient ${patientId} not found, falling back to default`);
        patientId = process.env.WEARABLE_DEFAULT_PATIENT || 'demo-patient';
        // Wait, if the default patient doesn't exist we might get a foreign key error.
        // We'll trust the default patient exists or the DB handles it if patientId is optional or it exists.
        // Wait, in my schema update patientId is optional! So if no valid patient is found, we can just leave it null.
        const defaultUserExists = await prisma.user.findUnique({ where: { id: patientId } });
        if (!defaultUserExists) {
           patientId = undefined; // use optional
        }
      }
    }

    const recordedAt = validatedData.timestamp ? new Date(validatedData.timestamp) : new Date();

    const vitalRecord = await prisma.vitals.create({
      data: {
        patientId: patientId,
        device: validatedData.device,
        heartRate: validatedData.heartRate,
        restingHeartRate: validatedData.restingHeartRate,
        steps: validatedData.steps,
        distance: validatedData.distance,
        calories: validatedData.calories,
        sleepMinutes: validatedData.sleepMinutes,
        spo2: validatedData.spo2,
        recordedAt: recordedAt
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Vitals received successfully',
      data: vitalRecord
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: error.errors });
    }
    console.error('[WEARABLE ERROR]', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const getLatestVitals = async (req: Request, res: Response) => {
  try {
    // If the endpoint is accessed without auth, we might just use the param id or demo-patient
    const patientId = (req.params.id as string) || process.env.WEARABLE_DEFAULT_PATIENT || 'demo-patient';

    const latest = await prisma.vitals.findFirst({
      where: { patientId },
      orderBy: { recordedAt: 'desc' }
    });

    if (latest) {
      return res.status(200).json({ data: latest, error: null });
    }

    // Demo Mode: Mock data fallback if no wearable data exists
    const mockVitals = {
      id: 'mock-vital-1',
      patientId,
      device: 'Mock Device',
      heartRate: 72,
      restingHeartRate: 65,
      steps: 4230,
      distance: 3.1,
      calories: 1850,
      sleepMinutes: 480,
      spo2: 98,
      temperature: 98.6,
      bloodPressure: '120/80',
      recordedAt: new Date()
    };

    return res.status(200).json({ data: mockVitals, isMock: true, error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const getVitalsHistory = async (req: Request, res: Response) => {
  try {
    const patientId = (req.params.id as string) || process.env.WEARABLE_DEFAULT_PATIENT || 'demo-patient';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [vitals, total] = await Promise.all([
      prisma.vitals.findMany({
        where: { patientId },
        orderBy: { recordedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.vitals.count({ where: { patientId } })
    ]);

    return res.status(200).json({
      data: {
        vitals,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
      },
      error: null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id;

    // Fetch latest vitals via the latest assessment
    const latestAssessment = await prisma.assessment.findFirst({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      include: { vitalsLog: { orderBy: { recordedAt: 'desc' }, take: 1 } }
    });

    let vitals = null;
    if (latestAssessment?.vitalsLog.length) {
      const v = latestAssessment.vitalsLog[0];
      const hrStatus = (v.heartRate && (v.heartRate < 60 || v.heartRate > 100)) ? 'ABNORMAL' : 'NORMAL';
      const spo2Status = (v.spo2 && v.spo2 < 95) ? 'ABNORMAL' : 'NORMAL';

      vitals = {
        heartRate: v.heartRate,
        heartRateStatus: hrStatus,
        spo2: v.spo2,
        spo2Status: spo2Status,
        recordedAt: v.recordedAt
      };
    }

    // Fetch upcoming consultation
    const upcomingConsultation = await prisma.consultation.findFirst({
      where: { patientId, status: 'SCHEDULED' },
      orderBy: { scheduledAt: 'asc' },
      include: { doctor: { select: { name: true } } }
    });

    return res.status(200).json({
      data: {
        vitals,
        upcomingConsultation: upcomingConsultation ? {
          id: upcomingConsultation.id,
          date: upcomingConsultation.scheduledAt,
          doctorName: upcomingConsultation.doctor.name
        } : null
      },
      error: null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const createAssessment = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id;
    const validatedData = createAssessmentSchema.parse(req.body);

    const assessment = await prisma.assessment.create({
      data: {
        patientId,
        submittedById: patientId, // Patient submits for themselves
        symptoms: validatedData.symptoms,
        priority: 'MEDIUM', // default until AI sorts it
        status: 'PENDING'
      }
    });

    // Fire and forget or await the triage result
    // We will await it here to return the updated assessment
    const triage = await generateTriageRecommendation(validatedData.symptoms);
    
    // Update the assessment with triage result
    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessment.id },
      data: {
        priority: triage.priority,
        aiSummary: JSON.stringify({ reasoning: triage.reasoning, nextSteps: triage.nextSteps }),
        aiRecommendation: triage.recommendedAction
      }
    });

    return res.status(201).json({ data: updatedAssessment, error: null });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ data: null, error: error.errors });
    }
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const getAssessments = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          priority: true,
          createdAt: true,
          symptoms: true
        }
      }),
      prisma.assessment.count({ where: { patientId } })
    ]);

    return res.status(200).json({
      data: {
        assessments,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
      error: null
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const getAssessmentById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // We can assume checkAssessmentOwnership middleware passed
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        vitalsLog: { orderBy: { recordedAt: 'desc' } },
        submittedBy: { select: { id: true, name: true, role: true } }
      }
    });

    return res.status(200).json({ data: assessment, error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const patientId = req.user!.id;

    const upcomingConsultations = await prisma.consultation.findMany({
      where: { patientId, status: 'SCHEDULED' },
      orderBy: { scheduledAt: 'asc' },
      include: { doctor: { select: { name: true } } }
    });

    // We merge consultations into a generic "reminders" format and mock some medication reminders
    const reminders = [
      ...upcomingConsultations.map(c => ({
        id: c.id,
        type: 'CONSULTATION',
        title: `Consultation with Dr. ${c.doctor.name}`,
        date: c.scheduledAt,
        completed: false
      })),
      {
        id: 'mock-med-1',
        type: 'MEDICATION',
        title: 'Paracetamol (500mg)',
        date: new Date(new Date().setHours(new Date().getHours() + 2)), // 2 hours from now
        completed: false
      },
      {
        id: 'mock-med-2',
        type: 'MEDICATION',
        title: 'Amoxicillin (250mg)',
        date: new Date(new Date().setHours(new Date().getHours() + 8)), // 8 hours from now
        completed: false
      }
    ];

    // Sort combined reminders by date
    reminders.sort((a, b) => a.date.getTime() - b.date.getTime());

    return res.status(200).json({ data: reminders, error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};

export const getTriageResult = async (req: Request, res: Response) => {
  try {
    const assessment = (req as any).assessment;
    
    if (!assessment) {
      return res.status(404).json({ data: null, error: 'Assessment not found' });
    }

    let summaryObj = { reasoning: [], nextSteps: [] };
    if (assessment.aiSummary) {
      try {
        summaryObj = JSON.parse(assessment.aiSummary);
      } catch (e) {
        // Handle invalid JSON just in case
      }
    }

    const triageResult = {
      priority: assessment.priority,
      recommendedAction: assessment.aiRecommendation,
      reasoning: summaryObj.reasoning,
      nextSteps: summaryObj.nextSteps,
      disclaimer: "This is not a diagnosis. Our AI provides triage recommendation only."
    };

    return res.status(200).json({ data: triageResult, error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};
