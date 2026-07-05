import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  
  // Patient specific
  dateOfBirth: z.string().datetime().optional(),
  gender: z.string().optional(),
  villageSector: z.string().optional(),
  guardianContact: z.string().optional(),

  // Asha specific
  sector: z.string().optional(),
  employeeId: z.string().optional(),

  // Doctor specific
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.role === 'PATIENT') {
    if (!data.dateOfBirth) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'dateOfBirth is required for patients', path: ['dateOfBirth'] });
    if (!data.gender) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'gender is required for patients', path: ['gender'] });
    if (!data.villageSector) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'villageSector is required for patients', path: ['villageSector'] });
  }
  if (data.role === 'ASHA') {
    if (!data.sector) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'sector is required for ASHA workers', path: ['sector'] });
    if (!data.employeeId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'employeeId is required for ASHA workers', path: ['employeeId'] });
  }
  if (data.role === 'DOCTOR') {
    if (!data.specialization) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'specialization is required for doctors', path: ['specialization'] });
    if (!data.licenseNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'licenseNumber is required for doctors', path: ['licenseNumber'] });
  }
});

export const loginSchema = z.object({
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const createAssessmentSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'At least one symptom must be provided'),
  notes: z.string().optional(),
});

export const wearableVitalsSchema = z.object({
  device: z.string().optional(),
  patientId: z.string().optional(),
  timestamp: z.string().optional(),
  heartRate: z.number().positive().optional(),
  restingHeartRate: z.number().positive().optional(),
  steps: z.number().nonnegative().optional(),
  distance: z.number().nonnegative().optional(),
  calories: z.number().nonnegative().optional(),
  sleepMinutes: z.number().nonnegative().optional(),
  spo2: z.number().positive().optional()
});
