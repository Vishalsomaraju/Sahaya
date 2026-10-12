import 'dotenv/config';
import { prisma } from '../src/utils/prisma';

const API_URL = 'http://localhost:5000/api';

async function runAshaWorkflowIntegrationTest() {
  console.log('--- Starting SAHAYA Phase 4: ASHA Workflow E2E Integration Test ---\n');

  try {
    // 1. Authenticate as registered ASHA worker
    console.log('[1/6] Authenticating as ASHA worker Rekha Devi...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: '9876543211',
        password: 'Password123!',
      }),
    });
    const loginData = await loginRes.json() as any;
    const ashaToken = loginData?.data?.token;
    const ashaUser = loginData?.data?.user;
    if (!ashaToken || ashaUser?.role !== 'ASHA') {
      throw new Error(`Failed to log in as ASHA worker: ${JSON.stringify(loginData)}`);
    }
    console.log(`  ✓ [PASS] ASHA logged in: ${ashaUser.name} (${ashaUser.id})\n`);

    const authHeaders = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ashaToken}`,
    };

    // 2. Fetch community patients
    console.log('[2/6] Querying GET /api/patient/community-patients as ASHA worker...');
    const patientsRes = await fetch(`${API_URL}/patient/community-patients`, {
      headers: authHeaders,
    });
    const patientsData = await patientsRes.json() as any;
    const patients = patientsData?.data;
    if (!Array.isArray(patients) || patients.length === 0) {
      throw new Error(`Expected array of community patients, received: ${JSON.stringify(patientsData)}`);
    }
    const samplePatient = patients[0];
    if (!samplePatient.id || !samplePatient.name || samplePatient.age === undefined) {
      throw new Error(`Patient record missing expected fields: ${JSON.stringify(samplePatient)}`);
    }
    console.log(`  ✓ [PASS] Retrieved ${patients.length} community patients (Sample: ${samplePatient.name}, Age: ${samplePatient.age}, Village: ${samplePatient.village})\n`);

    // 3. Register a new patient in the field
    console.log('[3/6] Registering a new community patient in the field...');
    const testPhone = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
    const regRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Field Patient Kamla Devi',
        phone: testPhone,
        password: 'Password123!',
        role: 'PATIENT',
        villageSector: 'Rampur',
        dateOfBirth: '1978-04-12T00:00:00.000Z',
        gender: 'female',
      }),
    });
    const regData = await regRes.json() as any;
    const newPatient = regData?.data?.user;
    if (!newPatient || !newPatient.id) {
      throw new Error(`Failed to register field patient: ${JSON.stringify(regData)}`);
    }
    console.log(`  ✓ [PASS] Registered new patient: ${newPatient.name} (ID: ${newPatient.id}, Phone: ${testPhone})\n`);

    // 4. Submit an ASHA field assessment with telemetry vitals
    console.log('[4/6] Submitting ASHA field assessment with vitals telemetry...');
    const assessmentPayload = {
      patientId: newPatient.id,
      symptoms: ['High fever', 'Severe productive cough', 'Shortness of breath'],
      severity: 'Severe',
      duration: '4 days',
      vitals: {
        heartRate: 118,
        spo2: 91, // Moderate hypoxia -> triggers VISIT_PHC / urgent review
        temperature: 102.4, // Fahrenheit
        bloodPressure: '138/88',
        source: 'asha_field',
      },
    };

    const submitRes = await fetch(`${API_URL}/patient/assessments`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(assessmentPayload),
    });
    const submitData = await submitRes.json() as any;
    const createdAssessment = submitData?.data;
    if (!createdAssessment || !createdAssessment.id) {
      throw new Error(`Failed to submit assessment: ${JSON.stringify(submitData)}`);
    }
    if (createdAssessment.submittedById !== ashaUser.id) {
      throw new Error(`Expected submittedById to be ${ashaUser.id}, got: ${createdAssessment.submittedById}`);
    }
    if (createdAssessment.triageLevel !== 'VISIT_PHC' && createdAssessment.triageLevel !== 'EMERGENCY') {
      throw new Error(`Unexpected triage level for SpO2 91% + severe fever: ${createdAssessment.triageLevel}`);
    }
    console.log(`  ✓ [PASS] Assessment created: ID: ${createdAssessment.id}, Triage: ${createdAssessment.triageLevel}, Priority: ${createdAssessment.priority}, SubmittedBy: ${createdAssessment.submittedById}\n`);

    // 5. Query ASHA assessments list
    console.log('[5/6] Querying GET /api/patient/assessments as ASHA worker...');
    const listRes = await fetch(`${API_URL}/patient/assessments`, {
      headers: authHeaders,
    });
    const listData = await listRes.json() as any;
    const assessmentList = listData?.data?.assessments || listData?.data;
    if (!Array.isArray(assessmentList)) {
      throw new Error(`Expected assessment array, got: ${JSON.stringify(listData)}`);
    }
    const found = assessmentList.find((a: any) => a.id === createdAssessment.id);
    if (!found) {
      throw new Error(`Newly created assessment not found in ASHA assessment list`);
    }
    const patientName = found.patient?.name || (found as any).patientName;
    const village = found.patient?.patientProfile?.villageSector || (found as any).village;
    if (!patientName || !village) {
      throw new Error(`Assessment list item missing patient name/village: ${JSON.stringify(found)}`);
    }
    console.log(`  ✓ [PASS] Assessment listed in ASHA queue (Patient: ${patientName}, Village: ${village}, Triage: ${found.triageLevel})\n`);

    // 6. Query assessment details and triage endpoint as ASHA worker
    console.log('[6/6] Verifying GET /api/patient/assessments/:id and /triage access...');
    const detailRes = await fetch(`${API_URL}/patient/assessments/${createdAssessment.id}`, {
      headers: authHeaders,
    });
    const detailData = await detailRes.json() as any;
    if (detailData?.data?.id !== createdAssessment.id) {
      throw new Error(`Detail endpoint returned mismatched id: ${JSON.stringify(detailData)}`);
    }
    if (!detailData?.data?.vitals || detailData?.data?.vitals.spo2 !== 91) {
      throw new Error(`Vitals not properly persisted or returned: ${JSON.stringify(detailData?.data?.vitals)}`);
    }

    const triageRes = await fetch(`${API_URL}/patient/assessments/${createdAssessment.id}/triage`, {
      headers: authHeaders,
    });
    const triageData = await triageRes.json() as any;
    const triage = triageData?.data?.triage || triageData?.data;
    if (!triage || !triage.triageLevel || !triage.recommendedAction) {
      throw new Error(`Triage endpoint missing triageLevel or recommendedAction: ${JSON.stringify(triageData)}`);
    }
    console.log(`  ✓ [PASS] Full triage payload retrieved (Level: ${triage.triageLevel}, Priority: ${triage.priority}, Action: "${triage.recommendedAction?.slice(0, 50)}...")\n`);

    console.log('--- Phase 4 ASHA Workflow Integration Test: ALL 6 CHECKS PASSED ---\n');
  } catch (err: any) {
    console.error('Test failed with error:', err.message || err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAshaWorkflowIntegrationTest();
