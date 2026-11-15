/**
 * Aegis Health — Daily Health Check-in
 * Conforms to Section 10.5 of PLAN.md
 * 
 * 3-Stage Clinical Workflow:
 *  1. Capture Biometric Vitals (Live telemetry or manual entry)
 *  2. Doctor's Clinical Inquiry: "How Are You Feeling?" (6 Systemic Diagnostic Questions)
 *     -> Real-time Doctor's Situation Prediction (Vitals + Symptom Responses)
 *  3. Review & Verification -> Commit to History
 */

import React, { useState, useMemo } from 'react';
import {
  Heart,
  Gauge,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  CheckCircle,
  Camera,
  Layers,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  Eye,
  Stethoscope,
  Bot,
  Activity,
  MessageSquare,
  Check,
} from 'lucide-react';
import {
  DailyAssessmentRecord,
  MoodType,
  AstronautProfile,
  ParsedAssessmentValues,
  ClinicalInterviewResponses,
} from '../types/health';
import { MOOD_OPTIONS } from '../config/thresholds';
import { evaluateAllIndicators, calculateOverallHealth } from '../services/healthStatus';
import { useTelemetrySnapshot } from '../stores/telemetryStore';
import { saveCheckInRecord } from '../services/persistence/historyRepository';
import {
  DOCTOR_CLINICAL_QUESTIONS,
  DEFAULT_CLINICAL_RESPONSES,
  predictDoctorSituation,
  generateAiDoctorClinicalNote,
} from '../services/clinicalInterviewService';

interface DailyAssessmentProps {
  profile: AstronautProfile;
  onSubmitSuccess: (record: DailyAssessmentRecord) => void;
  onNavigateToDashboard: () => void;
  onNavigateToChat?: () => void;
}

