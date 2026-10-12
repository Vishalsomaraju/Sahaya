/**
 * SAHAYA Client API Client
 * Centralized HTTP service for backend triage and assessment communication.
 */

export const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, '') || 'http://localhost:5000';

const PATIENT_TOKEN_KEY = 'sahaya_patient_jwt';
const ASHA_TOKEN_KEY = 'sahaya_asha_jwt';
const DOCTOR_TOKEN_KEY = 'sahaya_doctor_jwt';
const LAST_ASSESSMENT_KEY = 'sahaya_last_assessment_id';

export interface AssessmentVitals {
  heartRate?: number;
  restingHeartRate?: number;
  spo2?: number;
  temperature?: number;
  bloodPressure?: string;
  device?: string;
  source?: 'manual' | 'wearable' | 'asha_field';
}

export interface CreateAssessmentPayload {
  patientId?: string;
  symptoms: string[];
  severity?: 'Mild' | 'Moderate' | 'Severe';
  duration?: string;
  vitals?: AssessmentVitals;
  notes?: string;
}

export interface TriageResultData {
  triageLevel: 'EMERGENCY' | 'VISIT_PHC' | 'VIDEO_CONSULT' | 'SELF_CARE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  reasoning: string[];
  nextSteps: string[];
  limitations: string[];
  escalationGuidance: string;
  vitalsAssessment?: {
    recorded: boolean;
    summary: string;
    warnings?: string[];
    invalidVitals?: string[];
  };
  disclaimer: string;
}

export interface AssessmentRecord {
  id: string;
  patientId: string;
  submittedById?: string;
  symptoms: string[];
  severity?: string | null;
  duration?: string | null;
  triageLevel?: 'EMERGENCY' | 'VISIT_PHC' | 'VIDEO_CONSULT' | 'SELF_CARE' | null;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  vitals?: AssessmentVitals | null;
  aiRecommendation?: string | null;
  aiSummary?: string | null;
  status: string;
  createdAt: string;
  vitalsLog?: any[];
  submittedBy?: {
    id: string;
    name: string;
    role: string;
  };
  patient?: {
    id: string;
    name: string;
    patientProfile?: {
      villageSector?: string;
      dateOfBirth?: string;
    };
  };
}

export interface CreateAssessmentResponse {
  success: boolean;
  data: AssessmentRecord;
  triage: TriageResultData;
  error: any;
}

export interface CommunityPatientRecord {
  id: string;
  name: string;
  age: number;
  village: string;
  gender?: string;
  phone?: string;
}

export interface DoctorCaseItem {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  village: string;
  phone: string;
  submittedByName: string;
  submittedByRole: string;
  symptoms: string[];
  severity?: string | null;
  duration?: string | null;
  triageLevel: 'EMERGENCY' | 'VISIT_PHC' | 'VIDEO_CONSULT' | 'SELF_CARE';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED';
  aiRecommendation?: string | null;
  aiSummary?: {
    triageLevel?: string;
    reasoning?: string[];
    nextSteps?: string[];
    limitations?: string[];
    escalationGuidance?: string;
    vitalsAssessment?: {
      recorded?: boolean;
      summary?: string;
      warnings?: string[];
      invalidVitals?: string[];
    };
  } | null;
  vitals?: AssessmentVitals | null;
  latestVitalsLog?: any;
  latestConsultation?: any;
  createdAt: string;
}

export interface DoctorCasesResponse {
  cases: DoctorCaseItem[];
  metrics: {
    total: number;
    emergencyCount: number;
    visitPhcCount: number;
    videoConsultCount: number;
    pendingCount: number;
    reviewedCount: number;
  };
}

export interface DoctorPatientRecord {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  village: string;
  latestAssessment?: {
    id: string;
    triageLevel: string;
    priority: string;
    status: string;
    createdAt: string;
    symptoms: string[];
  } | null;
}

export interface DoctorConsultationRecord {
  id: string;
  patientId: string;
  patientName: string;
  village: string;
  doctorId: string;
  doctorName: string;
  assessmentId: string;
  triageLevel: string;
  symptoms: string[];
  date: string;
  status: string;
  notes: string;
}

export type RoleType = 'PATIENT' | 'ASHA' | 'DOCTOR';

