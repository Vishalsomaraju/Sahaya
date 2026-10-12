import Anthropic from '@anthropic-ai/sdk';
import { AssessmentPriority } from '@prisma/client';

export type TriageLevel = 'EMERGENCY' | 'VISIT_PHC' | 'VIDEO_CONSULT' | 'SELF_CARE';

export interface VitalsInput {
  heartRate?: number | string;
  restingHeartRate?: number | string;
  spo2?: number | string;
  temperature?: number | string;
  bloodPressure?: string;
  [key: string]: any;
}

export interface TriageInput {
  symptoms: string[];
  severity?: 'Mild' | 'Moderate' | 'Severe' | string;
  duration?: string;
  vitals?: VitalsInput | null;
  notes?: string;
  patientAge?: number;
}

export interface ValidatedBloodPressure {
  systolic: number;
  diastolic: number;
  raw: string;
}

export interface ValidatedVitals {
  recorded: boolean;
  heartRate?: number;
  spo2?: number;
  temperatureCelsius?: number;
  temperatureOriginal?: number;
  temperatureUnit?: 'C' | 'F';
  bloodPressure?: ValidatedBloodPressure;
  invalidFields: string[];
  clinicalObservations: string[];
  isSevereAbnormal: boolean;
  isModerateAbnormal: boolean;
}

