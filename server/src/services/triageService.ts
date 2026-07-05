import Anthropic from '@anthropic-ai/sdk';
import { AssessmentPriority } from '@prisma/client';

export interface TriageResult {
  priority: AssessmentPriority;
  recommendedAction: string;
  reasoning: string[];
  nextSteps: string[];
  disclaimer: string;
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export const generateTriageRecommendation = async (symptoms: string[], vitals?: any): Promise<TriageResult> => {
  const disclaimer = "This is not a diagnosis. Our AI provides triage recommendation only.";
  
  // 1. Fallback Rule-based engine
  let priority: AssessmentPriority = 'LOW';
  let recommendedAction = "Monitor symptoms";
  let reasoning = ["Symptoms appear mild."];
  let nextSteps = ["Rest and stay hydrated.", "Log your symptoms again if they worsen."];

  const symptomsText = symptoms.join(' ').toLowerCase();
  
  const hasSpO2Drop = vitals?.spo2 && vitals.spo2 < 95;
  const hasChestPain = symptomsText.includes('chest pain') || symptomsText.includes('chest tightness');
  const hasBreathlessness = symptomsText.includes('breathless') || symptomsText.includes('breathing') || symptomsText.includes('shortness of breath');
  const hasFever = symptomsText.includes('fever') || (vitals?.temperature && vitals.temperature > 38.0);
  const hasCough = symptomsText.includes('cough');

  if (hasSpO2Drop || hasChestPain || hasBreathlessness) {
    priority = 'HIGH';
    recommendedAction = "Visit PHC within 24 hours";
    reasoning = [];
    if (hasSpO2Drop) reasoning.push(`SpO2 is ${vitals.spo2}%, which is below the safe threshold of 95%.`);
    if (hasChestPain) reasoning.push("Chest pain is a critical symptom requiring immediate medical evaluation.");
    if (hasBreathlessness) reasoning.push("Difficulty breathing requires urgent assessment.");
    nextSteps = ["Proceed to the nearest Primary Health Centre immediately.", "Do not exert yourself."];
  } else if (hasFever && hasCough) {
    priority = 'MEDIUM';
    recommendedAction = "Video Consultation recommended";
    reasoning = ["Combination of fever and cough suggests a potential respiratory infection."];
    nextSteps = ["Schedule a video consultation with a doctor.", "Isolate yourself from others.", "Monitor your temperature."];
  }

  // 2. LLM Engine (Anthropic)
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const prompt = `
You are an AI Triage Assistant for the SAHAYA healthcare app.
Your task is to analyze the following symptoms and vitals and provide a structured JSON response.

Symptoms: ${symptoms.join(', ')}
Vitals: ${JSON.stringify(vitals || {})}

Determine the Priority (must be exactly "LOW", "MEDIUM", or "HIGH").
Determine the Recommended Action.
Provide an array of strings for Reasoning (why you chose this priority).
Provide an array of strings for Next Steps.

Return ONLY valid JSON in the following format:
{
  "priority": "LOW|MEDIUM|HIGH",
  "recommendedAction": "string",
  "reasoning": ["string"],
  "nextSteps": ["string"]
}
`;

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [{ role: "user", content: prompt }]
      });

      const responseText = (response.content[0] as any).text;
      const parsed = JSON.parse(responseText);

      return {
        priority: parsed.priority as AssessmentPriority,
        recommendedAction: parsed.recommendedAction,
        reasoning: parsed.reasoning,
        nextSteps: parsed.nextSteps,
        disclaimer
      };
    } catch (error) {
      console.error("[TriageService] Anthropic API failed or returned invalid JSON. Falling back to rule-based.", error);
    }
  } else {
    console.log("[TriageService] No ANTHROPIC_API_KEY found. Using rule-based fallback.");
  }

  return { priority, recommendedAction, reasoning, nextSteps, disclaimer };
};
