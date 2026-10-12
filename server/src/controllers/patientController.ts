import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createAssessmentSchema, wearableVitalsSchema } from '../utils/validation';
import { generateTriageRecommendation } from '../services/triageService';

export const recordWearableVitals = async (req: Request, res: Response) => {
  try {
    const validatedData = wearableVitalsSchema.parse(req.body);
    console.log('[WEARABLE] Received vitals payload:', validatedData);

    const defaultPatientId = process.env.WEARABLE_DEFAULT_PATIENT || 'demo-patient';
    let patientId = validatedData.patientId || defaultPatientId;
    
    // Check if patient exists
    let userExists = await prisma.user.findUnique({ where: { id: patientId } });
    
    if (!userExists && patientId !== defaultPatientId) {
      console.warn(`[WEARABLE] Patient ${patientId} not found, falling back to default`);
      patientId = defaultPatientId;
      userExists = await prisma.user.findUnique({ where: { id: patientId } });
    }

    if (!userExists) {
      console.warn(`[WEARABLE] Default patient ${patientId} not found. Creating it automatically.`);
      try {
        await prisma.user.create({
          data: {
            id: patientId,
            name: 'Demo Patient',
            phone: `+1000000${Math.floor(Math.random() * 10000)}`, // Randomize slightly to avoid unique constraint if recreated
            passwordHash: 'demo',
            role: 'PATIENT',
            patientProfile: {
              create: {
                dateOfBirth: new Date('1990-01-01'),
                gender: 'Unspecified',
                villageSector: 'Demo Village'
              }
            }
          }
        });
      } catch (err) {
        console.error('[WEARABLE] Failed to create demo patient:', err);
        return res.status(500).json({ success: false, error: 'Failed to create demo patient' });
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
    const authenticatedUser = req.user!;
    const validatedData = createAssessmentSchema.parse(req.body);

    // Enforce patient identity: Patients can only submit for themselves.
    // An ASHA worker may submit on behalf of an existing registered patient.
    let targetPatientId = authenticatedUser.id;
    if (authenticatedUser.role === 'ASHA' && validatedData.patientId) {
      const patientExists = await prisma.user.findUnique({
        where: { id: validatedData.patientId }
      });
      if (!patientExists) {
        return res.status(404).json({ success: false, data: null, error: 'Target patient not found' });
      }
      targetPatientId = validatedData.patientId;
    }

    // Evaluate triage using safety-first deterministic engine
    const triage = await generateTriageRecommendation({
      symptoms: validatedData.symptoms,
      severity: validatedData.severity,
      duration: validatedData.duration,
      vitals: validatedData.vitals,
      notes: validatedData.notes
    });

    // Execute atomic transaction for assessment creation and optional linked vitals log
    const assessment = await prisma.$transaction(async (tx) => {
      const created = await tx.assessment.create({
        data: {
          patientId: targetPatientId,
          submittedById: authenticatedUser.id,
          symptoms: validatedData.symptoms,
          severity: validatedData.severity || null,
          duration: validatedData.duration || null,
          triageLevel: triage.triageLevel,
          priority: triage.priority,
          vitals: validatedData.vitals
            ? { ...validatedData.vitals, source: validatedData.vitals.source || 'manual' }
            : undefined,
          aiSummary: JSON.stringify({
            triageLevel: triage.triageLevel,
            reasoning: triage.reasoning,
            nextSteps: triage.nextSteps,
            limitations: triage.limitations,
            escalationGuidance: triage.escalationGuidance,
            vitalsAssessment: triage.vitalsAssessment
          }),
          aiRecommendation: triage.recommendedAction,
          status: 'PENDING'
        }
      });

      // If valid vitals were supplied, record linked entry in Vitals table
      if (validatedData.vitals && Object.keys(validatedData.vitals).length > 0) {
        const v = validatedData.vitals;
        await tx.vitals.create({
          data: {
            assessmentId: created.id,
            patientId: targetPatientId,
            device: v.device || (v.source === 'wearable' ? 'Wearable Device' : 'Clinical Entry'),
            heartRate: v.heartRate ?? null,
            restingHeartRate: v.restingHeartRate ?? null,
            spo2: v.spo2 ?? null,
            temperature: v.temperature ?? null,
            bloodPressure: v.bloodPressure ?? null,
            recordedAt: new Date()
          }
        });
      }

      return created;
    });

    return res.status(201).json({
      success: true,
      data: assessment,
      triage: {
        triageLevel: triage.triageLevel,
        priority: triage.priority,
        recommendedAction: triage.recommendedAction,
        reasoning: triage.reasoning,
        nextSteps: triage.nextSteps,
        limitations: triage.limitations,
        escalationGuidance: triage.escalationGuidance,
        vitalsAssessment: triage.vitalsAssessment,
        disclaimer: triage.disclaimer
      },
      error: null
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        data: null,
        error: error.errors.map((e: any) => ({
          field: e.path.join('.'),
          message: e.message
        }))
      });
    }
    console.error('[createAssessment error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};

export const getCommunityPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        phone: true,
        patientProfile: {
          select: {
            dateOfBirth: true,
            gender: true,
            villageSector: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const data = patients.map((p) => {
      let age = 30;
      if (p.patientProfile?.dateOfBirth) {
        const birthYear = new Date(p.patientProfile.dateOfBirth).getFullYear();
        age = new Date().getFullYear() - birthYear;
      }
      return {
        id: p.id,
        name: p.name,
        phone: p.phone,
        age,
        gender: p.patientProfile?.gender || 'unknown',
        village: p.patientProfile?.villageSector || 'Rampur'
      };
    });

    return res.status(200).json({ success: true, data, error: null });
  } catch (error) {
    console.error('[getCommunityPatients error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};

export const getAssessments = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const userRole = req.user!.role;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const whereClause = userRole === 'ASHA'
      ? { OR: [{ submittedById: userId }, { patientId: userId }] }
      : { patientId: userId };

    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          status: true,
          priority: true,
          triageLevel: true,
          severity: true,
          duration: true,
          aiRecommendation: true,
          createdAt: true,
          symptoms: true,
          patient: {
            select: {
              id: true,
              name: true,
              patientProfile: {
                select: {
                  villageSector: true,
                  dateOfBirth: true
                }
              }
            }
          }
        }
      }),
      prisma.assessment.count({ where: whereClause })
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

    let summaryObj: any = { reasoning: [], nextSteps: [] };
    if (assessment.aiSummary) {
      try {
        summaryObj = JSON.parse(assessment.aiSummary);
      } catch (e) {
        // Handle invalid JSON just in case
      }
    }

    const triageResult = {
      triageLevel: summaryObj.triageLevel || (assessment.priority === 'HIGH' ? 'VISIT_PHC' : assessment.priority === 'MEDIUM' ? 'VIDEO_CONSULT' : 'SELF_CARE'),
      priority: assessment.priority,
      recommendedAction: assessment.aiRecommendation,
      reasoning: summaryObj.reasoning || [],
      nextSteps: summaryObj.nextSteps || [],
      limitations: summaryObj.limitations || [],
      escalationGuidance: summaryObj.escalationGuidance || '',
      vitalsAssessment: summaryObj.vitalsAssessment || undefined,
      disclaimer: "This is an algorithmic triage recommendation for informational guidance only. It does not provide a definitive medical diagnosis and does not replace professional clinical evaluation by a qualified healthcare provider."
    };

    return res.status(200).json({ data: triageResult, error: null });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ data: null, error: 'Internal server error' });
  }
};
