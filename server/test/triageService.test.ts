import assert from 'node:assert';
import {
  generateTriageRecommendation,
  evaluateDeterministicTriage,
  parseAndValidateVitals,
  TriageInput,
} from '../src/services/triageService';

async function runTests() {
  console.log('--- Starting SAHAYA Triage Engine Test Suite ---\n');
  let passed = 0;
  let total = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    total++;
    try {
      fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // ----------------------------------------------------
  // Scenario 1: Chest pain cannot be downgraded by Mild severity
  // ----------------------------------------------------
  await test('Chest pain with "Mild" severity produces EMERGENCY with 108/112 ambulance action', async () => {
    const input: TriageInput = {
      symptoms: ['Chest Pain', 'Headache'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: null,
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'EMERGENCY', 'Triage level must be EMERGENCY');
    assert.strictEqual(res.priority, 'HIGH', 'Prisma priority must be HIGH');
    assert.ok(
      res.recommendedAction.includes('108') || res.recommendedAction.includes('112'),
      'Recommended action must specify calling 108/112 ambulance'
    );
    assert.ok(
      !res.recommendedAction.toLowerCase().includes('within 24 hours'),
      'Emergency action must not suggest routine 24-hour delay'
    );
    assert.ok(
      res.reasoning.some((r) => r.toLowerCase().includes('precedence over') || r.toLowerCase().includes('emergency')),
      'Reasoning must explain that emergency warning signs take precedence'
    );
  });

  // ----------------------------------------------------
  // Scenario 2: Difficulty breathing cannot be downgraded by ordinary scoring
  // ----------------------------------------------------
  await test('Difficulty breathing with mild viral symptoms produces EMERGENCY', async () => {
    const input: TriageInput = {
      symptoms: ['Difficulty Breathing', 'Cough', 'Fatigue'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: null,
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'EMERGENCY');
    assert.strictEqual(res.priority, 'HIGH');
    assert.ok(
      res.reasoning.some((r) => r.toLowerCase().includes('breathing') || r.toLowerCase().includes('emergency')),
      'Reasoning must highlight respiratory red-flag'
    );
  });

  // ----------------------------------------------------
  // Scenario 3: Acute abnormal vitals escalate to EMERGENCY regardless of mild symptoms
  // (CLINICAL NOTE: Hypoxia threshold SpO2 < 90% and HR >= 130 bpm require clinician approval)
  // ----------------------------------------------------
  await test('Severe Hypoxia (SpO2: 88%) with mild headache escalates to EMERGENCY', async () => {
    const input: TriageInput = {
      symptoms: ['Headache'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: {
        spo2: 88,
        heartRate: 78,
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'EMERGENCY', 'Severe hypoxia must trigger EMERGENCY');
    assert.strictEqual(res.priority, 'HIGH');
    assert.ok(
      res.reasoning.some((r) => r.includes('88%') || r.toLowerCase().includes('hypoxia')),
      'Reasoning must explicitly cite 88% SpO2 hypoxia'
    );
  });

  // ----------------------------------------------------
  // Scenario 4: Critical heart rate (>= 130 bpm) escalates to EMERGENCY
  // (CLINICAL NOTE: Tachycardia emergency threshold >= 130 bpm requires clinician approval)
  // ----------------------------------------------------
  await test('Critical Tachycardia (HR: 142 bpm) with mild symptoms produces EMERGENCY', async () => {
    const input: TriageInput = {
      symptoms: ['Fatigue'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: {
        heartRate: 142,
        spo2: 98,
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'EMERGENCY');
    assert.ok(
      res.reasoning.some((r) => r.includes('142 bpm')),
      'Reasoning must explicitly mention heart rate'
    );
  });

  // ----------------------------------------------------
  // Scenario 5: Missing vitals remain missing and are not assumed normal
  // ----------------------------------------------------
  await test('Missing vitals are not assumed normal and add explicit data limitations', async () => {
    const input: TriageInput = {
      symptoms: ['Fever', 'Cough'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: null,
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.vitalsAssessment.recorded, false, 'Vitals should be marked as not recorded');
    assert.ok(
      res.limitations.some((l) => l.toLowerCase().includes('vital signs') && l.toLowerCase().includes('not recorded')),
      'Limitations must state that vitals were not recorded'
    );
    assert.ok(
      !res.reasoning.some((r) => r.toLowerCase().includes('normal physiological baselines')),
      'Must NOT claim vitals are normal when none were recorded'
    );
  });

  // ----------------------------------------------------
  // Scenario 6: Invalid vitals are rejected and documented in limitations
  // ----------------------------------------------------
  await test('Physiologically impossible vitals (SpO2: 150%, HR: -10) are rejected', () => {
    const vitals = parseAndValidateVitals({
      spo2: 150,
      heartRate: -10,
      bloodPressure: 'invalid_format',
      temperature: 200,
    });

    assert.strictEqual(vitals.recorded, true);
    assert.strictEqual(vitals.spo2, undefined, 'Invalid SpO2 should not be stored as valid');
    assert.strictEqual(vitals.heartRate, undefined, 'Negative HR should not be stored as valid');
    assert.strictEqual(vitals.bloodPressure, undefined, 'Malformed BP should not be stored as valid');
    assert.strictEqual(vitals.temperatureCelsius, undefined, 'Extreme temp should not be stored as valid');
    assert.strictEqual(vitals.invalidFields.length, 4, 'Should identify all 4 invalid fields');
  });

  await test('Invalid vitals do not produce a falsely reassuring result and appear in limitations', async () => {
    const input: TriageInput = {
      symptoms: ['Cough'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: {
        spo2: 150,
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.ok(
      res.limitations.some((l) => l.toLowerCase().includes('invalid')),
      'Limitations must report rejected invalid vitals'
    );
    assert.ok(
      res.vitalsAssessment.invalidVitals.length > 0,
      'Invalid vitals list must contain rejected reading'
    );
  });

  // ----------------------------------------------------
  // Scenario 7: Moderate Hypoxia (SpO2 90-94%) triggers VISIT_PHC within 24h
  // (CLINICAL NOTE: SpO2 threshold 90-94% requires clinician approval)
  // ----------------------------------------------------
  await test('Moderate Hypoxia (SpO2: 93%) triggers VISIT_PHC', async () => {
    const input: TriageInput = {
      symptoms: ['Cough', 'Fever'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: {
        spo2: 93,
        heartRate: 84,
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'VISIT_PHC');
    assert.strictEqual(res.priority, 'HIGH');
    assert.ok(
      res.recommendedAction.includes('Primary Health Centre') && res.recommendedAction.includes('24 hours'),
      'Action must advise PHC visit within 24 hours'
    );
  });

  // ----------------------------------------------------
  // Scenario 8: Severe reported severity triggers VISIT_PHC
  // ----------------------------------------------------
  await test('Severe reported severity without emergency signs triggers VISIT_PHC', async () => {
    const input: TriageInput = {
      symptoms: ['Fever', 'Body Ache'],
      severity: 'Severe',
      duration: '3 to 7 days',
      vitals: {
        heartRate: 88,
        spo2: 98,
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'VISIT_PHC');
    assert.strictEqual(res.priority, 'HIGH');
  });

  // ----------------------------------------------------
  // Scenario 9: Prolonged symptoms (> 7 days) trigger VIDEO_CONSULT
  // ----------------------------------------------------
  await test('Prolonged mild symptoms (> 7 days) trigger VIDEO_CONSULT', async () => {
    const input: TriageInput = {
      symptoms: ['Cough'],
      severity: 'Mild',
      duration: 'More than 7 days',
      vitals: {
        spo2: 98,
        heartRate: 72,
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'VIDEO_CONSULT');
    assert.strictEqual(res.priority, 'MEDIUM');
  });

  // ----------------------------------------------------
  // Scenario 10: Mild symptoms, short duration, normal vitals trigger SELF_CARE with return precautions
  // ----------------------------------------------------
  await test('Mild symptoms with normal vitals trigger SELF_CARE with specific escalation guidance', async () => {
    const input: TriageInput = {
      symptoms: ['Cough', 'Sore Throat'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: {
        spo2: 98,
        heartRate: 74,
        temperature: 98.4,
        bloodPressure: '120/80',
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'SELF_CARE');
    assert.strictEqual(res.priority, 'LOW');
    assert.ok(
      res.recommendedAction.toLowerCase().includes('rest') && res.recommendedAction.toLowerCase().includes('hydrate'),
      'Recommended action must advise rest and hydration'
    );
    assert.ok(
      res.reasoning.some((r) => r.includes('Cough, Sore Throat') || r.includes('normal physiological baselines')),
      'Reasoning must accurately reflect reported symptoms'
    );
    assert.ok(
      res.escalationGuidance.includes('108') || res.escalationGuidance.toLowerCase().includes('primary health centre'),
      'Escalation guidance must provide clear worsening precautions'
    );
  });

  // ----------------------------------------------------
  // Scenario 11: Backward compatibility with legacy caller signature
  // ----------------------------------------------------
  await test('Legacy caller signature generateTriageRecommendation(symptomsArray, legacyVitals) works', async () => {
    const res = await generateTriageRecommendation(['Chest Pain'], { spo2: 97 });

    assert.strictEqual(res.triageLevel, 'EMERGENCY');
    assert.strictEqual(res.priority, 'HIGH');
    assert.ok(res.recommendedAction.length > 0);
  });

  // ----------------------------------------------------
  // Scenario 12: Temperature Fahrenheit vs Celsius handling
  // (CLINICAL NOTE: Temperature thresholds >= 38.0°C / 100.4°F require clinician approval)
  // ----------------------------------------------------
  await test('Temperature: 101.5°F is correctly interpreted as fever and Celsius converted', () => {
    const vitalsF = parseAndValidateVitals({ temperature: 101.5 });
    assert.strictEqual(vitalsF.temperatureUnit, 'F');
    assert.ok(vitalsF.temperatureCelsius !== undefined);
    assert.ok(vitalsF.temperatureCelsius >= 38.0, '101.5°F should be >= 38.0°C');

    const vitalsC = parseAndValidateVitals({ temperature: 38.6 });
    assert.strictEqual(vitalsC.temperatureUnit, 'C');
    assert.strictEqual(vitalsC.temperatureCelsius, 38.6);
  });

  // ----------------------------------------------------
  // Scenario 13: Hypertensive Crisis (>= 180/120) triggers EMERGENCY
  // (CLINICAL NOTE: Hypertensive emergency threshold >= 180/120 mmHg requires clinician approval)
  // ----------------------------------------------------
  await test('Hypertensive crisis (BP: 195/125 mmHg) triggers EMERGENCY even with mild symptoms', async () => {
    const input: TriageInput = {
      symptoms: ['Mild Headache'],
      severity: 'Mild',
      duration: 'Less than 3 days',
      vitals: {
        bloodPressure: '195/125',
      },
    };
    const res = await generateTriageRecommendation(input);

    assert.strictEqual(res.triageLevel, 'EMERGENCY');
    assert.ok(
      res.reasoning.some((r) => r.toLowerCase().includes('hypertensive emergency') || r.includes('195/125')),
      'Reasoning must highlight hypertensive emergency'
    );
  });

  console.log(`\n--- Test Results: ${passed}/${total} passed ---`);
  if (passed === total) {
    console.log('ALL TESTS PASSED SUCCESSFULLY!\n');
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal error running tests:', err);
  process.exit(1);
});
