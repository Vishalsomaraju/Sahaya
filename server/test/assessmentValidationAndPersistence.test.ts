import 'dotenv/config';
import assert from 'node:assert';
import { createAssessmentSchema, assessmentVitalsSchema } from '../src/utils/validation';
import { prisma } from '../src/utils/prisma';
import { generateTriageRecommendation } from '../src/services/triageService';

async function runPhase2Tests() {
  console.log('--- Starting SAHAYA Phase 2: Schema, Validation & Persistence Test Suite ---\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        return res
          .then(() => {
            console.log(`  ✓ [PASS] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ✗ [FAIL] ${name}`);
            console.error(err);
            process.exitCode = 1;
          });
      } else {
        console.log(`  ✓ [PASS] ${name}`);
        passed++;
      }
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
    return Promise.resolve();
  }

  // ----------------------------------------------------
  // Test 1: Valid assessment request passes validation
  // ----------------------------------------------------
  await test('Valid assessment with symptoms, severity, duration, and vitals passes validation', () => {
    const payload = {
      symptoms: ['Fever', 'Cough'],
      severity: 'Moderate',
      duration: '3 to 7 days',
      vitals: {
        heartRate: 82,
        spo2: 97,
        temperature: 99.4,
        bloodPressure: '124/82',
        source: 'manual',
      },
      notes: 'Patient feels fatigued since Tuesday.',
    };

    const parsed = createAssessmentSchema.parse(payload);
    assert.deepStrictEqual(parsed.symptoms, ['Fever', 'Cough']);
    assert.strictEqual(parsed.severity, 'Moderate');
    assert.strictEqual(parsed.duration, '3 to 7 days');
    assert.strictEqual(parsed.vitals?.heartRate, 82);
    assert.strictEqual(parsed.vitals?.spo2, 97);
  });

  // ----------------------------------------------------
  // Test 2: Missing required symptoms field produces structured validation error
  // ----------------------------------------------------
  await test('Missing or empty symptoms array is rejected with validation error', () => {
    assert.throws(() => {
      createAssessmentSchema.parse({});
    }, /expected array|At least one symptom/);

    assert.throws(() => {
      createAssessmentSchema.parse({ symptoms: [] });
    }, /At least one symptom must be provided/);
  });

  // ----------------------------------------------------
  // Test 3: Invalid severity value is rejected
  // ----------------------------------------------------
  await test('Invalid severity value (e.g. "Critical", "Extreme") is rejected', () => {
    assert.throws(() => {
      createAssessmentSchema.parse({
        symptoms: ['Headache'],
        severity: 'Critical',
      });
    }, /Severity must be 'Mild', 'Moderate', or 'Severe'/);
  });

  // ----------------------------------------------------
  // Test 4: Client cannot submit arbitrary triage outcomes or priority
  // ----------------------------------------------------
  await test('Client cannot tamper with triageLevel or priority (strict schema rejects extra fields)', () => {
    assert.throws(() => {
      createAssessmentSchema.parse({
        symptoms: ['Chest Pain'],
        triageLevel: 'SELF_CARE', // Unauthorized client override
        priority: 'LOW',
      });
    }, /Unrecognized key/);
  });

  // ----------------------------------------------------
  // Test 5: Invalid vital-sign measurements are rejected
  // ----------------------------------------------------
  await test('Invalid SpO2 (> 100% or < 50%) is rejected', () => {
    assert.throws(() => {
      assessmentVitalsSchema.parse({ spo2: 125 });
    }, /SpO2 must not exceed 100%/);

    assert.throws(() => {
      assessmentVitalsSchema.parse({ spo2: 35 });
    }, /SpO2 must be at least 50%/);
  });

  await test('Invalid heart rate (> 250 bpm or < 25 bpm) is rejected', () => {
    assert.throws(() => {
      assessmentVitalsSchema.parse({ heartRate: -5 });
    }, /Heart rate must be at least 25 bpm/);

    assert.throws(() => {
      assessmentVitalsSchema.parse({ heartRate: 350 });
    }, /Heart rate must not exceed 250 bpm/);
  });

  await test('Physiologically impossible temperature is rejected', () => {
    assert.throws(() => {
      assessmentVitalsSchema.parse({ temperature: 200 });
    }, /Temperature must be physiologically plausible/);
  });

  await test('Malformed blood pressure format or systolic <= diastolic is rejected', () => {
    assert.throws(() => {
      assessmentVitalsSchema.parse({ bloodPressure: '120-80' });
    }, /Blood pressure must be in standard systolic\/diastolic format/);

    assert.throws(() => {
      assessmentVitalsSchema.parse({ bloodPressure: '80/120' }); // systolic < diastolic
    }, /Blood pressure must be in standard systolic\/diastolic format/);
  });

  // ----------------------------------------------------
  // Test 6: Missing vitals remain absent and are not fabricated
  // ----------------------------------------------------
  await test('Minimal assessment without vitals parses with undefined vitals', () => {
    const payload = {
      symptoms: ['Cough'],
    };
    const parsed = createAssessmentSchema.parse(payload);
    assert.strictEqual(parsed.vitals, undefined);
    assert.strictEqual(parsed.severity, undefined);
    assert.strictEqual(parsed.duration, undefined);
  });

  // ----------------------------------------------------
  // Test 7: Database persistence and triageLevel integrity
  // ----------------------------------------------------
  await test('Prisma persists severity, duration, triageLevel and linked vitals in DB', async () => {
    // Create a temporary test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test Validation Patient',
        phone: `+91999${Math.floor(1000000 + Math.random() * 9000000)}`,
        passwordHash: 'hashed_pw',
        role: 'PATIENT',
      },
    });

    try {
      // 1. Triage evaluation via Phase 1 engine
      const symptoms = ['Chest Pain', 'Shortness of Breath'];
      const severity = 'Severe';
      const duration = 'Less than 3 days';
      const vitalsInput = {
        heartRate: 112,
        spo2: 91,
        bloodPressure: '145/95',
        source: 'manual' as const,
      };

      const triage = await generateTriageRecommendation({
        symptoms,
        severity,
        duration,
        vitals: vitalsInput,
      });

      assert.strictEqual(triage.triageLevel, 'EMERGENCY', 'Chest pain must evaluate to EMERGENCY');

      // 2. Persist to DB using updated schema columns
      const createdAssessment = await prisma.$transaction(async (tx) => {
        const a = await tx.assessment.create({
          data: {
            patientId: testUser.id,
            submittedById: testUser.id,
            symptoms,
            severity,
            duration,
            triageLevel: triage.triageLevel,
            priority: triage.priority,
            vitals: vitalsInput,
            aiSummary: JSON.stringify({
              triageLevel: triage.triageLevel,
              reasoning: triage.reasoning,
              nextSteps: triage.nextSteps,
              limitations: triage.limitations,
              escalationGuidance: triage.escalationGuidance,
              vitalsAssessment: triage.vitalsAssessment,
            }),
            aiRecommendation: triage.recommendedAction,
            status: 'PENDING',
          },
        });

        await tx.vitals.create({
          data: {
            assessmentId: a.id,
            patientId: testUser.id,
            device: 'Manual Clinical Entry',
            heartRate: vitalsInput.heartRate,
            spo2: vitalsInput.spo2,
            bloodPressure: vitalsInput.bloodPressure,
          },
        });

        return a;
      });

      // 3. Query back from DB and verify exact persistence
      const fetched = await prisma.assessment.findUnique({
        where: { id: createdAssessment.id },
        include: { vitalsLog: true },
      });

      assert.ok(fetched, 'Assessment must be found in DB');
      assert.strictEqual(fetched.severity, 'Severe', 'Severity must be persisted in DB');
      assert.strictEqual(fetched.duration, 'Less than 3 days', 'Duration must be persisted in DB');
      assert.strictEqual(fetched.triageLevel, 'EMERGENCY', 'TriageLevel enum must be persisted in DB');
      assert.strictEqual(fetched.priority, 'HIGH', 'Priority must be HIGH');
      assert.strictEqual(fetched.vitalsLog.length, 1, 'Linked Vitals log must be created');
      assert.strictEqual(fetched.vitalsLog[0].spo2, 91, 'Linked vitals SpO2 must match');

      // 4. Test an assessment without vitals: vitals column must remain null and vitalsLog empty
      const noVitalsAssessment = await prisma.assessment.create({
        data: {
          patientId: testUser.id,
          submittedById: testUser.id,
          symptoms: ['Sore Throat'],
          severity: 'Mild',
          duration: 'Less than 3 days',
          triageLevel: 'SELF_CARE',
          priority: 'LOW',
          vitals: undefined, // Prisma leaves column as DB NULL
          aiRecommendation: 'Rest and hydration',
          status: 'PENDING',
        },
        include: { vitalsLog: true },
      });

      assert.strictEqual(noVitalsAssessment.vitals, null, 'Vitals column must remain null in DB');
      assert.strictEqual(noVitalsAssessment.vitalsLog.length, 0, 'No fake vitalsLog should exist');
      assert.strictEqual(noVitalsAssessment.triageLevel, 'SELF_CARE');

      // Cleanup test records
      await prisma.assessment.deleteMany({ where: { patientId: testUser.id } });
    } finally {
      await prisma.user.delete({ where: { id: testUser.id } });
    }
  });

  console.log(`\n--- Phase 2 Test Results: ${passed}/${total} passed ---`);
  await prisma.$disconnect();
  if (passed === total) {
    console.log('ALL PHASE 2 VALIDATION & PERSISTENCE TESTS PASSED!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runPhase2Tests().catch(async (err) => {
  console.error('Fatal error running Phase 2 tests:', err);
  await prisma.$disconnect();
  process.exit(1);
});
