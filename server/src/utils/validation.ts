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

export const assessmentVitalsSchema = z.object({
  heartRate: z.number().int().min(25, 'Heart rate must be at least 25 bpm').max(250, 'Heart rate must not exceed 250 bpm').optional(),
  restingHeartRate: z.number().int().min(25).max(250).optional(),
  spo2: z.number().min(50, 'SpO2 must be at least 50%').max(100, 'SpO2 must not exceed 100%').optional(),
  temperature: z.number().refine(
    (v) => (v >= 30 && v <= 46) || (v >= 85 && v <= 115),
    'Temperature must be physiologically plausible (30°C-46°C or 85°F-115°F)'
  ).optional(),
  bloodPressure: z.string().trim().refine(
    (val) => {
      const match = val.match(/^(\d{2,3})\s*[/]\s*(\d{2,3})$/);
      if (!match) return false;
      const sys = parseInt(match[1], 10);
      const dia = parseInt(match[2], 10);
      return sys >= 50 && sys <= 280 && dia >= 30 && dia <= 180 && sys > dia;
    },
    'Blood pressure must be in standard systolic/diastolic format (e.g. 120/80) with systolic > diastolic'
  ).optional(),
  device: z.string().max(100).optional(),
  source: z.enum(['manual', 'wearable', 'asha_field']).optional(),
}).strict();

export const createAssessmentSchema = z.object({
  patientId: z.string().uuid('Invalid patient ID format').optional(),
  symptoms: z.array(
    z.string().trim().min(2, 'Each symptom must be at least 2 characters').max(100, 'Symptom name is too long')
  ).min(1, 'At least one symptom must be provided').max(30, 'Cannot exceed 30 symptoms'),
  severity: z.enum(['Mild', 'Moderate', 'Severe', 'mild', 'moderate', 'severe'], {
    message: "Severity must be 'Mild', 'Moderate', or 'Severe'"
  }).transform((val) => {
    const lower = val.toLowerCase();
    return (lower.charAt(0).toUpperCase() + lower.slice(1)) as 'Mild' | 'Moderate' | 'Severe';
  }).optional(),
  duration: z.string().trim().max(100, 'Duration description is too long').optional(),
  vitals: assessmentVitalsSchema.optional().nullable(),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional(),
}).strict();

export const wearableVitalsSchema = z.object({
  device: z.string().optional(),
  patientId: z.string().optional(),
  timestamp: z.string().optional(),
  heartRate: z.number().min(25, 'Heart rate must be between 25 and 250 bpm').max(250, 'Heart rate must be between 25 and 250 bpm').optional(),
  restingHeartRate: z.number().min(25).max(250).optional(),
  steps: z.number().nonnegative().optional(),
  distance: z.number().nonnegative().optional(),
  calories: z.number().nonnegative().optional(),
  sleepMinutes: z.number().nonnegative().optional(),
  spo2: z.number().min(50, 'SpO2 must be between 50% and 100%').max(100, 'SpO2 must be between 50% and 100%').optional(),
  temperature: z.number().optional(),
  bloodPressure: z.string().optional(),
});


