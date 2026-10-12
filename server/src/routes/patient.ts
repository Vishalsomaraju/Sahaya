import { Router } from 'express';
import { 
  getDashboard, 
  createAssessment, 
  getAssessments, 
  getAssessmentById, 
  getReminders, 
  getTriageResult, 
  recordWearableVitals, 
  getLatestVitals, 
  getVitalsHistory,
  getCommunityPatients
} from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkAssessmentOwnership } from '../middleware/ownershipMiddleware';

const router = Router();

// Unauthenticated endpoint for the hackathon wearable integration
router.post('/vitals', recordWearableVitals);
router.get('/:id/latest-vitals', getLatestVitals);
router.get('/:id/vitals', getVitalsHistory);

// Protect all below routes: MUST be authenticated
router.use(authenticate);

// Patient-only personal dashboard & reminders
router.get('/dashboard', authorize(['PATIENT']), getDashboard);
router.get('/reminders', authorize(['PATIENT']), getReminders);

// Assessment lifecycle: accessible by PATIENT and ASHA field workers (and DOCTORS for review)
router.post('/assessments', authorize(['PATIENT', 'ASHA']), createAssessment);
router.get('/assessments', authorize(['PATIENT', 'ASHA', 'DOCTOR']), getAssessments);
router.get('/assessments/:id', authorize(['PATIENT', 'ASHA', 'DOCTOR']), checkAssessmentOwnership, getAssessmentById);
router.get('/assessments/:id/triage', authorize(['PATIENT', 'ASHA', 'DOCTOR']), checkAssessmentOwnership, getTriageResult);

// ASHA field workers: directory of community patients
router.get('/community-patients', authorize(['ASHA']), getCommunityPatients);

export default router;