function getStorageKey(role: RoleType): string {
  if (role === 'DOCTOR') return DOCTOR_TOKEN_KEY;
  if (role === 'ASHA') return ASHA_TOKEN_KEY;
  return PATIENT_TOKEN_KEY;
}

export function getStoredToken(role: RoleType = 'PATIENT'): string | null {
  try {
    return localStorage.getItem(getStorageKey(role));
  } catch {
    return null;
  }
}

export function setStoredToken(token: string, role: RoleType = 'PATIENT'): void {
  try {
    localStorage.setItem(getStorageKey(role), token);
  } catch (err) {
    console.error('Failed to save token to localStorage:', err);
  }
}

export function clearStoredToken(role?: RoleType): void {
  try {
    if (!role || role === 'PATIENT') localStorage.removeItem(PATIENT_TOKEN_KEY);
    if (!role || role === 'ASHA') localStorage.removeItem(ASHA_TOKEN_KEY);
    if (!role || role === 'DOCTOR') localStorage.removeItem(DOCTOR_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function saveLastAssessmentId(id: string): void {
  try {
    localStorage.setItem(LAST_ASSESSMENT_KEY, id);
  } catch {
    // Ignore storage errors
  }
}

export function getLastAssessmentId(): string | null {
  try {
    return localStorage.getItem(LAST_ASSESSMENT_KEY);
  } catch {
    return null;
  }
}

/**
 * Ensures a valid JWT token for patient role.
 */
export async function ensurePatientToken(): Promise<string> {
  const existingToken = getStoredToken('PATIENT');

  if (existingToken) {
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${existingToken}` }
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.data?.role === 'PATIENT') {
          return existingToken;
        }
      }
    } catch {
      // Continue to re-authentication below
    }
    clearStoredToken('PATIENT');
  }

  // 1. Try login with patient credentials
  try {
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543210',
        password: 'Password123!'
      })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      if (loginData.data?.token) {
        setStoredToken(loginData.data.token, 'PATIENT');
        return loginData.data.token;
      }
    }
  } catch (err) {
    console.warn('[SAHAYA API] Patient auto-login failed:', err);
  }

  // 2. Fallback: Register patient if user does not exist yet
  try {
    const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Kumar',
        phone: '9876543210',
        password: 'Password123!',
        role: 'PATIENT',
        dateOfBirth: '1998-05-15T00:00:00.000Z',
        gender: 'male',
        villageSector: 'Lucknow'
      })
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      if (regData.data?.token) {
        setStoredToken(regData.data.token, 'PATIENT');
        return regData.data.token;
      }
    }
  } catch (err) {
    console.error('[SAHAYA API] Patient registration failed:', err);
  }

  throw new Error('Unable to authenticate patient session. Please ensure the backend server is running and reachable.');
}

/**
 * Ensures a valid JWT token for ASHA field worker role.
 */
export async function ensureAshaToken(): Promise<string> {
  const existingToken = getStoredToken('ASHA');

  if (existingToken) {
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${existingToken}` }
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.data?.role === 'ASHA') {
          return existingToken;
        }
      }
    } catch {
      // Continue to re-authentication below
    }
    clearStoredToken('ASHA');
  }

  // 1. Try login with ASHA credentials
  try {
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543211',
        password: 'Password123!'
      })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      if (loginData.data?.token) {
        setStoredToken(loginData.data.token, 'ASHA');
        return loginData.data.token;
      }
    }
  } catch (err) {
    console.warn('[SAHAYA API] ASHA auto-login failed:', err);
  }

  // 2. Fallback: Register ASHA worker if user does not exist yet
  try {
    const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Rekha Devi',
        phone: '9876543211',
        password: 'Password123!',
        role: 'ASHA',
        sector: 'Rampur',
        employeeId: 'ASHA-RAMPUR-001'
      })
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      if (regData.data?.token) {
        setStoredToken(regData.data.token, 'ASHA');
        return regData.data.token;
      }
    }
  } catch (err) {
    console.error('[SAHAYA API] ASHA registration failed:', err);
  }

  throw new Error('Unable to authenticate ASHA session. Please ensure the backend server is running and reachable.');
}

/**
 * Ensures a valid JWT token for Primary Healthcare Physician (DOCTOR) role.
 */
