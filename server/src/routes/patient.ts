import { Router } from 'express';
import { getDashboard, createAssessment, getAssessments, getAssessmentById, getReminders, getTriageResult, recordWearableVitals, getLatestVitals, getVitalsHistory } from '../controllers/patientController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { checkAssessmentOwnership } from '../middleware/ownershipMiddleware';

const router = Router();

// Unauthenticated endpoint for the hackathon wearable integration
router.post('/vitals', recordWearableVitals);
router.get('/:id/latest-vitals', getLatestVitals);
router.get('/:id/vitals', getVitalsHistory);

// Protect all routes: MUST be logged in and MUST be a PATIENT
router.use(authenticate);
router.use(authorize(['PATIENT']));

router.get('/dashboard', getDashboard);
router.get('/reminders', getReminders);

router.post('/assessments', createAssessment);
router.get('/assessments', getAssessments);
router.get('/assessments/:id', checkAssessmentOwnership, getAssessmentById);
router.get('/assessments/:id/triage', checkAssessmentOwnership, getTriageResult);

export default router;
