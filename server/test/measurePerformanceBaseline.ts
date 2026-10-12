import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

async function timeRequest(
  name: string,
  fn: () => Promise<Response>,
  runs = 3
): Promise<{ name: string; status: number; avgMs: number; minMs: number; maxMs: number; sizeBytes: number }> {
  const times: number[] = [];
  let lastStatus = 0;
  let lastSize = 0;

  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    const res = await fn();
    const text = await res.text();
    const duration = performance.now() - start;
    times.push(duration);
    lastStatus = res.status;
    lastSize = text.length;
    if (!res.ok) {
      console.warn(`[WARN] ${name} returned non-200: ${res.status} - ${text.slice(0, 100)}`);
    }
  }

  const avgMs = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  const minMs = Math.round(Math.min(...times));
  const maxMs = Math.round(Math.max(...times));
  return { name, status: lastStatus, avgMs, minMs, maxMs, sizeBytes: lastSize };
}

async function runBaselineBenchmark() {
  console.log('================================================================');
  console.log('   SAHAYA — Phase 5 Performance Baseline Measurement');
  console.log('================================================================\n');

  // 1. Authenticate users to acquire tokens
  console.log('Step 1: Logging in users...');
  const patientRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543210', password: 'Password123!' })
  });
  const patientData = await patientRes.json() as any;
  const patientToken = patientData.data?.token;

  const ashaRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543211', password: 'Password123!' })
  });
  const ashaData = await ashaRes.json() as any;
  const ashaToken = ashaData.data?.token;

  const docRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876543212', password: 'Password123!' })
  });
  const docData = await docRes.json() as any;
  const docToken = docData.data?.token;

  if (!patientToken || !ashaToken || !docToken) {
    throw new Error(`Failed to acquire tokens! Patient: ${!!patientToken}, ASHA: ${!!ashaToken}, Doc: ${!!docToken}`);
  }
  console.log('Tokens successfully acquired for Patient, ASHA, and Doctor.\n');

  // Retrieve sample case ID
  const casesRes = await fetch(`${API_URL}/doctor/cases`, {
    headers: { Authorization: `Bearer ${docToken}` }
  });
  const casesData = await casesRes.json() as any;
  const sampleCaseId = casesData.cases?.[0]?.id || 'unknown';

  console.log(`Step 2: Measuring Real API Latencies (3 runs per endpoint, sample case: ${sampleCaseId.slice(0, 8)})...\n`);

  const results = [];

  results.push(await timeRequest('POST /api/auth/login (Doctor)', () =>
    fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: '9876543212', password: 'Password123!' })
    })
  ));

  results.push(await timeRequest('GET /api/patient/dashboard', () =>
    fetch(`${API_URL}/patient/dashboard`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    })
  ));

  results.push(await timeRequest('GET /api/patient/assessments (History)', () =>
    fetch(`${API_URL}/patient/assessments`, {
      headers: { Authorization: `Bearer ${patientToken}` }
    })
  ));

  results.push(await timeRequest('GET /api/patient/community-patients', () =>
    fetch(`${API_URL}/patient/community-patients`, {
      headers: { Authorization: `Bearer ${ashaToken}` }
    })
  ));

  results.push(await timeRequest('GET /api/patient/:id/latest-vitals', () =>
    fetch(`${API_URL}/patient/demo-patient/latest-vitals`)
  ));

  results.push(await timeRequest('GET /api/doctor/cases (Full Urgency Queue)', () =>
    fetch(`${API_URL}/doctor/cases`, {
      headers: { Authorization: `Bearer ${docToken}` }
    })
  ));

  if (sampleCaseId !== 'unknown') {
    results.push(await timeRequest(`GET /api/doctor/cases/:id (Chart Review)`, () =>
      fetch(`${API_URL}/doctor/cases/${sampleCaseId}`, {
        headers: { Authorization: `Bearer ${docToken}` }
      })
    ));
  }

  results.push(await timeRequest('GET /api/doctor/patients', () =>
    fetch(`${API_URL}/doctor/patients`, {
      headers: { Authorization: `Bearer ${docToken}` }
    })
  ));

  results.push(await timeRequest('GET /api/doctor/consultations', () =>
    fetch(`${API_URL}/doctor/consultations`, {
      headers: { Authorization: `Bearer ${docToken}` }
    })
  ));

  results.push(await timeRequest('POST /api/patient/assessments (Triage + Save)', () =>
    fetch(`${API_URL}/patient/assessments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${patientToken}`
      },
      body: JSON.stringify({
        symptoms: ['Mild cough', 'Sore throat'],
        severity: 'Mild',
        duration: '2 days'
      })
    })
  ));

  console.log('\n--- API Latency Baseline Results ---');
  console.table(results);

  // Step 3: Measure Isolated Database Query Latencies
  console.log('\nStep 3: Measuring Direct Prisma / Database Latencies...');
  const { prisma } = await import('../src/utils/prisma');
  const dbResults = [];

  const timeDb = async (name: string, fn: () => Promise<any>, runs = 3) => {
    const times: number[] = [];
    for (let i = 0; i < runs; i++) {
      const start = performance.now();
      await fn();
      times.push(performance.now() - start);
    }
    const avgMs = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const minMs = Math.round(Math.min(...times));
    const maxMs = Math.round(Math.max(...times));
    return { name, avgMs, minMs, maxMs };
  };

  dbResults.push(await timeDb('DB: User.findUnique (auth lookup)', async () => {
    await prisma.user.findUnique({ where: { phone: '9876543212' } });
  }));

  dbResults.push(await timeDb('DB: Assessment.findMany with includes', async () => {
    await prisma.assessment.findMany({
      take: 20,
      include: {
        patient: { select: { name: true, patientProfile: true } },
        submittedBy: { select: { name: true, role: true } },
        vitalsLog: { take: 1 },
        consultations: { take: 1 }
      }
    });
  }));

  dbResults.push(await timeDb('DB: 6x Sequential count() queries (Current getDoctorCases pattern)', async () => {
    await Promise.all([
      prisma.assessment.count(),
      prisma.assessment.count({ where: { triageLevel: 'EMERGENCY' } }),
      prisma.assessment.count({ where: { triageLevel: 'VISIT_PHC' } }),
      prisma.assessment.count({ where: { triageLevel: 'VIDEO_CONSULT' } }),
      prisma.assessment.count({ where: { status: 'PENDING' } }),
      prisma.assessment.count({ where: { status: { in: ['REVIEWED', 'RESOLVED'] } } }),
    ]);
  }));

  dbResults.push(await timeDb('DB: 2x Aggregated groupBy queries (Optimized candidate)', async () => {
    await Promise.all([
      prisma.assessment.groupBy({
        by: ['triageLevel'],
        _count: { _all: true }
      }),
      prisma.assessment.groupBy({
        by: ['status'],
        _count: { _all: true }
      })
    ]);
  }));

  console.log('--- Database Latency Baseline Results ---');
  console.table(dbResults);

  await prisma.$disconnect();
}

runBaselineBenchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
