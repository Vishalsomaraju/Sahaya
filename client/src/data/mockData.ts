export const mockCurrentPatient = {
  id: 'p1',
  name: 'Arjun Kumar',
  age: 28,
  village: 'Lucknow'
};

export const mockPatients = [
  { id: 'p1', name: 'Arjun Kumar', age: 28, village: 'Lucknow' },
  { id: 'p2', name: 'Meena Devi', age: 45, village: 'Rampur' },
  { id: 'p3', name: 'Suresh Singh', age: 62, village: 'Sultanpur' },
  { id: 'p4', name: 'Priya Patel', age: 34, village: 'Ahmedabad' }
];

export const mockSymptoms = [
  'Fever', 'Cough', 'Difficulty Breathing', 'Chest Pain', 'Headache', 
  'Fatigue', 'Body Ache', 'Sore Throat', 'Nausea', 'Dizziness'
];

export const mockAshaWorker = {
  id: 'a1',
  name: 'Rekha Devi',
  role: 'ASHA Worker',
  village: 'Rampur'
};

export const mockDoctor = {
  id: 'd1',
  name: 'Dr. Priya Sharma',
  role: 'MBBS, General Physician'
};

export const mockIncomingCases = [
  { id: 'c1', patient: 'Meena Devi', age: 45, asha: 'Rekha Devi', urgency: 'VISIT_PHC', symptoms: ['Fever', 'Cough'], time: '10:30 AM' },
  { id: 'c2', patient: 'Suresh Singh', age: 62, asha: 'Rekha Devi', urgency: 'VIDEO_CONSULT', symptoms: ['Headache', 'Dizziness'], time: '09:15 AM' },
  { id: 'c3', patient: 'Ramesh Bhai', age: 50, asha: 'Sunita', urgency: 'EMERGENCY', symptoms: ['Chest Pain', 'Difficulty Breathing'], time: '11:05 AM' }
];

export const mockVitals = {
  hr: 88,
  spo2: 94,
  temp: 101.2,
  bp: '130/85'
};

export const mockFacilities = [
  { id: 'f1', name: 'Primary Health Centre, Rampur', type: 'PHC', distance: '2.4 km' },
  { id: 'f2', name: 'Community Health Centre, Sultanpur', type: 'CHC', distance: '8.2 km' }
];

export function mockTriage(symptoms: string[], severity: string, duration: string) {
  const isEmergency = symptoms.includes('Difficulty Breathing') || symptoms.includes('Chest Pain');
  
  if (isEmergency) {
    return {
      level: 'EMERGENCY',
      title: 'Call 108 / Visit Hospital immediately',
      risk: 'Critical',
      nextAction: 'Proceed to the nearest hospital immediately',
      explanation: [
        'Symptoms indicate a potentially life-threatening condition.',
        'Requires immediate medical attention.'
      ],
      facilities: mockFacilities
    };
  } else if (severity === 'Severe') {
    return {
      level: 'VISIT_PHC',
      title: 'Visit Primary Health Center',
      risk: 'Moderate',
      nextAction: 'Visit nearest PHC within 24 hours',
      explanation: [
        'Symptoms suggest an infection requiring clinical evaluation.',
        'Vital signs may need professional monitoring.'
      ],
      facilities: mockFacilities
    };
  } else if (duration === 'More than 7 days') {
    return {
      level: 'VIDEO_CONSULT',
      title: 'Video Consultation Recommended',
      risk: 'Low-Moderate',
      nextAction: 'Speak to a doctor via video call today',
      explanation: [
        'Prolonged symptoms require a doctor\'s review.',
        'Can be safely managed remotely for now.'
      ],
      facilities: []
    };
  } else {
    return {
      level: 'SELF_CARE',
      title: 'Self-Care at Home',
      risk: 'Low',
      nextAction: 'Rest and hydrate. Monitor symptoms.',
      explanation: [
        'Symptoms appear to be mild and viral in nature.',
        'Usually resolves within a few days without medication.'
      ],
      facilities: []
    };
  }
}

export function generatePatientSummary(patient: any, symptoms: string[], vitals: any, triageResult: any) {
  return {
    patientName: patient.name,
    age: patient.age,
    symptoms: symptoms,
    vitals: vitals || mockVitals,
    recommendation: triageResult.title,
    generatedAt: new Date().toLocaleString()
  };
}
