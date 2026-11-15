/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Storage Service (LocalStorage Prototype)
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 * 
 * Manages assessment records and crew profile in browser LocalStorage.
 * Auto-seeds realistic sample demonstration data if empty.
 */

import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { SAMPLE_ASTRONAUT_PROFILE, SAMPLE_ASSESSMENT_HISTORY } from '../data/mockData';
import { FacialScanRecord } from '../types/facialScan';

const ASSESSMENTS_STORAGE_KEY = 'aegis_astronaut_health_records_v1';
const PROFILE_STORAGE_KEY = 'aegis_astronaut_profile_v1';
const FACIAL_SCANS_STORAGE_KEY = 'aegis_facial_scans_v1';

export const INITIAL_SAMPLE_FACIAL_SCANS: FacialScanRecord[] = [
  {
    id: 'FSCAN-SOL142-DEMO-01',
    timestamp: '2026-11-14T09:30:00.000Z',
    missionSol: 142,
    astronautId: 'ASTRO-2026-ALPHA',
    astronautName: 'Cmdr. Alex Vance',
    stressScore: 32,
    stressCategory: 'Low',
    stressConfidence: 88,
    contributingStressFactors: [
      'Glabellar forehead musculature relaxed',
      'Normal bilateral eye aperture (86% openness)',
      'Regular blink frequency (14 blinks/min)',
    ],
    primaryEmotion: 'Neutral',
    primaryEmotionConfidence: 78,
    emotionBreakdown: [
      { emotion: 'Neutral', score: 78, label: 'Nominal Composure' },
      { emotion: 'Happy', score: 14, label: 'Elevated Morale' },
      { emotion: 'Sad', score: 4, label: 'Fatigue Trace' },
      { emotion: 'Surprised', score: 2, label: 'Attentive' },
      { emotion: 'Angry', score: 1, label: 'Tension' },
      { emotion: 'Fearful', score: 1, label: 'Arousal' },
      { emotion: 'Disgusted', score: 0, label: 'Sensory Conflict' },
    ],
    eyeAnalysis: {
      opennessPercent: 86,
      leftEyeOpen: true,
      rightEyeOpen: true,
      blinkCount: 5,
      blinkRatePerMin: 14,
      fatigueLevel: 'Minimal',
      scleralRednessIndex: 'Normal',
      observedNotes: 'Scleral appearance clear with regular bilateral eye aperture.',
    },
    skinAnalysis: {
      lightingQuality: 'Optimal',
      perfusionTone: 'Nominal Microcirculation',
      microgravityFluidShift: 'Mild Cephalic Engorgement',
      observedNotes: 'Cephalic fluid redistribution status: Mild Cephalic Engorgement.',
    },
    recommendedCountermeasures: [
      'Maintain nominal mission routine and scheduled CEVIS ergometer workout',
      'Optimal facial composure and focus verified',
    ],
    flightSurgeonAdvisory: 'NOMINAL: Facial expression and ocular metrics indicate steady adaptation to microgravity operational environment.',
    analysisMethod: 'Onboard Neural Computer Vision',
    isExperimental: true,
  },
  {
    id: 'FSCAN-SOL141-DEMO-02',
    timestamp: '2026-11-13T14:15:00.000Z',
    missionSol: 141,
    astronautId: 'ASTRO-2026-ALPHA',
    astronautName: 'Cmdr. Alex Vance',
    stressScore: 54,
    stressCategory: 'Moderate',
    stressConfidence: 84,
    contributingStressFactors: [
      'Mild corrugator brow furrowing observed following EVA egress',
      'Slight eye fatigue and narrowed aperture (72% openness)',
      'Elevated blink frequency (20 blinks/min)',
    ],
    primaryEmotion: 'Sad',
    primaryEmotionConfidence: 62,
    emotionBreakdown: [
      { emotion: 'Sad', score: 62, label: 'Post-EVA Fatigue' },
      { emotion: 'Neutral', score: 24, label: 'Baseline' },
      { emotion: 'Angry', score: 8, label: 'Muscle Strain' },
      { emotion: 'Happy', score: 4, label: 'Relief' },
      { emotion: 'Surprised', score: 1, label: 'Attentive' },
      { emotion: 'Fearful', score: 1, label: 'Arousal' },
      { emotion: 'Disgusted', score: 0, label: 'Sensory Conflict' },
    ],
    eyeAnalysis: {
      opennessPercent: 72,
      leftEyeOpen: true,
      rightEyeOpen: true,
      blinkCount: 8,
      blinkRatePerMin: 20,
      fatigueLevel: 'Moderate',
      scleralRednessIndex: 'Mild Injection',
      observedNotes: 'Mild scleral redness post 6-hour EVA visor exposure.',
    },
    skinAnalysis: {
      lightingQuality: 'Optimal',
      perfusionTone: 'Nominal Microcirculation',
      microgravityFluidShift: 'Mild Cephalic Engorgement',
      observedNotes: 'Facial flush resolving post airlock re-pressurization.',
    },
    recommendedCountermeasures: [
      'Hydration check: drink 500 mL water with electrolyte tablet',
      'Perform 20-20-20 eye relaxation protocol (look at distant object for 20s)',
    ],
    flightSurgeonAdvisory: 'NOTICE: Moderate post-EVA physical fatigue detected. Correlate with rest schedule.',
    analysisMethod: 'Onboard Neural Computer Vision',
    isExperimental: true,
  },
  {
    id: 'FSCAN-SOL140-DEMO-03',
    timestamp: '2026-11-12T08:45:00.000Z',
    missionSol: 140,
    astronautId: 'ASTRO-2026-ALPHA',
    astronautName: 'Cmdr. Alex Vance',
    stressScore: 28,
    stressCategory: 'Low',
    stressConfidence: 90,
    contributingStressFactors: [
      'Relaxed facial musculature after 8.2 hours sleep chamber block',
      'Wide open bilateral eye aperture (88%)',
    ],
    primaryEmotion: 'Happy',
    primaryEmotionConfidence: 74,
    emotionBreakdown: [
      { emotion: 'Happy', score: 74, label: 'High Readiness' },
      { emotion: 'Neutral', score: 20, label: 'Baseline' },
      { emotion: 'Surprised', score: 3, label: 'Attentive' },
      { emotion: 'Sad', score: 1, label: 'Fatigue' },
      { emotion: 'Angry', score: 1, label: 'Tension' },
      { emotion: 'Fearful', score: 1, label: 'Arousal' },
      { emotion: 'Disgusted', score: 0, label: 'Sensory Conflict' },
    ],
    eyeAnalysis: {
      opennessPercent: 88,
      leftEyeOpen: true,
      rightEyeOpen: true,
      blinkCount: 4,
      blinkRatePerMin: 12,
      fatigueLevel: 'Minimal',
      scleralRednessIndex: 'Normal',
      observedNotes: 'Alert, clear ocular tracking.',
    },
    skinAnalysis: {
      lightingQuality: 'Optimal',
      perfusionTone: 'Nominal Microcirculation',
      microgravityFluidShift: 'Mild Cephalic Engorgement',
      observedNotes: 'Nominal microgravity facial tone.',
    },
    recommendedCountermeasures: [
      'Maintain nominal mission routine',
    ],
    flightSurgeonAdvisory: 'NOMINAL: Excellent psychological and physical readiness.',
    analysisMethod: 'Onboard Neural Computer Vision',
    isExperimental: true,
  },
];