export async function ensureDoctorToken(): Promise<string> {
  const existingToken = getStoredToken('DOCTOR');

  if (existingToken) {
    try {
      const verifyRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${existingToken}` }
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        if (verifyData.data?.role === 'DOCTOR') {
          return existingToken;
        }
      }
    } catch {
      // Continue to re-authentication below
    }
    clearStoredToken('DOCTOR');
  }

  // 1. Try login with doctor credentials
  try {
    const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543212',
        password: 'Password123!'
      })
    });

    if (loginRes.ok) {
      const loginData = await loginRes.json();
      if (loginData.data?.token) {
        setStoredToken(loginData.data.token, 'DOCTOR');
        return loginData.data.token;
      }
    }
  } catch (err) {
    console.warn('[SAHAYA API] Doctor auto-login failed:', err);
  }

  // 2. Fallback: Register doctor if not existing
  try {
    const regRes = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Dr. Priya Sharma',
        phone: '9876543212',
        password: 'Password123!',
        role: 'DOCTOR',
        specialization: 'General Medicine',
        licenseNumber: 'DOC-RAMPUR-001'
      })
    });

    if (regRes.ok) {
      const regData = await regRes.json();
      if (regData.data?.token) {
        setStoredToken(regData.data.token, 'DOCTOR');
        return regData.data.token;
      }
    }
  } catch (err) {
    console.error('[SAHAYA API] Doctor registration failed:', err);
  }

  throw new Error('Unable to authenticate doctor session. Please ensure the backend server is running and reachable.');
}

/**
 * Submits an assessment from a patient
 */
export async function submitAssessment(payload: CreateAssessmentPayload): Promise<CreateAssessmentResponse> {
  const token = await ensurePatientToken();
  return executeAssessmentSubmission(payload, token);
}

/**
 * Submits an assessment from an ASHA field worker
 */
export async function submitAshaAssessment(payload: CreateAssessmentPayload): Promise<CreateAssessmentResponse> {
  const token = await ensureAshaToken();
  return executeAssessmentSubmission(payload, token);
}

async function executeAssessmentSubmission(payload: CreateAssessmentPayload, token: string): Promise<CreateAssessmentResponse> {
  const response = await fetch(`${API_BASE_URL}/api/patient/assessments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    let errorMessage = 'Failed to submit clinical assessment';
    if (data?.error) {
      if (Array.isArray(data.error)) {
        errorMessage = data.error.map((e: any) => `${e.field ? e.field + ': ' : ''}${e.message}`).join(', ');
      } else if (typeof data.error === 'string') {
        errorMessage = data.error;
      }
    } else if (data?.message) {
      errorMessage = data.message;
    }
    throw new Error(errorMessage);
  }

  if (data?.data?.id) {
    saveLastAssessmentId(data.data.id);
  }

  return data as CreateAssessmentResponse;
}

/**
 * Fetches persisted assessment by ID: GET /api/patient/assessments/:id
 */
export async function getAssessmentById(id: string, role: RoleType = 'PATIENT'): Promise<AssessmentRecord> {
  const token = role === 'DOCTOR' 
    ? await ensureDoctorToken() 
    : role === 'ASHA' 
    ? await ensureAshaToken() 
    : await ensurePatientToken();

  const response = await fetch(`${API_BASE_URL}/api/patient/assessments/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || `Assessment with ID "${id}" could not be retrieved.`);
  }

  return data.data as AssessmentRecord;
}

/**
 * Fetches structured triage details: GET /api/patient/assessments/:id/triage
 */
export async function getTriageResultById(id: string, role: RoleType = 'PATIENT'): Promise<TriageResultData> {
  const token = role === 'DOCTOR' 
    ? await ensureDoctorToken() 
    : role === 'ASHA' 
    ? await ensureAshaToken() 
    : await ensurePatientToken();

  const response = await fetch(`${API_BASE_URL}/api/patient/assessments/${encodeURIComponent(id)}/triage`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || `Triage result for assessment "${id}" could not be retrieved.`);
  }

  return data.data as TriageResultData;
}

/**
 * Fetches community patients directory for ASHA workers: GET /api/patient/community-patients
 */
export async function getCommunityPatients(): Promise<CommunityPatientRecord[]> {
  const token = await ensureAshaToken();

  const response = await fetch(`${API_BASE_URL}/api/patient/community-patients`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || 'Failed to retrieve community patients directory.');
  }

  return data.data as CommunityPatientRecord[];
}

/**
 * Registers a new patient into the community registry: POST /api/auth/register
 */
export async function registerCommunityPatient(patient: {
  name: string;
  age: number;
  village: string;
  gender?: string;
  phone?: string;
}): Promise<CommunityPatientRecord> {
  const birthYear = new Date().getFullYear() - (patient.age || 30);
  const dateOfBirth = new Date(birthYear, 0, 1).toISOString();
  const phone = patient.phone || `98${Math.floor(10000000 + Math.random() * 90000000)}`;

  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: patient.name.trim(),
      phone,
      password: 'Password123!',
      role: 'PATIENT',
      dateOfBirth,
      gender: patient.gender || 'unspecified',
      villageSector: patient.village || 'Rampur'
    })
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data?.user) {
    let message = 'Failed to register patient';
    if (data?.message) message = data.message;
    throw new Error(message);
  }

  return {
    id: data.data.user.id,
    name: data.data.user.name,
    age: patient.age,
    village: patient.village,
    gender: patient.gender,
    phone
  };
}

/**
 * Fetches all field assessments submitted by or visible to the ASHA worker
 */
export async function getAshaAssessments(): Promise<AssessmentRecord[]> {
  const token = await ensureAshaToken();

  const response = await fetch(`${API_BASE_URL}/api/patient/assessments?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data?.assessments) {
    throw new Error(data?.error || data?.message || 'Failed to load ASHA assessments');
  }

  return data.data.assessments as AssessmentRecord[];
}

/**
 * Fetches all assessments submitted by the logged-in patient
 */
export async function getPatientAssessments(): Promise<AssessmentRecord[]> {
  const token = await ensurePatientToken();

  const response = await fetch(`${API_BASE_URL}/api/patient/assessments?limit=50`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data?.assessments) {
    throw new Error(data?.error || data?.message || 'Failed to load patient assessments');
  }

  return data.data.assessments as AssessmentRecord[];
}

/**
 * DOCTOR: Fetches clinical case queue with summary metrics: GET /api/doctor/cases
 */
export async function getDoctorCases(params?: {
  status?: string;
  urgency?: string;
  search?: string;
}): Promise<DoctorCasesResponse> {
  const token = await ensureDoctorToken();

  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.append('status', params.status);
  if (params?.urgency) searchParams.append('urgency', params.urgency);
  if (params?.search) searchParams.append('search', params.search);

  const qs = searchParams.toString();
  const url = `${API_BASE_URL}/api/doctor/cases${qs ? `?${qs}` : ''}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || 'Failed to retrieve doctor case queue.');
  }

  return data.data as DoctorCasesResponse;
}

/**
 * DOCTOR: Fetches specific case review detail: GET /api/doctor/cases/:id
 */
export async function getDoctorCaseById(id: string): Promise<DoctorCaseItem> {
  const token = await ensureDoctorToken();

  const response = await fetch(`${API_BASE_URL}/api/doctor/cases/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || `Failed to retrieve case "${id}".`);
  }

  return data.data as DoctorCaseItem;
}

