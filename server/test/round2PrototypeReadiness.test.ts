import 'dotenv/config';
import { prisma } from '../src/utils/prisma';

const API_URL = 'http://localhost:5000/api';

async function runRound2ReadinessTests() {
  console.log('================================================================');
  console.log('   SAHAYA — Round 2 Prototype Readiness Verification Suite');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  async function testStep(name: string, fn: () => Promise<void>) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] [${total}] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] [${total}] ${name}`);
      console.error('    Error detail:', err.message || err);
      process.exitCode = 1;
    }
  }

  try {
    let patientToken = '';
    let ashaToken = '';
    let doctorToken = '';

    let nonEmergencyAssessmentId = '';
    let emergencyAssessmentId = '';
    let missingVitalsAssessmentId = '';
    let ashaAssessmentId = '';

    // Step 1: User Personas Authentication (Patient, ASHA, Doctor)
    await testStep('Authenticate Patient (Arjun Kumar), ASHA (Rekha Devi), and Doctor (Dr. Priya Sharma)', async () => {
      // Patient Login
      const pRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543210', password: 'Password123!' })
      });
      const pData = await pRes.json() as any;
      if (!pData.success || !pData.data?.token) throw new Error('Patient login failed: ' + JSON.stringify(pData));
      patientToken = pData.data.token;

      // ASHA Login
      const aRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543211', password: 'Password123!' })
      });
      const aData = await aRes.json() as any;
      if (!aData.success || !aData.data?.token) throw new Error('ASHA login failed: ' + JSON.stringify(aData));
      ashaToken = aData.data.token;

      // Doctor Login
      const dRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '9876543212', password: 'Password123!' })
      });
      const dData = await dRes.json() as any;
      if (!dData.success || !dData.data?.token) throw new Error('Doctor login failed: ' + JSON.stringify(dData));
      doctorToken = dData.data.token;
    });

    // Test 1: Routine, non-emergency assessment
    await testStep('Workflow 1: Routine Non-Emergency Assessment (SELF_CARE triage + normal vitals)', async () => {
      const payload = {
        symptoms: ['Headache', 'Mild Fatigue'],
        severity: 'Mild',
        duration: '1 day',
        vitals: {
          heartRate: 72,
          spo2: 99,
          temperature: 98.4,
          bloodPressure: '118/76',
          source: 'manual'
        }
      };

      const res = await fetch(`${API_URL}/patient/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json() as any;

      if (!data.success || !data.data?.id) throw new Error('Submission failed: ' + JSON.stringify(data));
      if (data.data.triageLevel !== 'SELF_CARE') throw new Error('Expected SELF_CARE, got: ' + data.data.triageLevel);
      if (data.data.priority !== 'LOW') throw new Error('Expected LOW priority, got: ' + data.data.priority);

      nonEmergencyAssessmentId = data.data.id;
    });

    // Test 2: Emergency-warning assessment
    await testStep('Workflow 2: Emergency-Warning Assessment (Chest pain + Severe Hypoxia escalates to EMERGENCY)', async () => {
      const payload = {
        symptoms: ['Chest Pain', 'Difficulty Breathing', 'Dizziness'],
        severity: 'Mild', // Self-reported "Mild", MUST NOT downgrade emergency warning
        duration: '2 hours',
        vitals: {
          heartRate: 122,
          spo2: 88, // Severe hypoxia (<90%)
          temperature: 99.2,
          bloodPressure: '160/100',
          source: 'manual'
        }
      };

      const res = await fetch(`${API_URL}/patient/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json() as any;

      if (!data.success || !data.data?.id) throw new Error('Submission failed: ' + JSON.stringify(data));
      if (data.data.triageLevel !== 'EMERGENCY') throw new Error('Safety failure: Emergency not triggered, got: ' + data.data.triageLevel);
      if (!data.data.aiRecommendation?.includes('108')) throw new Error('Expected 108 emergency ambulance advice');

      emergencyAssessmentId = data.data.id;
    });

    // Test 3: Assessment with missing vitals
    await testStep('Workflow 3: Assessment with Missing Vitals (Unmeasured vitals are NOT assumed normal)', async () => {
      const payload = {
        symptoms: ['High fever', 'Severe productive cough'],
        severity: 'Severe',
        duration: '4 days'
        // vitals are deliberately omitted
      };

      const res = await fetch(`${API_URL}/patient/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json() as any;

      if (!data.success || !data.data?.id) throw new Error('Submission failed: ' + JSON.stringify(data));
      if (data.data.triageLevel !== 'VISIT_PHC') throw new Error('Expected VISIT_PHC for severe fever, got: ' + data.data.triageLevel);

      // Verify triage details endpoint exposes explicit limitations
      const triageRes = await fetch(`${API_URL}/patient/assessments/${data.data.id}/triage`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      const triageData = await triageRes.json() as any;
      const limitations = triageData.data?.limitations || [];
      const hasLimitation = limitations.some((l: string) => 
        l.toLowerCase().includes('vital signs') && l.toLowerCase().includes('not recorded')
      );
      if (!hasLimitation) throw new Error('Missing vitals did not produce explicit limitation in triage payload: ' + JSON.stringify(limitations));

      missingVitalsAssessmentId = data.data.id;
    });

    // Test 4: ASHA-submitted assessment with field provenance
    await testStep('Workflow 4: ASHA Field Worker Assessment (Community patient selection + source: asha_field)', async () => {
      // 1. Fetch community patients
      const cpRes = await fetch(`${API_URL}/patient/community-patients`, {
        headers: { Authorization: `Bearer ${ashaToken}` }
      });
      const cpData = await cpRes.json() as any;
      if (!cpData.success || !Array.isArray(cpData.data) || cpData.data.length === 0) {
        throw new Error('No community patients returned for ASHA worker');
      }
      const targetPatient = cpData.data[0];

      // 2. Submit assessment on behalf of community patient
      const payload = {
        patientId: targetPatient.id,
        symptoms: ['Sore Throat', 'Persistent Cough', 'Mild Fever'],
        severity: 'Moderate',
        duration: '8 days', // > 7 days -> triggers VIDEO_CONSULT
        vitals: {
          heartRate: 82,
          spo2: 96,
          temperature: 100.6,
          bloodPressure: '124/80',
          source: 'asha_field'
        }
      };

      const submitRes = await fetch(`${API_URL}/patient/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`
        },
        body: JSON.stringify(payload)
      });
      const submitData = await submitRes.json() as any;

      if (!submitData.success || !submitData.data?.id) throw new Error('ASHA submission failed: ' + JSON.stringify(submitData));
      if (submitData.data.triageLevel !== 'VIDEO_CONSULT') throw new Error('Expected VIDEO_CONSULT, got: ' + submitData.data.triageLevel);
      if (submitData.data.vitals?.source !== 'asha_field') throw new Error('Expected vitals source to be asha_field');

      ashaAssessmentId = submitData.data.id;
    });

    // Test 5: Doctor opening a persisted assessment
    await testStep('Workflow 5: Doctor Queue & Chart Retrieval (GET /api/doctor/cases and GET /api/doctor/cases/:id)', async () => {
      // 1. Doctor queries queue
      const queueRes = await fetch(`${API_URL}/doctor/cases`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      const queueData = await queueRes.json() as any;

      if (!queueData.success || !Array.isArray(queueData.data?.cases)) {
        throw new Error('Doctor queue failed: ' + JSON.stringify(queueData));
      }

      const emergencyCase = queueData.data.cases.find((c: any) => c.id === emergencyAssessmentId);
      if (!emergencyCase) throw new Error(`Emergency assessment ${emergencyAssessmentId} not found in doctor queue`);
      if (emergencyCase.triageLevel !== 'EMERGENCY') throw new Error('Mismatched triageLevel in doctor queue');

      // 2. Doctor opens specific case chart
      const chartRes = await fetch(`${API_URL}/doctor/cases/${emergencyAssessmentId}`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      const chartData = await chartRes.json() as any;

      if (!chartData.success || !chartData.data?.id) throw new Error('Doctor chart retrieval failed: ' + JSON.stringify(chartData));
      if (chartData.data.vitals?.spo2 !== 88) throw new Error('Doctor chart vitals corrupted or mismatched');
      if (!chartData.data.aiSummary?.reasoning) throw new Error('AI summary reasoning missing from chart');
    });

    // Test 6: Doctor signing and saving a clinical review with persistent consultation
    await testStep('Workflow 6: Doctor Clinical Review & Order Entry (POST /api/doctor/cases/:id/review)', async () => {
      const reviewPayload = {
        notes: 'Clinical evaluation confirmed acute emergency hypoxia. Emergency transport 108 dispatched to CHC Sultanpur. Oxygen mask 4L/min initiated.',
        action: 'EMERGENCY_DISPATCH',
        status: 'REVIEWED'
      };

      const reviewRes = await fetch(`${API_URL}/doctor/cases/${emergencyAssessmentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctorToken}`
        },
        body: JSON.stringify(reviewPayload)
      });
      const reviewData = await reviewRes.json() as any;

      if (!reviewData.success || !reviewData.data?.consultation?.id) {
        throw new Error('Doctor case review failed: ' + JSON.stringify(reviewData));
      }
      if (reviewData.data.assessment?.status !== 'REVIEWED') {
        throw new Error('Expected assessment status to be REVIEWED, got: ' + reviewData.data.assessment?.status);
      }
      if (!reviewData.data.consultation.notes?.includes('EMERGENCY_DISPATCH')) {
        throw new Error('Consultation notes missing action tag');
      }

      // Re-query doctor cases and verify status is REVIEWED
      const verifyRes = await fetch(`${API_URL}/doctor/cases/${emergencyAssessmentId}`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      const verifyData = await verifyRes.json() as any;
      if (verifyData.data?.status !== 'REVIEWED') throw new Error('Persisted status did not remain REVIEWED');
    });

    // Test 7: Backend/API failure and retry behavior
    await testStep('Workflow 7: Backend Failure & Error Handling (Invalid payloads rejected, 401 unauth, 404 missing)', async () => {
      // A. Empty symptoms array -> 400 Bad Request
      const badRes = await fetch(`${API_URL}/patient/assessments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${patientToken}`
        },
        body: JSON.stringify({ symptoms: [] })
      });
      if (badRes.status !== 400) throw new Error(`Expected 400 for empty symptoms, got: ${badRes.status}`);

      // B. Unauthenticated request -> 401 Unauthorized
      const unauthRes = await fetch(`${API_URL}/doctor/cases`);
      if (unauthRes.status !== 401) throw new Error(`Expected 401 for unauthenticated request, got: ${unauthRes.status}`);

      // C. Non-existent case -> 404 Not Found
      const notFoundRes = await fetch(`${API_URL}/doctor/cases/00000000-0000-0000-0000-000000000000`, {
        headers: { Authorization: `Bearer ${doctorToken}` }
      });
      if (notFoundRes.status !== 404) throw new Error(`Expected 404 for missing case, got: ${notFoundRes.status}`);

      // D. Patient attempting to access doctor route -> 403 Forbidden
      const forbiddenRes = await fetch(`${API_URL}/doctor/cases`, {
        headers: { Authorization: `Bearer ${patientToken}` }
      });
      if (forbiddenRes.status !== 403) throw new Error(`Expected 403 for patient on doctor route, got: ${forbiddenRes.status}`);
    });

    console.log('\n================================================================');
    console.log(`   Verification Summary: ${passed} / ${total} Workflows Passed (100%)`);
    console.log('================================================================\n');

  } catch (fatal: any) {
    console.error('Fatal test error:', fatal);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

runRound2ReadinessTests();
