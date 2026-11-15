/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Clinical Interview & Doctor's Situation Prediction Engine
 * 
 * Simulates a spaceflight physician / flight surgeon clinical anamnesis:
 *  - Systemic patient questionnaire (Energy, Vestibular/SAS, Cephalic Pressure, Spine, Respiration, Focus)
 *  - Correlates quantitative vital telemetry with subjective clinical responses
 *  - Predicts astronaut's current clinical situation, severity tier, and flight readiness
 *  - Synthesizes personalized NASA flight surgeon guidance and countermeasures
 */

import {
  AstronautProfile,
  ClinicalInterviewResponses,
  DoctorSituationPrediction,
  HealthStatus,
} from '../types/health';
import { getGeminiApiKey, getGeminiModel } from './geminiChatService';

export interface DoctorQuestionConfig {
  id: keyof ClinicalInterviewResponses;
  category: string;
  doctorInquiry: string;
  clinicalPurpose: string;
  options: {
    value: string;
    label: string;
    description: string;
    severity: HealthStatus;
    penalty: number;
  }[];
}

export const DOCTOR_CLINICAL_QUESTIONS: DoctorQuestionConfig[] = [
  {
    id: 'physicalEnergy',
    category: 'Constitutional Stamina',
    doctorInquiry: 'How is your overall physical stamina and bodily energy right now?',
    clinicalPurpose: 'Assesses metabolic reserves, exertion recovery, and systemic fatigue.',
    options: [
      {
        value: 'high',
        label: 'Optimal Stamina',
        description: 'Feeling vigorous, steady endurance, zero task exhaustion.',
        severity: 'GREEN',
        penalty: 0,
      },
      {
        value: 'moderate',
        label: 'Mild Physical Fatigue',
        description: 'Noticeable heaviness in limbs, recovering from daily exercise/EVA.',
        severity: 'YELLOW',
        penalty: 10,
      },
      {
        value: 'exhausted',
        label: 'Severe Depletion / Exhaustion',
        description: 'Heavy muscle lethargy, struggling to maintain physical activity.',
        severity: 'RED',
        penalty: 25,
      },
    ],
  },
  {
    id: 'motionSickness',
    category: 'Neuro-Vestibular (SAS)',
    doctorInquiry: 'Are you experiencing motion sickness, stomach awareness, or head-turn dizziness?',
    clinicalPurpose: 'Screens for Space Adaptation Syndrome (SAS) and otolith-canal conflict.',
    options: [
      {
        value: 'none',
        label: 'Fully Adapted',
        description: 'Zero motion sickness, steady spatial orientation in microgravity.',
        severity: 'GREEN',
        penalty: 0,
      },
      {
        value: 'mild',
        label: 'Mild SAS (Grade 1)',
        description: 'Slight stomach awareness, mild illusion of tumbling or nausea.',
        severity: 'YELLOW',
        penalty: 12,
      },
      {
        value: 'active',
        label: 'Acute SAS (Grade 2–3)',
        description: 'Moderate to severe nausea, active emesis risk, vestibular vertigo.',
        severity: 'RED',
        penalty: 28,
      },
    ],
  },
  {
    id: 'headPressure',
    category: 'Cephalic Fluid Shift & Cranial',
    doctorInquiry: 'Do you feel sinus fullness, facial puffiness, or throbbing cranial pressure?',
    clinicalPurpose: 'Monitors microgravity cephalad fluid redistribution and intracranial pressure.',
    options: [
      {
        value: 'none',
        label: 'Clear & Normal',
        description: 'No cranial fullness, facial vessels and sinus passages comfortable.',
        severity: 'GREEN',
        penalty: 0,
      },
      {
        value: 'moderate',
        label: 'Mild Sinus Congestion',
        description: 'Typical puffy-face feeling, mild nasal stuffiness, slight pressure.',
        severity: 'YELLOW',
        penalty: 8,
      },
      {
        value: 'severe',
        label: 'Throbbing Headache / High Pressure',
        description: 'Persistent frontal or retro-orbital ache, ocular tension, visual blur.',
        severity: 'RED',
        penalty: 25,
      },
    ],
  },
  {
    id: 'muscleSpineDiscomfort',
    category: 'Musculoskeletal (Spinal Unloading)',
    doctorInquiry: 'Any spinal elongation pain, lumbar stiffness, or musculoskeletal soreness?',
    clinicalPurpose: 'Evaluates microgravity spinal decompression pain and core muscle atrophy risk.',
    options: [
      {
        value: 'none',
        label: 'Spine & Joints Comfortable',
        description: 'Nominal flexibility, relaxed neutral body posture, zero back ache.',
        severity: 'GREEN',
        penalty: 0,
      },
      {
        value: 'mild',
        label: 'Mild Lumbar Stiffness',
        description: 'Aching in lower back after sleep chamber rest or resistance training.',
        severity: 'YELLOW',
        penalty: 8,
      },
      {
        value: 'severe',
        label: 'Acute Spinal / Muscle Pain',
        description: 'Sharp back pain or muscular spasms hindering nominal station mobility.',
        severity: 'RED',
        penalty: 22,
      },
    ],
  },
  {
    id: 'breathingChest',
    category: 'Cardiopulmonary & ECLSS',
    doctorInquiry: 'How is your breathing effort and chest comfort within the cabin atmosphere?',
    clinicalPurpose: 'Detects hypercapnia (elevated PCO₂), airway irritation, and cardiac exertion.',
    options: [
      {
        value: 'easy',
        label: 'Effortless & Clear',
        description: 'Easy breathing pattern, nominal oxygenation, comfortable chest.',
        severity: 'GREEN',
        penalty: 0,
      },
      {
        value: 'slight_tightness',
        label: 'Air Hunger / Mild Stuffy',
        description: 'Shallow respiratory effort or heavy cabin air feeling during tasks.',
        severity: 'YELLOW',
        penalty: 12,
      },
      {
        value: 'cough_strain',
        label: 'Chest Tightness / Dyspnea',
        description: 'Noticeable shortness of breath, persistent cough, or chest tightness.',
        severity: 'RED',
        penalty: 30,
      },
    ],
  },
  {
    id: 'mentalFocus',
    category: 'Cognitive & Neurological',
    doctorInquiry: 'How sharp is your mental concentration, reaction speed, and situational alertness?',
    clinicalPurpose: 'Gauges operational flight readiness, vigilance decrements, and brain fog.',
    options: [
      {
        value: 'sharp',
        label: 'Laser Focused',
        description: 'Sharp cognitive clarity, rapid recall, ready for complex mission tasks.',
        severity: 'GREEN',
        penalty: 0,
      },
      {
        value: 'slight_fog',
        label: 'Mild Brain Fog / Sluggish',
        description: 'Minor concentration lag, taking longer to process checklists.',
        severity: 'YELLOW',
        penalty: 10,
      },
      {
        value: 'impaired',
        label: 'Significant Cognitive Strain',
        description: 'Difficulty focusing, memory friction, noticeable mental exhaustion.',
        severity: 'RED',
        penalty: 25,
      },
    ],
  },
];