/**
 * Retrieves all stored assessment records (newest first).
 * Automatically seeds sample demonstration data on first launch.
 */
export function getStoredAssessments(): DailyAssessmentRecord[] {
  try {
    const raw = localStorage.getItem(ASSESSMENTS_STORAGE_KEY);
    if (!raw) {
      // Seed with initial realistic demonstration records
      saveAssessmentsToStorage(SAMPLE_ASSESSMENT_HISTORY);
      return SAMPLE_ASSESSMENT_HISTORY;
    }
    const parsed = JSON.parse(raw) as DailyAssessmentRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveAssessmentsToStorage(SAMPLE_ASSESSMENT_HISTORY);
      return SAMPLE_ASSESSMENT_HISTORY;
    }
    return parsed;
  } catch (err) {
    console.error('[Aegis Storage] Failed reading records from LocalStorage:', err);
    return SAMPLE_ASSESSMENT_HISTORY;
  }
}

/**
 * Saves full array of records to LocalStorage
 */
export function saveAssessmentsToStorage(records: DailyAssessmentRecord[]): void {
  try {
    localStorage.setItem(ASSESSMENTS_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('[Aegis Storage] Failed saving records to LocalStorage:', err);
  }
}

/**
 * Adds a new daily assessment record at the top of history
 */
export function saveAssessment(record: DailyAssessmentRecord): DailyAssessmentRecord[] {
  const current = getStoredAssessments();
  const updated = [record, ...current];
  saveAssessmentsToStorage(updated);
  return updated;
}

/**
 * Finds an assessment by unique ID
 */
export function getAssessmentById(id: string): DailyAssessmentRecord | undefined {
  const all = getStoredAssessments();
  return all.find((item) => item.id === id);
}

/**
 * Gets the most recent submitted assessment record
 */
export function getLatestAssessment(): DailyAssessmentRecord | undefined {
  const all = getStoredAssessments();
  return all.length > 0 ? all[0] : undefined;
}

/**
 * Checks if an assessment was completed on the current mission day
 */
export function hasCompletedTodayAssessment(currentMissionDay: number): boolean {
  const latest = getLatestAssessment();
  if (!latest) return false;
  return latest.missionDay === currentMissionDay;
}

/**
 * Retrieves the astronaut profile
 */
export function getAstronautProfile(): AstronautProfile {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(SAMPLE_ASTRONAUT_PROFILE));
      return SAMPLE_ASTRONAUT_PROFILE;
    }
    return JSON.parse(raw) as AstronautProfile;
  } catch (err) {
    console.error('[Aegis Storage] Failed reading profile from LocalStorage:', err);
    return SAMPLE_ASTRONAUT_PROFILE;
  }
}