/**
 * DOCTOR: Signs and saves a clinical review and order: POST /api/doctor/cases/:id/review
 */
export async function reviewDoctorCase(
  id: string,
  payload: {
    notes: string;
    action?: string;
    status?: 'REVIEWED' | 'RESOLVED';
  }
): Promise<{ assessment: any; consultation: any }> {
  const token = await ensureDoctorToken();

  const response = await fetch(`${API_BASE_URL}/api/doctor/cases/${encodeURIComponent(id)}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || 'Failed to save clinical case review.');
  }

  return data.data;
}

/**
 * DOCTOR: Fetches registered patients directory: GET /api/doctor/patients
 */
export async function getDoctorPatients(): Promise<DoctorPatientRecord[]> {
  const token = await ensureDoctorToken();

  const response = await fetch(`${API_BASE_URL}/api/doctor/patients`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || 'Failed to retrieve patient directory.');
  }

  return data.data as DoctorPatientRecord[];
}

/**
 * DOCTOR: Fetches consultations archive: GET /api/doctor/consultations
 */
export async function getDoctorConsultations(): Promise<DoctorConsultationRecord[]> {
  const token = await ensureDoctorToken();

  const response = await fetch(`${API_BASE_URL}/api/doctor/consultations`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.data) {
    throw new Error(data?.error || data?.message || 'Failed to retrieve consultation records.');
  }

  return data.data as DoctorConsultationRecord[];
}