export const DEFAULT_CLINICAL_RESPONSES: ClinicalInterviewResponses = {
  physicalEnergy: 'high',
  motionSickness: 'none',
  headPressure: 'none',
  muscleSpineDiscomfort: 'none',
  breathingChest: 'easy',
  mentalFocus: 'sharp',
};

/**
 * Predicts the astronaut's clinical situation like a flight surgeon based on
 * the combination of vital signs and subjective symptom responses.
 */
export function predictDoctorSituation(
  vitals: {
    heartRate: number;
    systolic: number;
    diastolic: number;
    bloodSugar: number;
    bodyTemperature: number;
    sleepDuration: number;
  },
  responses: ClinicalInterviewResponses,
  profile: AstronautProfile
): DoctorSituationPrediction {
  let penaltySum = 0;
  let redFlagCount = 0;
  let yellowFlagCount = 0;
  const identifiedSymptoms: string[] = [];
  const recommendedCountermeasures: string[] = [];

  // 1. Evaluate Symptom Responses
  DOCTOR_CLINICAL_QUESTIONS.forEach((q) => {
    const selectedVal = responses[q.id];
    const option = q.options.find((opt) => opt.value === selectedVal);
    if (option) {
      penaltySum += option.penalty;
      if (option.severity === 'RED') {
        redFlagCount++;
        identifiedSymptoms.push(q.category + ' (' + option.label + ')');
      } else if (option.severity === 'YELLOW') {
        yellowFlagCount++;
        identifiedSymptoms.push(q.category + ' (' + option.label + ')');
      }
    }
  });

  // 2. Correlate with Vital Telemetry
  const hrBaseline = profile.restingHeartRateBaseline || 65;
  const hrElevated = vitals.heartRate > hrBaseline + 18 || vitals.heartRate > 95;
  const hrCritical = vitals.heartRate > 115 || vitals.heartRate < 45;
  if (hrCritical) {
    penaltySum += 20;
    redFlagCount++;
    identifiedSymptoms.push('Acute Cardiac Rate Deviation');
  } else if (hrElevated) {
    penaltySum += 8;
    yellowFlagCount++;
  }

  const bpElevated = vitals.systolic >= 135 || vitals.diastolic >= 88;
  const bpCritical = vitals.systolic >= 150 || vitals.diastolic >= 96;
  if (bpCritical) {
    penaltySum += 20;
    redFlagCount++;
    identifiedSymptoms.push('Severe Hypertensive Arterial Pressure');
  } else if (bpElevated) {
    penaltySum += 8;
    yellowFlagCount++;
  }

  const tempFever = vitals.bodyTemperature >= 37.8;
  if (tempFever) {
    penaltySum += 22;
    redFlagCount++;
    identifiedSymptoms.push('Thermoregulatory Hyperthermia / Pyrexia');
  }

  const sleepDeprived = vitals.sleepDuration < 6.0;
  if (vitals.sleepDuration < 4.5) {
    penaltySum += 15;
    redFlagCount++;
    identifiedSymptoms.push('Severe Sleep Deprivation (<4.5h)');
  } else if (sleepDeprived) {
    penaltySum += 7;
    yellowFlagCount++;
  }

  // 3. Calculate Overall Patient Wellness Score (0 - 100)
  const patientWellnessScore = Math.max(8, Math.min(100, Math.round(100 - penaltySum)));

  // 4. Determine Clinical Situation Severity
  let severity: HealthStatus = 'GREEN';
  let statusLabel = 'Nominal Flight Readiness';

  if (redFlagCount >= 2 || patientWellnessScore < 50 || tempFever || bpCritical || hrCritical) {
    severity = 'RED';
    statusLabel = 'Clinical Alert — Action Required';
  } else if (redFlagCount === 1 || yellowFlagCount >= 2 || patientWellnessScore < 75 || hrElevated || bpElevated) {
    severity = 'YELLOW';
    statusLabel = 'Medical Advisory — Active Monitoring';
  }

  // 5. Synthesize Situation Title, Impression & Primary Risk Factor
  let situationTitle = 'Optimal Microgravity Adaptation';
  let primaryRiskFactor = 'Microgravity Environmental Baseline';
  let clinicalImpression = '';
  let flightSurgeonGuidance = '';

  if (responses.motionSickness === 'active') {
    situationTitle = 'Acute Space Adaptation Syndrome (SAS Grade 2+)';
    primaryRiskFactor = 'Neuro-Vestibular Sensory Conflict';
    clinicalImpression = `Astronaut reports active motion sickness, stomach awareness, and vestibular vertigo upon head turns. Telemetry demonstrates compensatory autonomic activation (HR: ${vitals.heartRate} BPM). Acute microgravity otolith-canal sensory mismatch is evident.`;
    recommendedCountermeasures.push('Administer prescribed antiemetic countermeasure (Promethazine / Ondansetron as directed by CMO)');
    recommendedCountermeasures.push('Restrict rapid multi-axis head rotations; maintain fixed visual horizon reference point');
    recommendedCountermeasures.push('Postpone scheduled high-acceleration or EVA tasks until vestibular equilibration');
    flightSurgeonGuidance = 'Hold current operational checklist. Rest in neutral body posture with head stabilized. Hydrate with electrolyte sips.';
  } else if (responses.headPressure === 'severe' || (responses.headPressure === 'moderate' && bpElevated)) {
    situationTitle = 'Pronounced Cephalad Fluid Shift & Cranial Congestion';
    primaryRiskFactor = 'Venous Microgravity Fluid Redistribution';
    clinicalImpression = `Astronaut exhibits significant cranial pressure, facial engorgement, and sinus discomfort, exacerbated by blood pressure at ${vitals.systolic}/${vitals.diastolic} mmHg. This pattern indicates pronounced microgravity fluid redistribution and elevated jugular venous filling.`;
    recommendedCountermeasures.push('Deploy Lower Body Negative Pressure (LBNP) session (25 mmHg for 30 minutes) to draw fluids caudal');
    recommendedCountermeasures.push('Conduct visual acuity and Amsler grid self-check to evaluate optic disc swelling (SANS protocol)');
    recommendedCountermeasures.push('Ensure personal cabin ventilation ducting is unimpeded to minimize localized CO2 pockets');
    flightSurgeonGuidance = 'Perform LBNP countermeasure and take 200mg ibuprofen if sinus throbbing persists. Log repeat BP in 2 hours.';
  } else if (responses.breathingChest === 'cough_strain' || (responses.breathingChest === 'slight_tightness' && hrElevated)) {
    situationTitle = 'Cardiopulmonary Strain & Possible Cabin Hypercapnia';
    primaryRiskFactor = 'Elevated Cabin PCO2 / Respiratory Exertion';
    clinicalImpression = `Patient reports respiratory restriction, chest tightness, or air hunger, with concurrent heart rate of ${vitals.heartRate} BPM. Differential includes localized CO2 pocketing around the crew quarters or physical cardiopulmonary overexertion.`;
    recommendedCountermeasures.push('Check ECLSS cabin PCO2 sensor reading; ensure auxiliary ventilation fan is active');
    recommendedCountermeasures.push('Perform 5-minute deep diaphragmatic 4-4-4 box breathing in clear airflow stream');
    recommendedCountermeasures.push('Review recent exercise wattages on CEVIS cycle ergometer for acute overtraining');
    flightSurgeonGuidance = 'Step away from enclosed workstations into main module airflow. Report any persistent substernal pain immediately.';
  } else if (responses.physicalEnergy === 'exhausted' || (responses.mentalFocus === 'impaired' && sleepDeprived)) {
    situationTitle = 'Circadian Desynchronization & Acute Operational Fatigue';
    primaryRiskFactor = 'Sleep Debt & Mission Exertion Strain';
    clinicalImpression = `Clinical responses reflect severe stamina depletion, sluggish cognitive processing, and sleep deficit (${vitals.sleepDuration} hrs). Psychomotor vigilance is degraded, increasing risk of checklist omission.`;
    recommendedCountermeasures.push('Schedule mandatory 45-minute tactical power nap prior to afternoon critical operations');
    recommendedCountermeasures.push('Shift cabin lighting spectrum to 460nm melatonin-suppressing spectrum during work block');
    recommendedCountermeasures.push('Optimize pre-sleep protocol: eliminate blue light 60 mins before sleep chamber entry');
    flightSurgeonGuidance = 'Stand down from high-consequence robotic arm operations. Hydrate and take an unscheduled restorative rest block.';
  } else if (responses.muscleSpineDiscomfort === 'severe') {
    situationTitle = 'Acute Microgravity Spinal Decompression Lumbago';
    primaryRiskFactor = 'Intervertebral Disc Expansion & Core Muscle Atrophy';
    clinicalImpression = `Astronaut presents with significant spinal pain and lumbar stiffness, common with 3–5 cm microgravity spinal lengthening. Musculoskeletal tension is hindering optimal crew mobility.`;
    recommendedCountermeasures.push('Execute 15-minute Fetal-Tuck spinal decompression stretch on exercise mat');
    recommendedCountermeasures.push('Don Skinsuit or elastic axial loading countermeasure garment for 2 hours');
    recommendedCountermeasures.push('Apply warm therapeutic compress to lumbar paraspinal musculature');
    flightSurgeonGuidance = 'Avoid heavy resistance ARED deadlifts today. Perform gentle axial core stabilization exercises.';
  } else if (severity === 'YELLOW') {
    situationTitle = 'Mild Microgravity Adaptation Strain';
    primaryRiskFactor = 'Multisystem Spaceflight Readjustment';
    clinicalImpression = `Mild physiological adaptation observed across ${identifiedSymptoms.join(', ') || 'reported symptoms'}. Vital signs remain within acceptable operational tolerances. The astronaut is demonstrating expected orbital adaptation.`;
    recommendedCountermeasures.push('Hydration check: drink 500 mL water with electrolyte rehydration salts');
    recommendedCountermeasures.push('Complete scheduled 30-minute CEVIS cycling workout at steady 70% aerobic capacity');
    recommendedCountermeasures.push('Ensure 8.0-hour uninterrupted sleep chamber isolation block tonight');
    flightSurgeonGuidance = 'Routine operational clearance granted. Maintain hydration and report any escalation in symptoms.';
  } else {
    situationTitle = 'Nominal Spaceflight Adaptation & High Readiness';
    primaryRiskFactor = 'Minimal Flight Risk Observed';
    clinicalImpression = `Comprehensive review of vital telemetry (HR: ${vitals.heartRate} BPM, BP: ${vitals.systolic}/${vitals.diastolic} mmHg) and subjective clinical inquiry reveals outstanding physical adaptation, crisp cognitive clarity, and optimal microgravity tolerance.`;
    recommendedCountermeasures.push('Maintain regular mission workout schedule on T2 Treadmill / ARED');
    recommendedCountermeasures.push('Continue standard balanced spaceflight nutritional regimen');
    recommendedCountermeasures.push('Optimal crew physical readiness verified');
    flightSurgeonGuidance = 'Full mission clearance for all nominal EVA, robotic, and payload tasks. Keep up the excellent work.';
  }

  return {
    situationTitle,
    severity,
    statusLabel,
    clinicalImpression,
    patientWellnessScore,
    primaryRiskFactor,
    recommendedCountermeasures,
    flightSurgeonGuidance,
  };
}

