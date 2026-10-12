import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AssessmentStatus, TriageLevel } from '@prisma/client';

export const getDoctorCases = async (req: Request, res: Response) => {
  try {
    const urgency = req.query.urgency as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};

    if (urgency && urgency !== 'ALL' && Object.values(TriageLevel).includes(urgency as TriageLevel)) {
      where.triageLevel = urgency as TriageLevel;
    }

    if (status && status !== 'ALL' && Object.values(AssessmentStatus).includes(status as AssessmentStatus)) {
      where.status = status as AssessmentStatus;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { patient: { name: { contains: q, mode: 'insensitive' } } },
        { symptoms: { hasSome: [q] } },
      ];
    }

    const [cases, totalCount, emergencyCount, visitPhcCount, videoConsultCount, pendingCount, reviewedCount] = await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              phone: true,
              patientProfile: {
                select: {
                  dateOfBirth: true,
                  gender: true,
                  villageSector: true,
                },
              },
            },
          },
          submittedBy: {
            select: {
              id: true,
              name: true,
              role: true,
              ashaProfile: {
                select: {
                  sector: true,
                  employeeId: true,
                },
              },
            },
          },
          vitalsLog: {
            orderBy: { recordedAt: 'desc' },
            take: 1,
          },
          consultations: {
            orderBy: { scheduledAt: 'desc' },
            take: 1,
            include: {
              doctor: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.assessment.count(),
      prisma.assessment.count({ where: { triageLevel: 'EMERGENCY' } }),
      prisma.assessment.count({ where: { triageLevel: 'VISIT_PHC' } }),
      prisma.assessment.count({ where: { triageLevel: 'VIDEO_CONSULT' } }),
      prisma.assessment.count({ where: { status: 'PENDING' } }),
      prisma.assessment.count({ where: { status: { in: ['REVIEWED', 'RESOLVED'] } } }),
    ]);

    const formattedCases = cases.map((c) => {
      let age = 30;
      if (c.patient.patientProfile?.dateOfBirth) {
        age = new Date().getFullYear() - new Date(c.patient.patientProfile.dateOfBirth).getFullYear();
      }

      let aiSummaryParsed = null;
      if (c.aiSummary) {
        try {
          aiSummaryParsed = JSON.parse(c.aiSummary);
        } catch {
          // ignore parsing error
        }
      }

      return {
        id: c.id,
        patientId: c.patient.id,
        patientName: c.patient.name,
        patientAge: age,
        patientGender: c.patient.patientProfile?.gender || 'Unknown',
        village: c.patient.patientProfile?.villageSector || 'Rampur',
        phone: c.patient.phone,
        submittedByName: c.submittedBy.name,
        submittedByRole: c.submittedBy.role,
        symptoms: c.symptoms,
        severity: c.severity,
        duration: c.duration,
        triageLevel: c.triageLevel,
        priority: c.priority,
        status: c.status,
        aiRecommendation: c.aiRecommendation,
        aiSummary: aiSummaryParsed,
        vitals: c.vitals,
        latestVitalsLog: c.vitalsLog[0] || null,
        latestConsultation: c.consultations[0] || null,
        createdAt: c.createdAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        cases: formattedCases,
        metrics: {
          total: totalCount,
          emergencyCount,
          visitPhcCount,
          videoConsultCount,
          pendingCount,
          reviewedCount,
        },
      },
      error: null,
    });
  } catch (error: any) {
    console.error('[getDoctorCases error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};

export const getDoctorCaseById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
            patientProfile: {
              select: {
                dateOfBirth: true,
                gender: true,
                villageSector: true,
                guardianContact: true,
              },
            },
          },
        },
        submittedBy: {
          select: {
            id: true,
            name: true,
            role: true,
            ashaProfile: {
              select: {
                sector: true,
                employeeId: true,
              },
            },
          },
        },
        vitalsLog: {
          orderBy: { recordedAt: 'desc' },
        },
        consultations: {
          orderBy: { scheduledAt: 'desc' },
          include: {
            doctor: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!assessment) {
      return res.status(404).json({ success: false, data: null, error: 'Assessment not found' });
    }

    let age = 30;
    if (assessment.patient.patientProfile?.dateOfBirth) {
      age = new Date().getFullYear() - new Date(assessment.patient.patientProfile.dateOfBirth).getFullYear();
    }

    let aiSummaryParsed = null;
    if (assessment.aiSummary) {
      try {
        aiSummaryParsed = JSON.parse(assessment.aiSummary);
      } catch {
        // ignore parsing error
      }
    }

    const formattedCase = {
      id: assessment.id,
      patientId: assessment.patient.id,
      patientName: assessment.patient.name,
      patientAge: age,
      patientGender: assessment.patient.patientProfile?.gender || 'Unknown',
      village: assessment.patient.patientProfile?.villageSector || 'Rampur',
      phone: assessment.patient.phone,
      submittedById: assessment.submittedById,
      submittedByName: assessment.submittedBy.name,
      submittedByRole: assessment.submittedBy.role,
      submittedBySector: assessment.submittedBy.ashaProfile?.sector || null,
      symptoms: assessment.symptoms,
      severity: assessment.severity,
      duration: assessment.duration,
      triageLevel: assessment.triageLevel,
      priority: assessment.priority,
      status: assessment.status,
      aiRecommendation: assessment.aiRecommendation,
      aiSummary: aiSummaryParsed,
      vitals: assessment.vitals,
      vitalsLog: assessment.vitalsLog,
      consultations: assessment.consultations,
      createdAt: assessment.createdAt,
    };

    return res.status(200).json({
      success: true,
      data: formattedCase,
      error: null,
    });
  } catch (error: any) {
    console.error('[getDoctorCaseById error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};

export const reviewDoctorCase = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const doctorId = req.user!.id;
    const { notes, action, status } = req.body;

    if (!notes || typeof notes !== 'string' || !notes.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Clinical review notes are required.' });
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return res.status(404).json({ success: false, data: null, error: 'Assessment not found' });
    }

    const newStatus: AssessmentStatus = status === 'RESOLVED' ? 'RESOLVED' : 'REVIEWED';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update assessment status
      const updatedAssessment = await tx.assessment.update({
        where: { id },
        data: {
          status: newStatus,
        },
      });

      // 2. Create consultation review record
      const fullNotes = action
        ? `[Action: ${action}] ${notes.trim()}`
        : notes.trim();

      const consultation = await tx.consultation.create({
        data: {
          assessmentId: id,
          doctorId,
          patientId: assessment.patientId,
          status: 'COMPLETED',
          scheduledAt: new Date(),
          notes: fullNotes,
        },
        include: {
          doctor: { select: { id: true, name: true } },
        },
      });

      return { updatedAssessment, consultation };
    });

    return res.status(200).json({
      success: true,
      data: {
        assessment: result.updatedAssessment,
        consultation: result.consultation,
      },
      message: 'Clinical case review signed and saved successfully.',
      error: null,
    });
  } catch (error: any) {
    console.error('[reviewDoctorCase error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};

export const getDoctorPatients = async (req: Request, res: Response) => {
  try {
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      select: {
        id: true,
        name: true,
        phone: true,
        createdAt: true,
        patientProfile: {
          select: {
            dateOfBirth: true,
            gender: true,
            villageSector: true,
          },
        },
        assessmentsAsPatient: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            triageLevel: true,
            priority: true,
            status: true,
            createdAt: true,
            symptoms: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const formatted = patients.map((p) => {
      let age = 30;
      if (p.patientProfile?.dateOfBirth) {
        age = new Date().getFullYear() - new Date(p.patientProfile.dateOfBirth).getFullYear();
      }
      const latest = p.assessmentsAsPatient[0] || null;

      return {
        id: p.id,
        name: p.name,
        phone: p.phone,
        age,
        gender: p.patientProfile?.gender || 'Unknown',
        village: p.patientProfile?.villageSector || 'Rampur',
        latestAssessment: latest,
      };
    });

    return res.status(200).json({
      success: true,
      data: formatted,
      error: null,
    });
  } catch (error: any) {
    console.error('[getDoctorPatients error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};

export const getDoctorConsultations = async (req: Request, res: Response) => {
  try {
    const consultations = await prisma.consultation.findMany({
      orderBy: { scheduledAt: 'desc' },
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            patientProfile: { select: { villageSector: true } },
          },
        },
        doctor: {
          select: { id: true, name: true },
        },
        assessment: {
          select: {
            id: true,
            triageLevel: true,
            priority: true,
            symptoms: true,
          },
        },
      },
    });

    const formatted = consultations.map((c) => ({
      id: c.id,
      patientId: c.patient.id,
      patientName: c.patient.name,
      village: c.patient.patientProfile?.villageSector || 'Rampur',
      doctorId: c.doctor.id,
      doctorName: c.doctor.name,
      assessmentId: c.assessmentId,
      triageLevel: c.assessment.triageLevel,
      symptoms: c.assessment.symptoms,
      date: c.scheduledAt,
      status: c.status,
      notes: c.notes,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
      error: null,
    });
  } catch (error: any) {
    console.error('[getDoctorConsultations error]:', error);
    return res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
};
