/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: AI Facial Analysis & Camera-Based Stress Monitoring Types
 * 
 * Defines data structures for:
 *  - Real-time video frame landmarks and eye aspect ratios
 *  - Facial emotion classification (7 standard categories)
 *  - Camera-based experimental stress assessment (0-100 score)
 *  - Observable ocular and facial appearance indicators
 *  - Historical longitudinal records
 */

export type FacialEmotion =
  | 'Happy'
  | 'Sad'
  | 'Angry'
  | 'Neutral'
  | 'Surprised'
  | 'Fearful'
  | 'Disgusted';

export type StressCategory = 'Low' | 'Moderate' | 'High';

export type EyeFatigueLevel = 'Minimal' | 'Mild' | 'Moderate' | 'Severe';

export interface EmotionScore {
  emotion: FacialEmotion;
  score: number; // 0 - 100 percentage
  label: string;
}

export interface EyeAnalysisData {
  opennessPercent: number; // 0 - 100%
  leftEyeOpen: boolean;
  rightEyeOpen: boolean;
  blinkCount: number;
  blinkRatePerMin: number; // Estimated blinks / min
  fatigueLevel: EyeFatigueLevel;
  scleralRednessIndex: 'Normal' | 'Mild Injection' | 'Elevated';
  observedNotes: string;
}

export interface SkinAppearanceData {
  lightingQuality: 'Optimal' | 'Acceptable' | 'Poor / Underexposed';
  perfusionTone: 'Nominal Microcirculation' | 'Mild Pallor' | 'Flushed';
  microgravityFluidShift: 'None Detected' | 'Mild Cephalic Engorgement' | 'Pronounced Puffy-Face Pattern';
  observedNotes: string;
}

export interface FacialScanRecord {
  id: string;
  timestamp: string; // ISO 8601
  missionSol: number;
  astronautId: string;
  astronautName: string;
  
  // Stress Assessment (Experimental)
  stressScore: number; // 0 - 100
  stressCategory: StressCategory;
  stressConfidence: number; // 0 - 100%
  contributingStressFactors: string[];
  
  // Emotion Analysis
  primaryEmotion: FacialEmotion;
  primaryEmotionConfidence: number;
  emotionBreakdown: EmotionScore[];
  
  // Ocular & Facial Appearance
  eyeAnalysis: EyeAnalysisData;
  skinAnalysis: SkinAppearanceData;
  
  // Clinical / Spaceflight Countermeasures
  recommendedCountermeasures: string[];
  flightSurgeonAdvisory: string;
  
  // Provenance & Snapshot
  thumbnailDataUrl?: string; // Captured face preview (optional compressed base64)
  analysisMethod: 'Onboard Neural Computer Vision' | 'Gemini 2.0 Multimodal AI + Computer Vision';
  isExperimental: boolean; // Always true to enforce medical safety disclaimer
}

export interface LiveFaceTrackingHUD {
  faceDetected: boolean;
  faceBox: { x: number; y: number; width: number; height: number } | null;
  eyeAspectLeft: number;
  eyeAspectRight: number;
  browTension: number;
  mouthTension: number;
  lightingLux: number;
  fps: number;
}