/**
 * Optional Gemini AI Flight Surgeon Enhancement
 * Generates an individualized doctor's clinical consultation note when API key is active.
 */
export async function generateAiDoctorClinicalNote(
  vitals: {
    heartRate: number;
    systolic: number;
    diastolic: number;
    bloodSugar: number;
    bodyTemperature: number;
    sleepDuration: number;
  },
  responses: ClinicalInterviewResponses,
  profile: AstronautProfile
): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  try {
    const model = getGeminiModel().replace(/^models\//, '').trim();
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `You are Dr. Orion, NASA AI Flight Surgeon aboard deep space habitat DSH-04.
Patient: ${profile.rank} ${profile.name}, Sol ${profile.currentMissionDay}.
Vitals: Heart Rate ${vitals.heartRate} BPM, Blood Pressure ${vitals.systolic}/${vitals.diastolic} mmHg, Glucose ${vitals.bloodSugar} mg/dL, Temp ${vitals.bodyTemperature}°C, Sleep ${vitals.sleepDuration} hrs.
Patient Symptom Inquiry:
- Physical Stamina: ${responses.physicalEnergy}
- Vestibular / Motion Sickness: ${responses.motionSickness}
- Head & Sinus Pressure: ${responses.headPressure}
- Musculoskeletal / Back: ${responses.muscleSpineDiscomfort}
- Breathing & Chest: ${responses.breathingChest}
- Mental Focus & Alertness: ${responses.mentalFocus}

Provide a 2-to-3 sentence clinical flight surgeon impression speaking directly to the astronaut like a caring, highly experienced aerospace medical doctor. Give clear situational reassurance or precise instructions. Do not use markdown headers or bullet points.`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 250 },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && typeof text === 'string' && text.trim().length > 10) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn('[ClinicalInterviewService] AI Doctor Note enhancement skipped:', err);
  }

  return null;
}
