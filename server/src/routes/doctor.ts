import { Router } from 'express';
import { 
  getDoctorCases, 
  getDoctorCaseById, 
  reviewDoctorCase, 
  getDoctorPatients, 
  getDoctorConsultations 
} from '../controllers/doctorController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Doctor routes require active authentication with DOCTOR role
router.use(authenticate);
router.use(authorize(['DOCTOR']));

// Clinical case management
router.get('/cases', getDoctorCases);
router.get('/cases/:id', getDoctorCaseById);
router.post('/cases/:id/review', reviewDoctorCase);

// Doctor directory lookups
router.get('/patients', getDoctorPatients);
router.get('/consultations', getDoctorConsultations);

export default router;
