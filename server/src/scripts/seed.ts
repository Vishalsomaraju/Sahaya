import 'dotenv/config';
import bcrypt from 'bcrypt';
import { prisma } from '../utils/prisma';
import { generateTriageRecommendation } from '../services/triageService';

async function seedDatabase() {
  console.log('--- SAHAYA Prototype Demonstration: Seeding Synthetic Data ---\n');

  try {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // 1. Seed or Upsert Patients
    console.log('[1/4] Seeding synthetic demonstration patients...');
    
    // Patient 1: Arjun Kumar
    const patient1 = await prisma.user.upsert({
      where: { phone: '9876543210' },
      update: {},
      create: {
        name: 'Arjun Kumar',
        phone: '9876543210',
        passwordHash,
        role: 'PATIENT',
        patientProfile: {
          create: {
            dateOfBirth: new Date('1998-05-15T00:00:00.000Z'),
            gender: 'MALE',
            villageSector: 'Lucknow',
          },
        },
      },
    });

    // Patient 2: Meena Devi
    const patient2 = await prisma.user.upsert({
      where: { phone: '9876543220' },
      update: {},
      create: {
        name: 'Meena Devi',
        phone: '9876543220',
        passwordHash,
        role: 'PATIENT',
        patientProfile: {
          create: {
            dateOfBirth: new Date('1981-08-20T00:00:00.000Z'),
            gender: 'FEMALE',
            villageSector: 'Rampur',
          },
        },
      },
    });

    // Patient 3: Suresh Singh
    const patient3 = await prisma.user.upsert({
      where: { phone: '9876543230' },
      update: {},
      create: {
        name: 'Suresh Singh',
        phone: '9876543230',
        passwordHash,
        role: 'PATIENT',
        patientProfile: {
          create: {
            dateOfBirth: new Date('1964-11-03T00:00:00.000Z'),
            gender: 'MALE',
            villageSector: 'Sultanpur',
          },
        },
      },
    });

    // Patient 4: Ramesh Bhai
    const patient4 = await prisma.user.upsert({
      where: { phone: '9876543240' },
      update: {},
      create: {
        name: 'Ramesh Bhai',
        phone: '9876543240',
        passwordHash,
        role: 'PATIENT',
        patientProfile: {
          create: {
            dateOfBirth: new Date('1976-02-14T00:00:00.000Z'),
            gender: 'MALE',
            villageSector: 'Bilaspur',
          },
        },
      },
    });
    console.log(`  ✓ Created/verified 4 patients: Arjun Kumar, Meena Devi, Suresh Singh, Ramesh Bhai\n`);

    // 2. Seed ASHA Worker
    console.log('[2/4] Seeding synthetic ASHA field worker...');
    const ashaWorker = await prisma.user.upsert({
      where: { phone: '9876543211' },
      update: {},
      create: {
        name: 'Rekha Devi',
        phone: '9876543211',
        passwordHash,
        role: 'ASHA',
        ashaProfile: {
          create: {
            sector: 'Rampur',
            employeeId: 'ASHA-RAMPUR-001',
          },
        },
      },
    });
    console.log(`  ✓ ASHA Worker ready: Rekha Devi (${ashaWorker.id}, Sector: Rampur)\n`);

    // 3. Seed Doctor
    console.log('[3/4] Seeding synthetic primary healthcare physician...');
    const doctor = await prisma.user.upsert({
      where: { phone: '9876543212' },
      update: {},
      create: {
        name: 'Dr. Priya Sharma',
        phone: '9876543212',
        passwordHash,
        role: 'DOCTOR',
        doctorProfile: {
          create: {
            specialization: 'General Medicine',
            licenseNumber: 'DOC-RAMPUR-001',
          },
        },
      },
    });
    console.log(`  ✓ Doctor ready: Dr. Priya Sharma (${doctor.id}, License: DOC-RAMPUR-001)\n`);

    // 4. Seed Demonstrative Persisted Clinical Cases across all 4 Urgency Levels
    console.log('[4/4] Generating authentic, deterministic demonstration cases...');

    // Case A: EMERGENCY (Critical Hypoxia & Acute Chest Distress)
    const existingEmergency = await prisma.assessment.findFirst({
      where: { patientId: patient4.id, triageLevel: 'EMERGENCY' },
    });
    if (!existingEmergency) {
      const triageA = await generateTriageRecommendation({
        symptoms: ['Chest Pain', 'Difficulty Breathing', 'Dizziness'],
        severity: 'Severe',
        duration: '1 day',
        vitals: {
          heartRate: 114,
          spo2: 89,
          temperature: 99.1,
          bloodPressure: '155/95',
          source: 'asha_field',
        },
      });

      const assessmentA = await prisma.assessment.create({
        data: {
          patientId: patient4.id,
          submittedById: ashaWorker.id,
          symptoms: ['Chest Pain', 'Difficulty Breathing', 'Dizziness'],
          severity: 'Severe',
          duration: '1 day',
          triageLevel: triageA.triageLevel,
          priority: triageA.priority,
          vitals: {
            heartRate: 114,
            spo2: 89,
            temperature: 99.1,
            bloodPressure: '155/95',
            source: 'asha_field',
          },
          aiSummary: JSON.stringify({
            triageLevel: triageA.triageLevel,
            reasoning: triageA.reasoning,
            nextSteps: triageA.nextSteps,
            limitations: triageA.limitations,
            escalationGuidance: triageA.escalationGuidance,
            vitalsAssessment: triageA.vitalsAssessment,
          }),
          aiRecommendation: triageA.recommendedAction,
          status: 'PENDING',
        },
      });

      await prisma.vitals.create({
        data: {
          assessmentId: assessmentA.id,
          patientId: patient4.id,
          device: 'ASHA Pulse Oximeter & BP Monitor',
          heartRate: 114,
          spo2: 89,
          temperature: 99.1,
          bloodPressure: '155/95',
        },
      });
      console.log(`  ✓ Seeded EMERGENCY Case: ${assessmentA.id} (${patient4.name})`);
    }

    // Case B: VISIT_PHC (Moderate Hypoxia & High Fever)
    const existingPhc = await prisma.assessment.findFirst({
      where: { patientId: patient2.id, triageLevel: 'VISIT_PHC' },
    });
    if (!existingPhc) {
      const triageB = await generateTriageRecommendation({
        symptoms: ['High fever', 'Cough', 'Body Ache'],
        severity: 'Severe',
        duration: '3 days',
        vitals: {
          heartRate: 98,
          spo2: 93,
          temperature: 102.2,
          bloodPressure: '128/82',
          source: 'asha_field',
        },
      });

      const assessmentB = await prisma.assessment.create({
        data: {
          patientId: patient2.id,
          submittedById: ashaWorker.id,
          symptoms: ['High fever', 'Cough', 'Body Ache'],
          severity: 'Severe',
          duration: '3 days',
          triageLevel: triageB.triageLevel,
          priority: triageB.priority,
          vitals: {
            heartRate: 98,
            spo2: 93,
            temperature: 102.2,
            bloodPressure: '128/82',
            source: 'asha_field',
          },
          aiSummary: JSON.stringify({
            triageLevel: triageB.triageLevel,
            reasoning: triageB.reasoning,
            nextSteps: triageB.nextSteps,
            limitations: triageB.limitations,
            escalationGuidance: triageB.escalationGuidance,
            vitalsAssessment: triageB.vitalsAssessment,
          }),
          aiRecommendation: triageB.recommendedAction,
          status: 'PENDING',
        },
      });

      await prisma.vitals.create({
        data: {
          assessmentId: assessmentB.id,
          patientId: patient2.id,
          device: 'Clinical Thermometer & Pulse Oximeter',
          heartRate: 98,
          spo2: 93,
          temperature: 102.2,
          bloodPressure: '128/82',
        },
      });
      console.log(`  ✓ Seeded VISIT_PHC Case: ${assessmentB.id} (${patient2.name})`);
    }

    // Case C: VIDEO_CONSULT (Prolonged Symptoms > 7 Days)
    const existingVideo = await prisma.assessment.findFirst({
      where: { patientId: patient1.id, triageLevel: 'VIDEO_CONSULT' },
    });
    if (!existingVideo) {
      const triageC = await generateTriageRecommendation({
        symptoms: ['Sore Throat', 'Persistent Dry Cough', 'Fatigue'],
        severity: 'Moderate',
        duration: '9 days',
        vitals: {
          heartRate: 78,
          spo2: 98,
          temperature: 99.4,
          bloodPressure: '118/76',
          source: 'manual',
        },
      });

      const assessmentC = await prisma.assessment.create({
        data: {
          patientId: patient1.id,
          submittedById: patient1.id, // Self-submitted by patient
          symptoms: ['Sore Throat', 'Persistent Dry Cough', 'Fatigue'],
          severity: 'Moderate',
          duration: '9 days',
          triageLevel: triageC.triageLevel,
          priority: triageC.priority,
          vitals: {
            heartRate: 78,
            spo2: 98,
            temperature: 99.4,
            bloodPressure: '118/76',
            source: 'manual',
          },
          aiSummary: JSON.stringify({
            triageLevel: triageC.triageLevel,
            reasoning: triageC.reasoning,
            nextSteps: triageC.nextSteps,
            limitations: triageC.limitations,
            escalationGuidance: triageC.escalationGuidance,
            vitalsAssessment: triageC.vitalsAssessment,
          }),
          aiRecommendation: triageC.recommendedAction,
          status: 'PENDING',
        },
      });

      await prisma.vitals.create({
        data: {
          assessmentId: assessmentC.id,
          patientId: patient1.id,
          device: 'Home Digital Vitals Kit',
          heartRate: 78,
          spo2: 98,
          temperature: 99.4,
          bloodPressure: '118/76',
        },
      });
      console.log(`  ✓ Seeded VIDEO_CONSULT Case: ${assessmentC.id} (${patient1.name})`);
    }

    // Case D: SELF_CARE (Mild, Missing Vitals to show authentic missing data handling)
    const existingSelfCare = await prisma.assessment.findFirst({
      where: { patientId: patient3.id, triageLevel: 'SELF_CARE' },
    });
    if (!existingSelfCare) {
      const triageD = await generateTriageRecommendation({
        symptoms: ['Headache', 'Mild Fatigue'],
        severity: 'Mild',
        duration: '1 day',
        // vitals are intentionally undefined (missing) to demonstrate safety limitations handling
      });

      const assessmentD = await prisma.assessment.create({
        data: {
          patientId: patient3.id,
          submittedById: patient3.id,
          symptoms: ['Headache', 'Mild Fatigue'],
          severity: 'Mild',
          duration: '1 day',
          triageLevel: triageD.triageLevel,
          priority: triageD.priority,
          aiSummary: JSON.stringify({
            triageLevel: triageD.triageLevel,
            reasoning: triageD.reasoning,
            nextSteps: triageD.nextSteps,
            limitations: triageD.limitations,
            escalationGuidance: triageD.escalationGuidance,
            vitalsAssessment: triageD.vitalsAssessment,
          }),
          aiRecommendation: triageD.recommendedAction,
          status: 'PENDING',
        },
      });
      console.log(`  ✓ Seeded SELF_CARE Case (with missing vitals): ${assessmentD.id} (${patient3.name})`);
    }

    console.log('\n--- Seed Complete: Synthetic Demo Data Initialized Successfully ---');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