export interface TriageResult {
  triageLevel: TriageLevel;
  priority: AssessmentPriority;
  recommendedAction: string;
  reasoning: string[];
  nextSteps: string[];
  disclaimer: string;
  limitations: string[];
  escalationGuidance: string;
  vitalsAssessment: {
    recorded: boolean;
    summary: string;
    warnings: string[];
    invalidVitals: string[];
  };
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const CLINICAL_DISCLAIMER =
  "This is an algorithmic triage recommendation for informational guidance only. It does not provide a definitive medical diagnosis and does not replace professional clinical evaluation by a qualified healthcare provider.";

const URGENCY_RANK: Record<TriageLevel, number> = {
  EMERGENCY: 4,
  VISIT_PHC: 3,
  VIDEO_CONSULT: 2,
  SELF_CARE: 1,
};

export function parseAndValidateVitals(rawVitals?: VitalsInput | null): ValidatedVitals {
  const result: ValidatedVitals = {
    recorded: false,
    invalidFields: [],
    clinicalObservations: [],
    isSevereAbnormal: false,
    isModerateAbnormal: false,
  };

  if (!rawVitals || typeof rawVitals !== 'object') {
    return result;
  }

  let hasAnyField = false;

  // 1. Oxygen Saturation (SpO2)
  if (rawVitals.spo2 !== undefined && rawVitals.spo2 !== null && rawVitals.spo2 !== '') {
    hasAnyField = true;
    const val = Number(rawVitals.spo2);
    if (isNaN(val) || val < 50 || val > 100) {
      result.invalidFields.push(
        `Oxygen saturation (SpO2) value of '${rawVitals.spo2}%' is outside physiologically plausible range (50% - 100%).`
      );
    } else {
      result.spo2 = val;
      if (val < 90) {
        result.isSevereAbnormal = true;
        result.clinicalObservations.push(
          `SpO2 is critically low at ${val}% (< 90%), indicating severe hypoxia requiring emergency supplemental oxygen.`
        );
      } else if (val < 95) {
        result.isModerateAbnormal = true;
        result.clinicalObservations.push(
          `SpO2 is ${val}%, which is below the safe threshold of 95% and requires in-person clinical assessment.`
        );
      }
    }
  }

  // 2. Heart Rate (HR)
  const hrRaw = rawVitals.heartRate ?? rawVitals.hr;
  if (hrRaw !== undefined && hrRaw !== null && hrRaw !== '') {
    hasAnyField = true;
    const val = Number(hrRaw);
    if (isNaN(val) || val < 25 || val > 250) {
      result.invalidFields.push(
        `Heart rate value of '${hrRaw} bpm' is outside physiologically plausible range (25 - 250 bpm).`
      );
    } else {
      result.heartRate = val;
      if (val >= 130) {
        result.isSevereAbnormal = true;
        result.clinicalObservations.push(
          `Heart rate is critically elevated at ${val} bpm (severe tachycardia, >= 130 bpm).`
        );
      } else if (val <= 40) {
        result.isSevereAbnormal = true;
        result.clinicalObservations.push(
          `Heart rate is critically low at ${val} bpm (severe bradycardia, <= 40 bpm).`
        );
      } else if (val >= 110) {
        result.isModerateAbnormal = true;
        result.clinicalObservations.push(
          `Heart rate is elevated at ${val} bpm (tachycardia).`
        );
      } else if (val <= 50) {
        result.isModerateAbnormal = true;
        result.clinicalObservations.push(
          `Heart rate is low at ${val} bpm (bradycardia).`
        );
      }
    }
  }

  // 3. Body Temperature
  const tempRaw = rawVitals.temperature ?? rawVitals.temp;
  if (tempRaw !== undefined && tempRaw !== null && tempRaw !== '') {
    hasAnyField = true;
    const val = Number(tempRaw);
    if (isNaN(val)) {
      result.invalidFields.push(`Temperature value '${tempRaw}' is not a valid number.`);
    } else {
      result.temperatureOriginal = val;
      if (val > 50) {
        // Fahrenheit mode
        result.temperatureUnit = 'F';
        if (val < 85 || val > 115) {
          result.invalidFields.push(
            `Temperature of ${val}°F is outside credible physiological range (85°F - 115°F).`
          );
        } else {
          result.temperatureCelsius = (val - 32) * (5 / 9);
        }
      } else {
        // Celsius mode
        result.temperatureUnit = 'C';
        if (val < 30 || val > 46) {
          result.invalidFields.push(
            `Temperature of ${val}°C is outside credible physiological range (30°C - 46°C).`
          );
        } else {
          result.temperatureCelsius = val;
        }
      }

      if (result.temperatureCelsius !== undefined) {
        const c = result.temperatureCelsius;
        if (c < 35.0) {
          result.isSevereAbnormal = true;
          result.clinicalObservations.push(
            `Body temperature is ${val}°${result.temperatureUnit} (${c.toFixed(1)}°C), indicating severe hypothermia (< 35.0°C).`
          );
        } else if (c >= 39.5) {
          result.isModerateAbnormal = true;
          result.clinicalObservations.push(
            `High-grade fever detected: ${val}°${result.temperatureUnit} (${c.toFixed(1)}°C >= 39.5°C / 103.1°F).`
          );
        } else if (c >= 38.0) {
          result.clinicalObservations.push(
            `Fever detected: ${val}°${result.temperatureUnit} (${c.toFixed(1)}°C >= 38.0°C / 100.4°F).`
          );
        }
      }
    }
  }

  // 4. Blood Pressure (BP)
  const bpRaw = rawVitals.bloodPressure ?? rawVitals.bp;
  if (bpRaw !== undefined && bpRaw !== null && bpRaw !== '') {
    hasAnyField = true;
    const str = String(bpRaw).trim();
    const match = str.match(/^(\d{2,3})\s*[/]\s*(\d{2,3})$/);
    if (!match) {
      result.invalidFields.push(
        `Blood pressure '${bpRaw}' is not in standard 'systolic/diastolic' format (e.g. '120/80').`
      );
    } else {
      const sys = parseInt(match[1], 10);
      const dia = parseInt(match[2], 10);
      if (sys < 50 || sys > 280 || dia < 30 || dia > 180 || sys <= dia) {
        result.invalidFields.push(
          `Blood pressure '${bpRaw}' mmHg is outside plausible physiological range or systolic is not greater than diastolic.`
        );
      } else {
        result.bloodPressure = { systolic: sys, diastolic: dia, raw: str };
        if (sys >= 180 || dia >= 120) {
          result.isSevereAbnormal = true;
          result.clinicalObservations.push(
            `Blood pressure of ${sys}/${dia} mmHg is critically elevated (hypertensive emergency threshold >= 180/120 mmHg).`
          );
        } else if (sys < 85) {
          result.isSevereAbnormal = true;
          result.clinicalObservations.push(
            `Blood pressure of ${sys}/${dia} mmHg is critically low (severe hypotension / risk of circulatory shock).`
          );
        } else if (sys >= 160 || dia >= 100) {
          result.isModerateAbnormal = true;
          result.clinicalObservations.push(
            `Blood pressure of ${sys}/${dia} mmHg indicates significantly elevated Stage 2 hypertension.`
          );
        } else if (sys >= 140 || dia >= 90) {
          result.clinicalObservations.push(
            `Blood pressure of ${sys}/${dia} mmHg is elevated (Stage 1 hypertension).`
          );
        }
      }
    }
  }

  result.recorded = hasAnyField;
  return result;
}

const EMERGENCY_SYMPTOM_PATTERNS = [
  'chest pain',
  'chest tightness',
  'chest pressure',
  'angina',
  'cardiac pain',
  'difficulty breathing',
  'breathless',
  'shortness of breath',
  'respiratory distress',
  'gasping',
  'stridor',
  'choking',
  'loss of consciousness',
  'unconscious',
  'fainting',
  'syncope',
  'seizure',
  'convulsion',
  'altered mental status',
  'confusion',
  'cyanosis',
  'blue lips',
  'bluish lips',
  'slurred speech',
  'facial droop',
  'arm weakness',
  'uncontrolled bleeding',
  'coughing blood',
];

export function evaluateDeterministicTriage(
  input: TriageInput,
  vitals: ValidatedVitals
): TriageResult {
  const symptomsText = [
    ...(input.symptoms || []),
    input.notes || '',
  ].join(' ').toLowerCase();

  const detectedEmergencySymptoms: string[] = [];
  for (const pattern of EMERGENCY_SYMPTOM_PATTERNS) {
    if (symptomsText.includes(pattern)) {
      detectedEmergencySymptoms.push(pattern);
    }
  }

  const isSevereReported = (input.severity || '').toLowerCase() === 'severe';
  const isModerateReported = (input.severity || '').toLowerCase() === 'moderate';
  const isMildReported = (input.severity || '').toLowerCase() === 'mild';

  const durationText = (input.duration || '').toLowerCase();
  const isProlongedDuration =
    durationText.includes('more than 7') ||
    durationText.includes('> 7') ||
    durationText.includes('week') ||
    durationText.includes('persistent');

  const reasoning: string[] = [];
  const limitations: string[] = [];
  const warnings: string[] = [...vitals.clinicalObservations];

  if (!vitals.recorded) {
    limitations.push(
      "Vital signs (pulse, SpO2, blood pressure, temperature) were not recorded. Triage is estimated solely from reported symptoms."
    );
  } else if (vitals.invalidFields.length > 0) {
    limitations.push(
      `One or more vital sign values were rejected as physiologically invalid (${vitals.invalidFields.join('; ')}). Triage was performed without these invalid values.`
    );
  }

  // ==========================================
  // TIER 1: CRITICAL EMERGENCY
  // ==========================================
  const isSymptomEmergency = detectedEmergencySymptoms.length > 0;
  const isVitalEmergency = vitals.isSevereAbnormal;

  if (isSymptomEmergency || isVitalEmergency) {
    if (isSymptomEmergency) {
      reasoning.push(
        `Reported red-flag emergency symptoms detected: ${detectedEmergencySymptoms.join(', ')}. These symptoms require immediate emergency medical stabilization.`
      );
      if (isMildReported) {
        reasoning.push(
          "Emergency red-flag symptoms take precedence over the subjective 'Mild' severity rating; urgent medical evaluation cannot be downgraded."
        );
      }
    }

    if (isVitalEmergency) {
      reasoning.push(
        `Critically abnormal vital signs detected: ${vitals.clinicalObservations.join(' ')}.`
      );
      if (isMildReported && !isSymptomEmergency) {
        reasoning.push(
          "Severe vital sign abnormalities take precedence over mild reported symptoms; hemodynamic or oxygenation instability requires emergency medical intervention."
        );
      }
    }

    return {
      triageLevel: 'EMERGENCY',
      priority: 'HIGH',
      recommendedAction:
        "Call 108 (or 112) immediately for an emergency medical ambulance, or proceed to the nearest hospital emergency department without delay.",
      reasoning,
      nextSteps: [
        "Call 108 (National Ambulance Service in India) or 112 immediately for emergency medical transport.",
        "Do not exert yourself. Remain seated in an upright or comfortable resting position while awaiting assistance.",
        "Do not drive yourself to the hospital; seek immediate help from family, a neighbor, or an ASHA worker.",
        "Proceed directly to the nearest Community Health Centre (CHC), Sub-District Hospital, or District Hospital emergency department.",
      ],
      disclaimer: CLINICAL_DISCLAIMER,
      limitations,
      escalationGuidance:
        "This is an emergency-level medical event. Do not wait for symptoms to resolve at home.",
      vitalsAssessment: {
        recorded: vitals.recorded,
        summary: vitals.recorded
          ? (vitals.isSevereAbnormal ? "Critical vital sign abnormalities detected." : "Vitals evaluated.")
          : "Vital signs not provided.",
        warnings,
        invalidVitals: vitals.invalidFields,
      },
    };
  }

  // ==========================================
  // TIER 2: PRIMARY HEALTH CENTRE (CLINIC VISIT)
  // ==========================================
  const hasSpO2Borderline = vitals.spo2 !== undefined && vitals.spo2 >= 90 && vitals.spo2 < 95;
  const hasHighFever = vitals.temperatureCelsius !== undefined && vitals.temperatureCelsius >= 39.5;
  const hasModerateVitals = vitals.isModerateAbnormal;
  const hasFeverSymptom = symptomsText.includes('fever') || (vitals.temperatureCelsius !== undefined && vitals.temperatureCelsius >= 38.0);
  const hasCoughSymptom = symptomsText.includes('cough');

  if (isSevereReported || hasModerateVitals || hasSpO2Borderline || hasHighFever) {
    if (isSevereReported) {
      reasoning.push(
        "Symptoms were reported as Severe with noticeable distress or functional impairment, requiring an in-person clinical evaluation by a medical officer."
      );
    }
    if (hasSpO2Borderline) {
      reasoning.push(
        `SpO2 is ${vitals.spo2}%, which is below the safe threshold of 95% and requires clinical examination and lung assessment.`
      );
    }
    if (hasHighFever) {
      reasoning.push(
        `High body temperature (${vitals.temperatureOriginal}°${vitals.temperatureUnit}) warrants in-person clinical testing for acute infection.`
      );
    }
    if (vitals.clinicalObservations.length > 0 && !hasSpO2Borderline && !hasHighFever) {
      reasoning.push(
        `Vital signs show moderate abnormalities: ${vitals.clinicalObservations.join(' ')}.`
      );
    }

    return {
      triageLevel: 'VISIT_PHC',
      priority: 'HIGH',
      recommendedAction:
        "Visit your nearest Primary Health Centre (PHC) or clinic within 24 hours for in-person evaluation.",
      reasoning,
      nextSteps: [
        "Visit your local Primary Health Centre (PHC) or Community Health Centre (CHC) within 24 hours.",
        "Rest and maintain oral hydration with clean boiled water or ORS.",
        "Bring a record of current symptoms, duration, and any ongoing medications to your consultation.",
      ],
      disclaimer: CLINICAL_DISCLAIMER,
      limitations,
      escalationGuidance:
        "Seek emergency care immediately (Call 108) if you develop chest pain, severe shortness of breath, blueness of lips, or altered consciousness before your clinic visit.",
      vitalsAssessment: {
        recorded: vitals.recorded,
        summary: vitals.recorded ? "Moderate vital sign elevation requiring clinical review." : "Vital signs not provided.",
        warnings,
        invalidVitals: vitals.invalidFields,
      },
    };
  }

  // ==========================================
  // TIER 3: VIDEO CONSULTATION / ROUTINE DOCTOR REVIEW
  // ==========================================
  const hasRespiratoryCombo = hasFeverSymptom && hasCoughSymptom;

  if (isProlongedDuration || isModerateReported || hasRespiratoryCombo) {
    if (isProlongedDuration) {
      reasoning.push(
        `Symptoms have persisted for more than 7 days (${input.duration || 'over a week'}), warranting medical review to identify the underlying cause and avoid complications.`
      );
    }
    if (hasRespiratoryCombo) {
      reasoning.push(
        "Combination of fever and cough suggests a respiratory illness suitable for initial remote physician assessment."
      );
    }
    if (isModerateReported && !isProlongedDuration && !hasRespiratoryCombo) {
      reasoning.push(
        "Moderate symptom discomfort disrupting normal routine warrants physician consultation and guidance."
      );
    }

    return {
      triageLevel: 'VIDEO_CONSULT',
      priority: 'MEDIUM',
      recommendedAction:
        "Schedule a video consultation with a medical officer or physician today.",
      reasoning,
      nextSteps: [
        "Schedule a video tele-consultation with an available doctor via the SAHAYA portal.",
        "Log body temperature and symptom progression twice daily.",
        "Isolate from vulnerable household members if experiencing contagious respiratory symptoms.",
      ],
      disclaimer: CLINICAL_DISCLAIMER,
      limitations,
      escalationGuidance:
        "Visit a Primary Health Centre or emergency hospital if you experience difficulty breathing, high fever exceeding 102°F, or sudden worsening.",
      vitalsAssessment: {
        recorded: vitals.recorded,
        summary: vitals.recorded ? "Recorded vitals are stable without critical alerts." : "Vital signs not provided.",
        warnings,
        invalidVitals: vitals.invalidFields,
      },
    };
  }

  // ==========================================
  // TIER 4: SELF-CARE AT HOME
  // ==========================================
  const symptomListStr = input.symptoms && input.symptoms.length > 0
    ? input.symptoms.join(', ')
    : "Reported symptoms";

  reasoning.push(
    `${symptomListStr} are reported as mild with recent onset, and no emergency warning signs or vital sign abnormalities were identified.`
  );
  if (vitals.recorded && vitals.clinicalObservations.length === 0) {
    reasoning.push("Recorded vital signs are within normal physiological baselines.");
  }

  return {
    triageLevel: 'SELF_CARE',
    priority: 'LOW',
    recommendedAction:
      "Rest, stay hydrated, and monitor your symptoms at home.",
    reasoning,
    nextSteps: [
      "Ensure adequate oral fluid intake (clean water, herbal tea, broths, or ORS).",
      "Rest and avoid strenuous work or physical exertion.",
      "Monitor your temperature and symptom progression over the next 48 to 72 hours.",
    ],
    disclaimer: CLINICAL_DISCLAIMER,
    limitations,
    escalationGuidance:
      "Seek medical advice at a Primary Health Centre (PHC) if symptoms do not improve within 3 to 5 days, if fever develops (> 100.4°F / 38.0°C), or if chest pain or shortness of breath appears.",
    vitalsAssessment: {
      recorded: vitals.recorded,
      summary: vitals.recorded ? "Vital signs normal." : "Vital signs not provided.",
      warnings,
      invalidVitals: vitals.invalidFields,
    },
  };
}

export const generateTriageRecommendation = async (
  input: string[] | TriageInput,
  legacyVitals?: any
): Promise<TriageResult> => {
  // 1. Normalize input for backward compatibility
  const normalizedInput: TriageInput = Array.isArray(input)
    ? { symptoms: input, vitals: legacyVitals }
    : input;

  // 2. Parse and validate vital signs
  const validatedVitals = parseAndValidateVitals(normalizedInput.vitals);

  // 3. Deterministic Safety-First Evaluation
  const deterministicResult = evaluateDeterministicTriage(normalizedInput, validatedVitals);

  // 4. Optional AI Enrichment (Anthropic Claude-3 Haiku)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const prompt = `
You are an AI Clinical Triage Assistant for the SAHAYA community healthcare application in India.
The deterministic clinical safety engine has ALREADY evaluated the patient and established a SAFETY FLOOR.

DETERMINISTIC EVALUATION:
- Calculated Triage Level: ${deterministicResult.triageLevel}
- Priority: ${deterministicResult.priority}
- Deterministic Action: ${deterministicResult.recommendedAction}

PATIENT INFORMATION:
- Symptoms: ${(normalizedInput.symptoms || []).join(', ')}
- Reported Severity: ${normalizedInput.severity || 'Unspecified'}
- Reported Duration: ${normalizedInput.duration || 'Unspecified'}
- Notes: ${normalizedInput.notes || 'None'}
- Validated Vitals: ${JSON.stringify(validatedVitals)}

SAFETY RULES:
1. You MUST NOT downgrade the triage level below the safety floor of "${deterministicResult.triageLevel}".
2. If the safety floor is "EMERGENCY", you MUST keep triageLevel as "EMERGENCY" and prioritize immediate emergency transport (Call 108 / 112 in India).
3. Provide culturally appropriate, empathetic, actionable advice for rural / community healthcare in India.
4. Return ONLY valid JSON in this exact structure:
{
  "triageLevel": "${deterministicResult.triageLevel}",
  "recommendedAction": "string",
  "reasoning": ["string"],
  "nextSteps": ["string"]
}
`;

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      });

      const responseText = (response.content[0] as any).text;
      const parsed = JSON.parse(responseText);

      const aiTriageLevel = (parsed.triageLevel as TriageLevel) || deterministicResult.triageLevel;
      const deterministicRank = URGENCY_RANK[deterministicResult.triageLevel] || 1;
      const aiRank = URGENCY_RANK[aiTriageLevel] || 1;

      // STRICT SAFETY FLOOR: AI cannot downgrade urgency
      if (aiRank >= deterministicRank) {
        const finalTriageLevel = aiTriageLevel;
        let finalPriority: AssessmentPriority = deterministicResult.priority;
        if (finalTriageLevel === 'EMERGENCY' || finalTriageLevel === 'VISIT_PHC') {
          finalPriority = 'HIGH';
        } else if (finalTriageLevel === 'VIDEO_CONSULT') {
          finalPriority = 'MEDIUM';
        } else {
          finalPriority = 'LOW';
        }

        // For EMERGENCY, ensure emergency ambulance guidance is always present
        const recommendedAction = finalTriageLevel === 'EMERGENCY'
          ? deterministicResult.recommendedAction
          : (parsed.recommendedAction || deterministicResult.recommendedAction);

        return {
          triageLevel: finalTriageLevel,
          priority: finalPriority,
          recommendedAction,
          reasoning: Array.isArray(parsed.reasoning) && parsed.reasoning.length > 0
            ? parsed.reasoning
            : deterministicResult.reasoning,
          nextSteps: finalTriageLevel === 'EMERGENCY'
            ? deterministicResult.nextSteps
            : (Array.isArray(parsed.nextSteps) && parsed.nextSteps.length > 0 ? parsed.nextSteps : deterministicResult.nextSteps),
          disclaimer: CLINICAL_DISCLAIMER,
          limitations: deterministicResult.limitations,
          escalationGuidance: deterministicResult.escalationGuidance,
          vitalsAssessment: deterministicResult.vitalsAssessment,
        };
      } else {
        console.warn(
          `[TriageService] AI attempted to downgrade triage from ${deterministicResult.triageLevel} to ${aiTriageLevel}. Enforcing deterministic safety floor.`
        );
      }
    } catch (error) {
      console.error(
        "[TriageService] Anthropic API call failed or returned invalid JSON. Using deterministic safety engine.",
        error
      );
    }
  }

  // Fallback / standard path: return pure deterministic safety-first result
  return deterministicResult;
};