export const DailyAssessment: React.FC<DailyAssessmentProps> = ({
  profile,
  onSubmitSuccess,
  onNavigateToDashboard,
  onNavigateToChat,
}) => {
  const liveSnapshot = useTelemetrySnapshot();

  const [stage, setStage] = useState<'capture' | 'feel' | 'review'>('capture');
  const [capturedFromStream, setCapturedFromStream] = useState(false);
  const [provenanceKind, setProvenanceKind] = useState<'simulation' | 'device' | 'manual'>('manual');

  // Form values — Stage 1 Vitals
  const [heartRate, setHeartRate] = useState<string>('');
  const [systolic, setSystolic] = useState<string>('');
  const [diastolic, setDiastolic] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [bodyTemperature, setBodyTemperature] = useState<string>('');

  // Form values — Stage 2 Clinical Inquiry
  const [clinicalResponses, setClinicalResponses] = useState<ClinicalInterviewResponses>(DEFAULT_CLINICAL_RESPONSES);
  const [sleepDuration, setSleepDuration] = useState<string>('7.5');
  const [mood, setMood] = useState<MoodType>('good');
  const [visionHeadache, setVisionHeadache] = useState<'no' | 'yes'>('no');
  const [notes, setNotes] = useState<string>('');
  const [aiDoctorNote, setAiDoctorNote] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<DailyAssessmentRecord | null>(null);

  // Real-time Doctor's Situation Prediction as symptoms and vitals change
  const liveDoctorPrediction = useMemo(() => {
    const v = {
      heartRate: Number(heartRate) || 72,
      systolic: Number(systolic) || 118,
      diastolic: Number(diastolic) || 76,
      bloodSugar: Number(bloodSugar) || 92,
      bodyTemperature: Number(bodyTemperature) || 36.6,
      sleepDuration: Number(sleepDuration) || 7.5,
    };
    return predictDoctorSituation(v, clinicalResponses, profile);
  }, [heartRate, systolic, diastolic, bloodSugar, bodyTemperature, sleepDuration, clinicalResponses, profile]);

  const handleResponseChange = (questionId: keyof ClinicalInterviewResponses, value: string) => {
    setClinicalResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Capture from live telemetry stream
  const handleCaptureLiveStream = () => {
    const hr = liveSnapshot.heartRate?.value;
    const bp = liveSnapshot.bloodPressure?.value;
    const bs = liveSnapshot.bloodSugar?.value;
    const temp = liveSnapshot.bodyTemperature?.value;

    if (hr) setHeartRate(String(hr));
    if (bp) {
      setSystolic(String(bp.systolic));
      setDiastolic(String(bp.diastolic));
    }
    if (bs) setBloodSugar(String(bs));
    if (temp) setBodyTemperature(String(temp.toFixed(1)));

    setCapturedFromStream(true);
    setProvenanceKind(liveSnapshot.heartRate?.provenance?.kind === 'device' ? 'device' : 'simulation');
    setErrors({});
  };

  // Demo presets
  const handlePreset = (type: 'nominal' | 'warning' | 'critical') => {
    setProvenanceKind('simulation');
    if (type === 'nominal') {
      setHeartRate('72');
      setSystolic('118');
      setDiastolic('76');
      setBloodSugar('92');
      setBodyTemperature('36.6');
      setSleepDuration('7.75');
      setMood('good');
      setVisionHeadache('no');
      setClinicalResponses({
        physicalEnergy: 'high',
        motionSickness: 'none',
        headPressure: 'none',
        muscleSpineDiscomfort: 'none',
        breathingChest: 'easy',
        mentalFocus: 'sharp',
      });
      setNotes('Nominal mission Sol check-in.');
    } else if (type === 'warning') {
      setHeartRate('94');
      setSystolic('134');
      setDiastolic('86');
      setBloodSugar('122');
      setBodyTemperature('37.4');
      setSleepDuration('5.5');
      setMood('fatigued');
      setVisionHeadache('no');
      setClinicalResponses({
        physicalEnergy: 'moderate',
        motionSickness: 'mild',
        headPressure: 'moderate',
        muscleSpineDiscomfort: 'mild',
        breathingChest: 'slight_tightness',
        mentalFocus: 'slight_fog',
      });
      setNotes('Slight post-EVA fatigue and microgravity sinus fullness.');
    } else {
      setHeartRate('126');
      setSystolic('152');
      setDiastolic('96');
      setBloodSugar('160');
      setBodyTemperature('38.6');
      setSleepDuration('4.0');
      setMood('disoriented');
      setVisionHeadache('yes');
      setClinicalResponses({
        physicalEnergy: 'exhausted',
        motionSickness: 'active',
        headPressure: 'severe',
        muscleSpineDiscomfort: 'severe',
        breathingChest: 'cough_strain',
        mentalFocus: 'impaired',
      });
      setNotes('Significant exertion, acute motion sickness, and throbbing headache.');
    }
    setErrors({});
  };

  const validateStage1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const hrNum = Number(heartRate);
    if (!heartRate || isNaN(hrNum) || hrNum < 30 || hrNum > 220) {
      newErrors.heartRate = 'Enter valid HR (30–220 BPM)';
    }

    const sysNum = Number(systolic);
    const diaNum = Number(diastolic);
    if (!systolic || isNaN(sysNum) || sysNum < 60 || sysNum > 260) {
      newErrors.systolic = 'Enter valid Systolic (60–260)';
    }
    if (!diastolic || isNaN(diaNum) || diaNum < 35 || diaNum > 160) {
      newErrors.diastolic = 'Enter valid Diastolic (35–160)';
    }

    if (!bloodSugar || isNaN(Number(bloodSugar)) || Number(bloodSugar) < 30 || Number(bloodSugar) > 500) {
      newErrors.bloodSugar = 'Enter valid Blood Sugar (30–500 mg/dL)';
    }

    if (!bodyTemperature || isNaN(Number(bodyTemperature)) || Number(bodyTemperature) < 32 || Number(bodyTemperature) > 43) {
      newErrors.bodyTemperature = 'Enter valid Temperature (32–43 °C)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedToReview = async () => {
    setStage('review');
    // Try enhancing with Gemini AI doctor note asynchronously in background
    const v = {
      heartRate: Number(heartRate) || 72,
      systolic: Number(systolic) || 118,
      diastolic: Number(diastolic) || 76,
      bloodSugar: Number(bloodSugar) || 92,
      bodyTemperature: Number(bodyTemperature) || 36.6,
      sleepDuration: Number(sleepDuration) || 7.5,
    };
    generateAiDoctorClinicalNote(v, clinicalResponses, profile).then((note) => {
      if (note) setAiDoctorNote(note);
    }).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStage1()) {
      setStage('capture');
      return;
    }

    setIsSubmitting(true);
    const finalPrediction = {
      ...liveDoctorPrediction,
      flightSurgeonGuidance: aiDoctorNote || liveDoctorPrediction.flightSurgeonGuidance,
    };

    const parsedValues: ParsedAssessmentValues = {
      heartRate: Number(heartRate),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      bloodSugar: Number(bloodSugar),
      bodyTemperature: Number(bodyTemperature),
      sleepDuration: Number(sleepDuration) || 7.5,
      mood,
      visionHeadache,
      notes: notes.trim() || undefined,
      clinicalInterview: clinicalResponses,
      doctorPrediction: finalPrediction,
    };

    const results = evaluateAllIndicators(parsedValues, profile);
    const overall = calculateOverallHealth(results);

    const record: DailyAssessmentRecord = {
      id: `REC-SOL-${profile.currentMissionDay}-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      missionDay: profile.currentMissionDay,
      astronautId: profile.id,
      values: parsedValues,
      results,
      overall,
      clinicalInterview: clinicalResponses,
      doctorPrediction: finalPrediction,
      isDemonstrationData: provenanceKind === 'simulation',
    };

    // Save to unified history repository (IndexedDB + dual write)
    await saveCheckInRecord({
      id: record.id,
      missionDay: record.missionDay,
      timestamp: record.timestamp,
      astronautId: record.astronautId,
      provenanceKind,
      indicators: {
        heartRate: parsedValues.heartRate,
        systolic: parsedValues.systolic,
        diastolic: parsedValues.diastolic,
        bloodSugar: parsedValues.bloodSugar,
        bodyTemperature: parsedValues.bodyTemperature,
        sleepDuration: parsedValues.sleepDuration,
        mood: parsedValues.mood,
      },
      notes: parsedValues.notes,
      completeness: '6/6 indicators + clinical interview verified',
    });

    setIsSubmitting(false);
    setSubmittedRecord(record);
    onSubmitSuccess(record);
  };

  const handleDiscussWithDoctor = () => {
    if (!submittedRecord) return;
    const pred = submittedRecord.doctorPrediction || liveDoctorPrediction;
    const prompt = `Dr. Orion, review my Daily Health Check-in for Sol ${submittedRecord.missionDay}. Predicted Situation: ${pred.situationTitle} (${pred.statusLabel}, Wellness Score: ${pred.patientWellnessScore}/100). Impression: ${pred.clinicalImpression} Countermeasures: ${pred.recommendedCountermeasures.join('; ')}`;
    sessionStorage.setItem('dr_orion_auto_prompt', prompt);
    if (onNavigateToChat) {
      onNavigateToChat();
    } else {
      window.location.hash = '#/chat';
    }
  };

  // ── SUBMISSION COMPLETE CONFIRMATION VIEW ─────────────────────────
  if (submittedRecord) {
    const pred = submittedRecord.doctorPrediction || liveDoctorPrediction;
    return (
      <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#091128] border border-cyan-500/40 text-center space-y-6 shadow-2xl animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-950/50">
          <CheckCircle className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-100 font-sans">
            Daily Health Check-in & Doctor Assessment Recorded
          </h2>
          <p className="text-sm text-slate-300 font-mono">
            Mission Sol {submittedRecord.missionDay} • {submittedRecord.overall.summary}
          </p>
          <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-mono bg-[#060a1a] border border-slate-700 text-slate-400">
            Provenance: {provenanceKind === 'simulation' ? '⚡ Simulated stream' : 'Verified manual check-in'}
          </span>
        </div>

        {/* Doctor's Situation Assessment Card */}
        <div className={`p-5 rounded-2xl border text-left space-y-3 ${
          pred.severity === 'RED'
            ? 'bg-rose-950/25 border-rose-500/40'
            : pred.severity === 'YELLOW'
            ? 'bg-amber-950/25 border-amber-500/40'
            : 'bg-emerald-950/25 border-emerald-500/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                Predicted Clinical Situation
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                pred.severity === 'RED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : pred.severity === 'YELLOW'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {pred.statusLabel}
              </span>
              <span className="text-xs font-mono font-bold text-white bg-black/40 px-2 py-0.5 rounded">
                Wellness: {pred.patientWellnessScore}/100
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold text-white font-sans">{pred.situationTitle}</h4>
            <p className="text-xs text-slate-300 font-sans mt-1 leading-relaxed">
              {pred.clinicalImpression}
            </p>
          </div>

          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase">
              Flight Surgeon Guidance:
            </span>
            <p className="text-xs text-slate-200 font-mono">
              {pred.flightSurgeonGuidance}
            </p>
          </div>

          {pred.recommendedCountermeasures.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
                Prescribed Countermeasures:
              </span>
              <ul className="text-xs text-slate-300 font-sans space-y-1">
                {pred.recommendedCountermeasures.map((cm, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{cm}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={handleDiscussWithDoctor}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discuss with Dr. Orion in Chat</span>
          </button>
          <button
            onClick={onNavigateToDashboard}
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs font-bold transition-all border border-white/10"
          >
            Return to Health Monitor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100 font-sans">Astronaut Daily Health Check-in</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
              Clinical Protocol
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-mono mt-0.5">
            Mission Sol {profile.currentMissionDay} • Guided 3-stage clinical inquiry & situation prediction
          </p>
        </div>

        {/* Stepper pills */}
        <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            type="button"
            onClick={() => setStage('capture')}
            className={`px-3 py-1 rounded-lg transition-all ${
              stage === 'capture' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            1. Vitals
          </button>
          <span className="text-slate-600">→</span>
          <button
            type="button"
            onClick={() => {
              if (validateStage1()) setStage('feel');
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              stage === 'feel' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            2. Doctor's Inquiry
          </button>
          <span className="text-slate-600">→</span>
          <button
            type="button"
            onClick={() => {
              if (validateStage1()) handleProceedToReview();
            }}
            className={`px-3 py-1 rounded-lg transition-all ${
              stage === 'review' ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40' : 'text-slate-400'
            }`}
          >
            3. Review & Save
          </button>
        </div>
      </div>

      {/* Demo tools collapsible banner */}
      <details className="p-3.5 rounded-xl bg-space-950/80 border border-slate-800/80 text-xs font-mono">
        <summary className="cursor-pointer text-slate-400 hover:text-cyan-300 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Demo Tools & Preset Clinical Scenarios (Click to expand)</span>
        </summary>
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Load Preset:</span>
          <button
            type="button"
            onClick={() => handlePreset('nominal')}
            className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold"
          >
            Nominal Spaceflight
          </button>
          <button
            type="button"
            onClick={() => handlePreset('warning')}
            className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-bold"
          >
            Advisory Warning (SAS / Fluid Shift)
          </button>
          <button
            type="button"
            onClick={() => handlePreset('critical')}
            className="px-2.5 py-1 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-bold"
          >
            Critical Alert (Exertion / SANS Risk)
          </button>
        </div>
      </details>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ── STAGE 1: CAPTURE READINGS ──────────────────────────────── */}
        {stage === 'capture' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-space-900/60 border border-cyan-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans">Acquire Daily Vitals</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Capture from live astronaut telemetry sensors or enter readings manually.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCaptureLiveStream}
                className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <Activity className="w-4 h-4 animate-pulse" />
                <span>Fetch from Live Stream</span>
              </button>
            </div>

            {capturedFromStream && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live sensor data loaded. You may adjust or confirm values below.</span>
              </div>
            )}

            {/* Vitals Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Heart Rate */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.heartRate ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-rose-400">
                  <Heart className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Heart Rate (Pulse)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">BPM</span>
                </div>
                {errors.heartRate && <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.heartRate}</p>}
              </div>

              {/* Blood Pressure */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.systolic || errors.diastolic ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-cyan-400">
                  <Gauge className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Blood Pressure (Sys / Dia)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    placeholder="118"
                    className="w-20 bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-slate-400 text-xl font-mono">/</span>
                  <input
                    type="number"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    placeholder="76"
                    className="w-20 bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">mmHg</span>
                </div>
                {(errors.systolic || errors.diastolic) && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.systolic || errors.diastolic}</p>
                )}
              </div>

              {/* Blood Sugar */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.bloodSugar ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-amber-400">
                  <Droplets className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Blood Sugar (Glucose)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="92"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">mg/dL</span>
                </div>
                {errors.bloodSugar && <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.bloodSugar}</p>}
              </div>

              {/* Temperature */}
              <div className={`p-4 rounded-xl bg-space-950/80 border ${errors.bodyTemperature ? 'border-rose-500' : 'border-slate-800'}`}>
                <div className="flex items-center gap-2 mb-2 text-orange-400">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">Core Body Temperature</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <input
                    type="number"
                    step="0.1"
                    value={bodyTemperature}
                    onChange={(e) => setBodyTemperature(e.target.value)}
                    placeholder="36.6"
                    className="w-full bg-transparent text-2xl font-bold font-mono text-slate-100 focus:outline-none"
                  />
                  <span className="text-xs font-mono text-slate-400">°C</span>
                </div>
                {errors.bodyTemperature && (
                  <p className="text-[11px] text-rose-400 font-mono mt-1">{errors.bodyTemperature}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  if (validateStage1()) setStage('feel');
                }}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-sm"
              >
                <span>Continue to Doctor's Inquiry</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: DOCTOR'S CLINICAL INQUIRY ("HOW YOU FEEL") ─────── */}
        {stage === 'feel' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Doctor Consultation Header Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0c1a3b] via-[#091530] to-[#071128] border border-cyan-500/40 shadow-xl flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                <Stethoscope className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-sans">
                    Dr. Orion's Clinical Patient Inquiry — How Are You Feeling?
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 font-mono text-[10px] font-bold border border-cyan-500/30">
                    6 Diagnostic Questions
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Answer the following general questions like a patient consulting a doctor. Your responses, along with your measured vitals (HR: {heartRate || '—'} BPM, BP: {systolic || '—'}/{diastolic || '—'}), predict your current clinical situation and flight readiness.
                </p>
              </div>
            </div>

            {/* The 6 Clinical Doctor Questions Grid */}
            <div className="space-y-4">
              {DOCTOR_CLINICAL_QUESTIONS.map((q, qIndex) => {
                const currentVal = clinicalResponses[q.id];
                return (
                  <div
                    key={q.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#091128] border border-slate-800 space-y-3 shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-mono text-[10px] font-bold flex items-center justify-center">
                          {qIndex + 1}
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                          {q.category}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono italic">
                        {q.clinicalPurpose}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 font-sans">
                      {q.doctorInquiry}
                    </h4>

                    {/* 3 Selectable Response Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      {q.options.map((opt) => {
                        const isSelected = currentVal === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleResponseChange(q.id, opt.value)}
                            className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                : 'bg-[#060a1a]/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-xs font-bold font-mono ${
                                  isSelected
                                    ? 'text-cyan-300'
                                    : opt.severity === 'RED'
                                    ? 'text-rose-400'
                                    : opt.severity === 'YELLOW'
                                    ? 'text-amber-400'
                                    : 'text-slate-300'
                                }`}>
                                  {opt.label}
                                </span>
                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 font-sans leading-snug">
                                {opt.description}
                              </p>
                            </div>

                            <div className="mt-2 pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
                              <span className={
                                opt.severity === 'RED'
                                  ? 'text-rose-400'
                                  : opt.severity === 'YELLOW'
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }>
                                ● {opt.severity === 'GREEN' ? 'Nominal' : opt.severity === 'YELLOW' ? 'Advisory' : 'Warning'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sleep, SANS Vision & Notes Container */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#091128] border border-slate-800 space-y-4 shadow-md">
              <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Operational Routine & NASA SANS Protocol
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Sleep Duration */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 font-sans mb-1">
                    <Moon className="w-4 h-4 text-indigo-400" />
                    Restorative Sleep Duration (Hours)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={sleepDuration}
                    onChange={(e) => setSleepDuration(e.target.value)}
                    placeholder="7.5"
                    className="w-full sm:w-40 px-3 py-2 rounded-xl bg-[#060a1a] border border-slate-800 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                  />
                </div>

                {/* Subjective Mood Preset */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 font-sans mb-1">
                    <Smile className="w-4 h-4 text-emerald-400" />
                    Overall Readiness State
                  </label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value as MoodType)}
                    className="w-full px-3 py-2 rounded-xl bg-[#060a1a] border border-slate-800 text-slate-100 font-mono text-xs focus:outline-none focus:border-cyan-500/50"
                  >
                    {MOOD_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label} — {m.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SANS Vision & Headache Check (NASA HRP Protocol) */}
              <div className="p-3.5 rounded-xl bg-[#060a1a] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-200 font-sans">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    NASA SANS Vision Check (Spaceflight-Associated Neuro-ocular Syndrome)
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30">
                    HRP Risk: SANS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Did you experience visual acuity changes, near-vision blur, or persistent headache today?
                </p>
                <div className="flex gap-2 pt-1 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setVisionHeadache('no')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      visionHeadache === 'no'
                        ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                        : 'bg-[#091128] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    No (Nominal Acuity)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisionHeadache('yes')}
                    className={`px-3.5 py-1.5 rounded-xl transition-all ${
                      visionHeadache === 'yes'
                        ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40'
                        : 'bg-[#091128] border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Yes (Visual Blur or Headache Observed)
                  </button>
                </div>
              </div>

              {/* Operational Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-200 font-sans mb-1">
                  Optional Notes for Flight Surgeon
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record symptoms, workout wattages, EVA exertion, or mission activities..."
                  className="w-full p-3 rounded-xl bg-[#060a1a] border border-slate-800 text-slate-100 font-sans text-xs focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            {/* ── REAL-TIME DOCTOR'S PREDICTED CLINICAL SITUATION CARD ─── */}
            <div className={`p-5 rounded-2xl border space-y-3 transition-all ${
              liveDoctorPrediction.severity === 'RED'
                ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.15)]'
                : liveDoctorPrediction.severity === 'YELLOW'
                ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                : 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Flight Surgeon's Predicted Situation (Live Assessment)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    liveDoctorPrediction.severity === 'RED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : liveDoctorPrediction.severity === 'YELLOW'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {liveDoctorPrediction.statusLabel}
                  </span>
                  <span className="text-xs font-mono font-bold text-white bg-black/50 px-2 py-0.5 rounded border border-white/10">
                    Wellness Score: {liveDoctorPrediction.patientWellnessScore}/100
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <span>{liveDoctorPrediction.situationTitle}</span>
                </h4>
                <p className="text-xs text-slate-200 font-sans mt-1 leading-relaxed">
                  {liveDoctorPrediction.clinicalImpression}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase">
                    Primary Operational Risk Factor:
                  </span>
                  <span className="text-slate-200 font-mono mt-0.5 block">
                    {liveDoctorPrediction.primaryRiskFactor}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono font-bold text-cyan-400 block uppercase">
                    Doctor's Schedule Guidance:
                  </span>
                  <span className="text-slate-200 font-mono mt-0.5 block">
                    {liveDoctorPrediction.flightSurgeonGuidance}
                  </span>
                </div>
              </div>

              {liveDoctorPrediction.recommendedCountermeasures.length > 0 && (
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
                    Prescribed Aerospace Countermeasures:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300 font-sans">
                    {liveDoctorPrediction.recommendedCountermeasures.map((cm, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 font-bold">•</span>
                        <span>{cm}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage('capture')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#091128] border border-slate-800 text-slate-300 font-mono text-xs hover:bg-[#0c1635]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Vitals</span>
              </button>
              <button
                type="button"
                onClick={handleProceedToReview}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-sm"
              >
                <span>Proceed to Review & Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── STAGE 3: REVIEW & SAVE ─────────────────────────────────── */}
        {stage === 'review' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-2xl bg-[#091128] border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  Clinical Verification & Situation Summary
                </h3>
              </div>

              {/* Vitals Summary Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#060a1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">HEART RATE</span>
                  <span className="text-slate-100 font-bold text-sm">{heartRate} BPM</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">BLOOD PRESSURE</span>
                  <span className="text-slate-100 font-bold text-sm">{systolic}/{diastolic} mmHg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">GLUCOSE</span>
                  <span className="text-slate-100 font-bold text-sm">{bloodSugar} mg/dL</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#060a1a] border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">TEMPERATURE</span>
                  <span className="text-slate-100 font-bold text-sm">{bodyTemperature} °C</span>
                </div>
              </div>

              {/* Doctor's Predicted Clinical Situation in Review */}
              <div className={`p-4 rounded-xl border space-y-2.5 ${
                liveDoctorPrediction.severity === 'RED'
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : liveDoctorPrediction.severity === 'YELLOW'
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-emerald-950/20 border-emerald-500/40'
              }`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                    <Stethoscope className="w-4 h-4 text-cyan-400" />
                    Doctor's Situation Assessment
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    liveDoctorPrediction.severity === 'RED'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : liveDoctorPrediction.severity === 'YELLOW'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {liveDoctorPrediction.statusLabel}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white font-sans">{liveDoctorPrediction.situationTitle}</h4>
                  <p className="text-xs text-slate-300 font-sans mt-0.5">
                    {liveDoctorPrediction.clinicalImpression}
                  </p>
                </div>

                <div className="text-xs font-mono text-slate-200 pt-1 border-t border-white/10">
                  <span className="text-cyan-400 font-bold">Flight Surgeon Guidance: </span>
                  <span>{aiDoctorNote || liveDoctorPrediction.flightSurgeonGuidance}</span>
                </div>
              </div>

              {/* Provenance and storage tag */}
              <div className="p-3 rounded-lg bg-[#060a1a] border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
                <div>Provenance Tag: <span className="text-cyan-300 font-bold">{provenanceKind.toUpperCase()}</span></div>
                <div>Astronaut: <span className="text-slate-200">{profile.rank} {profile.name} (Sol {profile.currentMissionDay})</span></div>
                <div>Database Destination: <span className="text-slate-200">IndexedDB AegisHealthDB + Dual-Write Storage</span></div>
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <button
                type="button"
                onClick={() => setStage('feel')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#091128] border border-slate-800 text-slate-300 font-mono text-xs hover:bg-[#0c1635]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Doctor's Inquiry</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Recording Assessment...' : 'Commit Check-in & Doctor Assessment'}</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