/**
 * Updates the astronaut profile
 */
export function saveAstronautProfile(profile: AstronautProfile): void {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('[Aegis Storage] Failed saving profile to LocalStorage:', err);
  }
}

/**
 * Resets storage back to initial sample demonstration data
 */
export function resetToSampleData(): DailyAssessmentRecord[] {
  saveAssessmentsToStorage(SAMPLE_ASSESSMENT_HISTORY);
  saveAstronautProfile(SAMPLE_ASTRONAUT_PROFILE);
  saveFacialScansToStorage(INITIAL_SAMPLE_FACIAL_SCANS);
  return SAMPLE_ASSESSMENT_HISTORY;
}

/**
 * Completely clears all assessment records (useful for fresh testing)
 */
export function clearAllAssessments(): void {
  localStorage.removeItem(ASSESSMENTS_STORAGE_KEY);
  localStorage.removeItem(FACIAL_SCANS_STORAGE_KEY);
}

/**
 * Retrieves all stored AI Facial Health Scan records (newest first).
 * Seeds with initial demonstration scans if empty.
 */
export function getStoredFacialScans(): FacialScanRecord[] {
  try {
    const raw = localStorage.getItem(FACIAL_SCANS_STORAGE_KEY);
    if (!raw) {
      saveFacialScansToStorage(INITIAL_SAMPLE_FACIAL_SCANS);
      return INITIAL_SAMPLE_FACIAL_SCANS;
    }
    const parsed = JSON.parse(raw) as FacialScanRecord[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveFacialScansToStorage(INITIAL_SAMPLE_FACIAL_SCANS);
      return INITIAL_SAMPLE_FACIAL_SCANS;
    }
    return parsed;
  } catch (err) {
    console.error('[Aegis Storage] Failed reading facial scans from LocalStorage:', err);
    return INITIAL_SAMPLE_FACIAL_SCANS;
  }
}

/**
 * Saves facial scans array to LocalStorage
 */
export function saveFacialScansToStorage(scans: FacialScanRecord[]): void {
  try {
    localStorage.setItem(FACIAL_SCANS_STORAGE_KEY, JSON.stringify(scans));
  } catch (err) {
    console.error('[Aegis Storage] Failed saving facial scans to LocalStorage:', err);
  }
}

/**
 * Adds a newly completed facial scan record to the top of history
 */
export function saveFacialScan(scan: FacialScanRecord): FacialScanRecord[] {
  const current = getStoredFacialScans();
  const updated = [scan, ...current];
  saveFacialScansToStorage(updated);
  return updated;
}

/**
 * Gets the most recent facial scan record
 */
export function getLatestFacialScan(): FacialScanRecord | undefined {
  const all = getStoredFacialScans();
  return all.length > 0 ? all[0] : undefined;
}


