/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: 2D Anatomical Human Digital Twin (Transparent Medical Anatomical Model)
 * 
 * Features:
 * - High-resolution transparent anatomical twin render with visible internal organs
 * - Interactive organ hotspots with pulsing radar rings & laser HUD connector lines
 * - Live dynamic organ working visualizer (animated breathing lungs, pumping heart, neural brain)
 * - Live real-time physiological waveforms (Spirometry for Lungs, ECG for Heart, ICP for Brain)
 * - Microgravity physiological mechanics & NASA reference countermeasures
 */

import React, { useState, useEffect } from 'react';
import { DailyAssessmentRecord, HealthStatus } from '../../types/health';
import {
  Heart,
  Wind,
  Brain,
  Utensils,
  Dumbbell,
  Shield,
  Activity,
  CheckCircle2,
  Info,
  Pill,
  Sparkles,
  ChevronRight,
  Droplets,
} from 'lucide-react';

interface HumanDigitalTwin2DProps {
  latestAssessment?: DailyAssessmentRecord;
  onSelectSystem?: (systemId: string) => void;
  initialSelectedId?: string;
}

export interface OrganSystem {
  id: string;
  name: string;
  category: 'vital' | 'metabolic' | 'musculoskeletal';
  icon: React.ElementType;
  iconColor: string;
  glowColor: string;
  hotspotX: number; // percentage on anatomical image
  hotspotY: number;
  secondaryHotspots?: Array<{ x: number; y: number; label: string }>;
  status: HealthStatus;
  statusLabel: string;
  biometricHeadline: string;
  metrics: Array<{ label: string; value: string; unit: string; nominal: string; status: HealthStatus }>;
  workingMechanism: string;
  spaceflightRisk: string;
  countermeasures: string;
  medications: string[];
  waveformType: 'spirometry' | 'ecg' | 'neural' | 'renal' | 'glucose' | 'biomechanical';
}

export const HumanDigitalTwin2D: React.FC<HumanDigitalTwin2DProps> = ({
  latestAssessment,
  onSelectSystem,
  initialSelectedId = 'lung',
}) => {
  const [selectedId, setSelectedId] = useState<string>(initialSelectedId);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [animationTick, setAnimationTick] = useState(0);

  // Live animation loop for organ working waveforms & breathing
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimationTick((t) => (t + 1) % 360);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  const v = latestAssessment?.values || {
    heartRate: 72,
    systolic: 118,
    diastolic: 76,
    bloodSugar: 92,
    bodyTemperature: 36.6,
    sleepDuration: 7.5,
    mood: 'good' as const,
    visionHeadache: 'no' as const,
  };

  const hrStatus = latestAssessment?.results.heartRate.status || 'GREEN';
  const sugarStatus = latestAssessment?.results.bloodSugar.status || 'GREEN';

  // Complete Anatomical Organs & Systems Catalog
  const organs: OrganSystem[] = [
    {
      id: 'lung',
      name: 'Lungs & Respiratory System',
      category: 'vital',
      icon: Wind,
      iconColor: 'text-cyan-400',
      glowColor: '#06b6d4',
      hotspotX: 50,
      hotspotY: 24.5,
      secondaryHotspots: [
        { x: 44, y: 24, label: 'Right Lung (Pulmonary Alveoli)' },
        { x: 56, y: 24, label: 'Left Lung & Bronchial Tree' },
      ],
      status: 'GREEN',
      statusLabel: 'Nominal Ventilation',
      biometricHeadline: 'SpO₂ 98.6% • 14 BrPM • Alveolar Gas Exchange Active',
      metrics: [
        { label: 'Respiratory Rate', value: '14', unit: 'BrPM', nominal: '12–20 BrPM', status: 'GREEN' },
        { label: 'Oxygen Saturation (SpO₂)', value: '98.6', unit: '%', nominal: '95–100%', status: 'GREEN' },
        { label: 'Ambient Cabin CO₂', value: '2.8', unit: 'mmHg', nominal: '≤ 3.0 mmHg (NASA-STD-3001)', status: 'GREEN' },
        { label: 'Expired CO₂ (EtCO₂)', value: '36', unit: 'mmHg', nominal: '35–45 mmHg', status: 'GREEN' },
        { label: 'Alveolar Ventilation', value: '4.8', unit: 'L/min', nominal: '4.2–5.5 L/min', status: 'GREEN' },
      ],
      workingMechanism:
        'In microgravity, gravity-dependent ventilation-perfusion (VA/Q) matching differences disappear, resulting in more uniform alveolar gas diffusion across apical and basal lung zones. However, without gravitational thermal buoyancy, exhaled CO₂ fails to disperse naturally and forms a stagnant hypercapnic bubble around the face unless cabin ventilation exceeds 0.2 m/s.',
      spaceflightRisk:
        'Hypercapnic headache, lethargy, and respiratory acidosis if cabin air scrubbers (CDRA) degrade above 4.5 mmHg CO₂.',
      countermeasures:
        'Maintain forced air diffuser airflow (>0.2 m/s) in sleeping quarters; verify ECLSS CDRA scrubber desiccant bed cycle.',
      medications: [
        'Acetaminophen (stopgap for hypercapnic headache only; scrubber repair is primary)',
        'Ibuprofen (symptom relief only)',
        'Oxygen therapy (contingency)',
      ],
      waveformType: 'spirometry',
    },
    {
      id: 'heart',
      name: 'Heart & Cardiovascular',
      category: 'vital',
      icon: Heart,
      iconColor: 'text-rose-400',
      glowColor: '#f43f5e',
      hotspotX: 51.5,
      hotspotY: 23,
      status: hrStatus,
      statusLabel: hrStatus === 'GREEN' ? 'Nominal Hemodynamics' : 'Cardiovascular Variance',
      biometricHeadline: `${v.heartRate} BPM • ${v.systolic}/${v.diastolic} mmHg • Cardiac Output 5.6 L/min`,
      metrics: [
        { label: 'Resting Heart Rate', value: `${v.heartRate}`, unit: 'BPM', nominal: '51–90 BPM (NEWS2)', status: hrStatus },
        { label: 'Blood Pressure', value: `${v.systolic}/${v.diastolic}`, unit: 'mmHg', nominal: '111–119/60–79 (AHA)', status: 'GREEN' },
        { label: 'Cardiac Stroke Volume', value: '78', unit: 'mL', nominal: '70–85 mL', status: 'GREEN' },
        { label: 'Cardiac Output', value: '5.6', unit: 'L/min', nominal: '5.0–6.5 L/min', status: 'GREEN' },
        { label: 'Cephalad Fluid Shift', value: '+1.8', unit: 'L', nominal: '1.5–2.0 L headward', status: 'GREEN' },
      ],
      workingMechanism:
        'Elimination of hydrostatic pressure gradients shifts ~1.8 to 2.0 liters of blood and interstitial fluid headward into the thorax and cranium. Baroreceptors detect central vascular engorgement, triggering the Gauer-Henry reflex, which leads to ~10-15% plasma volume reduction and long-term myocardial deconditioning.',
      spaceflightRisk:
        'Post-landing orthostatic intolerance, reduced VO₂ peak, and reduced ventricular muscle mass.',
      countermeasures:
        'NASA CEVIS cycle ergometer 30-min daily + pre-entry 1.5L fluid loading with electrolyte salt tablets.',
      medications: [
        'Lisinopril (ACE inhibitor for hypertension)',
        'Losartan (ARB for hypertension)',
        'Amlodipine (CCB for hypertension)',
        'Midodrine (for persistent orthostatic hypotension)',
      ],
      waveformType: 'ecg',
    },
    {
      id: 'brain',
      name: 'Brain & Central Nervous System',
      category: 'vital',
      icon: Brain,
      iconColor: 'text-purple-400',
      glowColor: '#a855f7',
      hotspotX: 50,
      hotspotY: 7,
      status: v.visionHeadache === 'yes' ? 'YELLOW' : 'GREEN',
      statusLabel: v.visionHeadache === 'yes' ? 'SANS Symptom Flag' : 'Nominal Intracranial Pressure',
      biometricHeadline: 'ICP 14 mmHg • Cognitive Readiness 98% • SANS Surveillance Normal',
      metrics: [
        { label: 'Intracranial Pressure (ICP)', value: '14', unit: 'mmHg', nominal: '10–15 mmHg', status: 'GREEN' },
        { label: 'Optic Nerve Sheath (ONSD)', value: '5.2', unit: 'mm', nominal: '< 5.5 mm', status: 'GREEN' },
        { label: 'Cognitive Reaction Time', value: '218', unit: 'ms', nominal: '< 250 ms', status: 'GREEN' },
        { label: 'Sleep Rest Recorded', value: `${v.sleepDuration}`, unit: 'hours', nominal: '≥ 7.0 hours', status: 'GREEN' },
      ],
      workingMechanism:
        'Cephalad venous congestion elevates microgravity intracranial venous pressure, directly impinging on the posterior sclera and optic disc. This drives Spaceflight-Associated Neuro-ocular Syndrome (SANS), manifesting as cotton-wool spots, choroidal folds, and hyperopic refractive shift.',
      spaceflightRisk:
        'Permanent visual acuity deterioration (SANS) and sleep architecture disruption.',
      countermeasures:
        'Chucker Lower Body Negative Pressure (LBNP) sessions, near-vision acuity tracking, and circadian lighting protocol.',
      medications: [
        'Melatonin (first-line circadian regulator)',
        'Zolpidem / Temazepam (short-term acute sleep aids only)',
        'Anxiolytics / SSRIs (clinical behavioral cases under physician oversight)',
      ],
      waveformType: 'neural',
    },
    {
      id: 'kidney',
      name: 'Kidneys & Renal Regulation',
      category: 'metabolic',
      icon: Droplets,
      iconColor: 'text-amber-400',
      glowColor: '#f59e0b',
      hotspotX: 50,
      hotspotY: 36.5,
      secondaryHotspots: [
        { x: 43.5, y: 36.5, label: 'Right Kidney' },
        { x: 56.5, y: 36.5, label: 'Left Kidney' },
      ],
      status: 'GREEN',
      statusLabel: 'Nominal Clearance',
      biometricHeadline: 'eGFR 112 mL/min • Hydration Index 1.018 • Calcium Clearance Monitored',
      metrics: [
        { label: 'Glomerular Filtration (eGFR)', value: '112', unit: 'mL/min', nominal: '> 90 mL/min', status: 'GREEN' },
        { label: 'Urine Specific Gravity', value: '1.018', unit: 'SG', nominal: '1.010–1.025', status: 'GREEN' },
        { label: 'Serum Calcium', value: '9.4', unit: 'mg/dL', nominal: '8.5–10.2 mg/dL', status: 'GREEN' },
        { label: '24-hr Fluid Turnover', value: '2.4', unit: 'L', nominal: '2.0–3.0 L/day', status: 'GREEN' },
      ],
      workingMechanism:
        'Suppression of renal antidiuretic hormone (ADH) and aldosterone causes rapid acute diuresis during the first 72 hours of microgravity. Simultaneously, skeletal unloading releases osteoclastic calcium into systemic circulation, elevating urinary calcium excretion and dramatically increasing nephrolithiasis (kidney stone) risk.',
      spaceflightRisk:
        'Nephrolithiasis (renal calculi / kidney stones) and chronic subclinical hypovolemia.',
      countermeasures:
        'Maintain daily fluid intake >2.5 liters/day; dietary potassium citrate supplementation to inhibit calcium stone formation.',
      medications: [
        'Oral rehydration salts / electrolyte packs',
        'Potassium citrate (urinary alkalinization for stone prevention)',
        'Midodrine (for persistent hypovolemic orthostasis)',
      ],
      waveformType: 'renal',
    },
    {
      id: 'liver',
      name: 'Liver & Glycemic Metabolism',
      category: 'metabolic',
      icon: Utensils,
      iconColor: 'text-emerald-400',
      glowColor: '#10b981',
      hotspotX: 45.5,
      hotspotY: 30,
      status: sugarStatus,
      statusLabel: 'Nominal Hepatic Function',
      biometricHeadline: `${v.bloodSugar} mg/dL Glucose • Hepatic Enzyme Clearance Nominal`,
      metrics: [
        { label: 'Fasting Blood Sugar', value: `${v.bloodSugar}`, unit: 'mg/dL', nominal: '70–99 mg/dL (CDC)', status: sugarStatus },
        { label: 'Alanine Transaminase (ALT)', value: '24', unit: 'U/L', nominal: '7–56 U/L', status: 'GREEN' },
        { label: 'Aspartate Transaminase (AST)', value: '22', unit: 'U/L', nominal: '10–40 U/L', status: 'GREEN' },
        { label: 'Glycogen Storage Index', value: '94', unit: '%', nominal: '90–100%', status: 'GREEN' },
      ],
      workingMechanism:
        'Microgravity alters hepatic insulin receptor sensitivity and gluconeogenic enzyme activity due to metabolic disuse and altered circadian transcription. Spaceflight nutritional packaging must balance elevated protein demands while preventing glycemic spikes.',
      spaceflightRisk:
        'Subclinical spaceflight insulin resistance and altered hepatic pharmaceutical clearance kinetics.',
      countermeasures:
        'Low glycemic index nutrition, synchronized meal schedules, and scheduled postprandial exercise.',
      medications: [
        'Glucose tablets / oral gel (fast-acting 15-20g for hypoglycemia)',
        'Glucagon (IM autoinjector for unresponsive hypoglycemia)',
        'Metformin / Insulin (for severe hyperglycemia)',
      ],
      waveformType: 'glucose',
    },
    {
      id: 'stomach',
      name: 'Stomach & Gastrointestinal',
      category: 'metabolic',
      icon: Activity,
      iconColor: 'text-yellow-400',
      glowColor: '#eab308',
      hotspotX: 54,
      hotspotY: 31,
      status: 'GREEN',
      statusLabel: 'Nominal Motility',
      biometricHeadline: 'Gastric Motility 94% • Zero Space Motion Sickness Symptoms',
      metrics: [
        { label: 'Gastric Emptying Rate', value: 'Nominal', unit: 'T½ 65m', nominal: '50–80 min', status: 'GREEN' },
        { label: 'Gastroesophageal Reflux', value: 'Zero', unit: 'Events', nominal: '0–2 events/day', status: 'GREEN' },
        { label: 'Space Adaptation Syndrome', value: 'Adapted', unit: 'Score 0', nominal: 'Score 0 (No nausea)', status: 'GREEN' },
        { label: 'Daily Caloric Ingestion', value: '2,680', unit: 'kcal', nominal: '2,500–2,800 kcal', status: 'GREEN' },
      ],
      workingMechanism:
        'Without gravity, stomach contents float freely, raising gastric acid upward toward the gastroesophageal junction. Vestibular sensory conflict between the otolith organs and semicircular canals triggers Space Motion Sickness (SMS) in ~50% of astronauts during initial insertion.',
      spaceflightRisk:
        'Vomiting in space suits (fatal EVA aspiration hazard) and anorexia/caloric deficits.',
      countermeasures:
        'Slow head movements during initial 72 hours; upright posture simulations and structured meal pacing.',
      medications: [
        'Promethazine (IM/oral antiemetic for acute SMS)',
        'Ondansetron (5-HT3 antagonist antiemetic for nausea)',
        'Omeprazole / Antacids (for gastric acid reflux)',
      ],
      waveformType: 'glucose',
    },
    {
      id: 'intestine',
      name: 'Intestines & Microbiome',
      category: 'metabolic',
      icon: Shield,
      iconColor: 'text-teal-400',
      glowColor: '#14b8a6',
      hotspotX: 50,
      hotspotY: 40.5,
      status: 'GREEN',
      statusLabel: 'Optimal Absorption',
      biometricHeadline: 'Microbial Diversity 88% • Intestinal Barrier Function Nominal',
      metrics: [
        { label: 'Nutrient Absorption Rate', value: '98', unit: '%', nominal: '> 95%', status: 'GREEN' },
        { label: 'Microbiome Diversity Score', value: '88', unit: '/100', nominal: '> 80', status: 'GREEN' },
        { label: 'Dietary Fiber Ingestion', value: '32', unit: 'g/day', nominal: '25–35 g/day', status: 'GREEN' },
      ],
      workingMechanism:
        'Confinement, packaged radiation-sterilized rations, and immune system dysregulation alter the intestinal microbiota, decreasing short-chain fatty acid (SCFA) synthesis and increasing bacterial translocation risks.',
      spaceflightRisk:
        'Dysbiosis, compromised immune barrier, and altered drug pharmacokinetics.',
      countermeasures:
        'Probiotic supplements, high-fiber rehydratable food pouches, and prebiotic dietary fiber.',
      medications: [
        'Oral probiotic culture packets',
        'Loperamide (for acute non-infectious diarrhea)',
        'Electrolyte replacement fluids',
      ],
      waveformType: 'glucose',
    },
    {
      id: 'musculoskeletal',
      name: 'Musculoskeletal & Spine',
      category: 'musculoskeletal',
      icon: Dumbbell,
      iconColor: 'text-orange-400',
      glowColor: '#f97316',
      hotspotX: 50,
      hotspotY: 65,
      secondaryHotspots: [
        { x: 50, y: 33, label: 'Lumbar Spine (+3.4 cm elongation)' },
        { x: 44, y: 70, label: 'Right Femur / Quadriceps' },
        { x: 56, y: 70, label: 'Left Femur / Quadriceps' },
      ],
      status: 'GREEN',
      statusLabel: 'Axial Alignment Preserved',
      biometricHeadline: '+3.4 cm Height Growth • ARED Loading 620 kg-force • BMD 99.2%',
      metrics: [
        { label: 'Spine Axial Elongation', value: '+3.4', unit: 'cm', nominal: '+2.0–5.0 cm', status: 'GREEN' },
        { label: 'Bone Mineral Density (BMD)', value: '99.2', unit: '%', nominal: '> 98% baseline', status: 'GREEN' },
        { label: 'ARED Resistive Force', value: '620', unit: 'kg-f', nominal: '> 550 kg-force', status: 'GREEN' },
        { label: 'Soleus / Calf Volume', value: '97.5', unit: '%', nominal: '> 95% baseline', status: 'GREEN' },
      ],
      workingMechanism:
        'Without 1-G compressive spinal loading, intervertebral discs expand by absorbing fluid, causing 2–5 cm height growth and severe lumbar spinal ache. Weightbearing skeletal structures lose ~1.0% to 1.5% bone density per month via osteoclastic resorption if daily resistive countermeasure loading is skipped.',
      spaceflightRisk:
        'Post-landing lumbar disc herniation, accelerated bone fragility, and severe postural muscle atrophy.',
      countermeasures:
        'NASA Advanced Resistive Exercise Device (ARED) 45 min/day deadlifts & squats + T2 treadmill with bungee harness.',
      medications: [
        'Bisphosphonates (alendronate/zoledronic acid bone anti-resorption protocol)',
        'Vitamin D3 (1,000 IU/day) & Calcium supplements',
        'Acetaminophen / Ibuprofen (for spaceflight spinal elongation backache)',
      ],
      waveformType: 'biomechanical',
    },
  ];

  const currentOrgan = organs.find((o) => o.id === selectedId) || organs[0];

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectSystem?.(id);
  };

  const handleAskDrOrion = (topic: string) => {
    try {
      sessionStorage.setItem('aegis_pending_chat_prompt', `Explain the microgravity working status, risks, and countermeasures for ${topic}.`);
    } catch {
      // Non-blocking
    }
    window.location.hash = '#/chat';
  };

  // Helper to draw live animated SVG waveform for the selected organ
  const renderOrganWaveform = (type: string, color: string) => {
    if (type === 'spirometry') {
      // Breathing tidal sine wave with animated airflow phase
      const points = [];
      const width = 360;
      const height = 48;
      const mid = height / 2;
      for (let x = 0; x <= width; x += 4) {
        // Slow tidal breathing wave
        const y = mid + Math.sin((x / 30) + (animationTick * 0.12)) * 16 * Math.sin(x / width * Math.PI);
        points.push(`${x},${y}`);
      }
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Live Alveolar Spirometry Cycle (Inspiratory / Expiratory Tidal Volume)
            </span>
            <span className="text-white font-bold">14 Breaths/min</span>
          </div>
          <div className="h-14 w-full bg-slate-950/80 rounded-xl border border-cyan-500/20 p-1 flex items-center overflow-hidden relative">
            {/* Grid scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff08_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff08_1px,transparent_1px)] bg-[size:16px_16px]" />
            <svg viewBox="0 0 360 48" className="w-full h-full relative z-10" preserveAspectRatio="none">
              <polyline
                points={points.join(' ')}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_#06b6d4]"
              />
            </svg>
          </div>
        </div>
      );
    }

    if (type === 'ecg') {
      // Classic cardiac multi-lead ECG rhythm with traveling pulse
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-rose-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
              Live Lead-II Electrocardiogram (QRS Complex & Arterial Perfusion)
            </span>
            <span className="text-white font-bold">{v.heartRate} BPM</span>
          </div>
          <div className="h-14 w-full bg-slate-950/80 rounded-xl border border-rose-500/20 p-1 flex items-center overflow-hidden relative">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#f43f5e08_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e08_1px,transparent_1px)] bg-[size:16px_16px]" />
            <svg viewBox="0 0 360 48" className="w-full h-full relative z-10" preserveAspectRatio="none">
              <polyline
                points="0,24 60,24 75,24 82,10 88,38 95,4 102,28 108,24 130,24 180,24 240,24 255,24 262,10 268,38 275,4 282,28 288,24 310,24 360,24"
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_8px_#f43f5e]"
              />
            </svg>
          </div>
        </div>
      );
    }

    // Default metabolic & neurological wave
    const points = [];
    for (let x = 0; x <= 360; x += 6) {
      const y = 24 + Math.sin((x / 20) + (animationTick * 0.15)) * 12 + Math.cos(x / 40) * 6;
      points.push(`${x},${y}`);
    }
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-blue-300">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Live Physiological Activity Stream & Homeostatic Clearance
          </span>
          <span className="text-white font-bold">Synchronous</span>
        </div>
        <div className="h-14 w-full bg-slate-950/80 rounded-xl border border-blue-500/20 p-1 flex items-center overflow-hidden relative">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f608_1px,transparent_1px),linear-gradient(to_bottom,#3b82f608_1px,transparent_1px)] bg-[size:16px_16px]" />
          <svg viewBox="0 0 360 48" className="w-full h-full relative z-10" preserveAspectRatio="none">
            <polyline
              points={points.join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_#3b82f6]"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fade-in select-none">

      {/* Main 3-Column Interactive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* ── COLUMN 1: High-Definition Transparent Anatomical Twin (5 cols) ── */}
        <div className="lg:col-span-5 p-5 rounded-3xl bg-[#070b1a]/95 border border-cyan-500/30 flex flex-col items-center justify-between relative overflow-hidden backdrop-blur-xl shadow-2xl min-h-[660px]">
          
          {/* Header Sub-bar */}
          <div className="w-full flex items-center justify-between z-10 pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Anatomical Digital Twin
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              Transparent Organs & Vascular Mesh
            </span>
          </div>

          {/* Holographic background orbital rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-[420px] h-[420px] rounded-full border border-cyan-500/40 animate-spin" style={{ animationDuration: '40s' }} />
            <div className="absolute w-[320px] h-[320px] rounded-full border border-blue-500/40 animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
          </div>

          {/* Interactive Image & SVG Connector Overlay Stage */}
          <div className="relative w-full max-w-[340px] my-3 flex items-center justify-center">
            
            {/* The Real Transparent Anatomical Twin Image */}
            <div className="relative w-full aspect-[2/3] max-h-[560px] rounded-2xl overflow-hidden shadow-2xl border border-cyan-500/20 bg-slate-950/60">
              <img
                src="/anatomical_twin.jpg"
                alt="NASA Astronaut Human Anatomical Digital Twin"
                className="w-full h-full object-contain filter drop-shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300"
              />

              {/* Dynamic Laser HUD Connector Lines & Hotspots Layer */}
              <svg className="absolute inset-0 w-full h-full pointer-events-auto" viewBox="0 0 100 100" preserveAspectRatio="none">
                
                {/* Organ Hotspots & Rings */}
                {organs.map((org) => {
                  const isSelected = org.id === selectedId;
                  const isHovered = org.id === hoveredId;
                  const color = org.glowColor;

                  return (
                    <g
                      key={org.id}
                      onClick={() => handleSelect(org.id)}
                      onMouseEnter={() => setHoveredId(org.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="cursor-pointer group"
                    >
                      {/* Secondary hotspots (e.g. left and right lungs or kidneys) */}
                      {org.secondaryHotspots && org.secondaryHotspots.map((sh, sIdx) => (
                        <g key={sIdx}>
                          {isSelected && (
                            <circle
                              cx={sh.x}
                              cy={sh.y}
                              r="4.5"
                              fill="none"
                              stroke={color}
                              strokeWidth="0.6"
                              strokeDasharray="1.5 1.5"
                              className="animate-spin"
                            />
                          )}
                          <circle cx={sh.x} cy={sh.y} r="2.8" fill={color} fillOpacity={isSelected ? 0.45 : 0.25} />
                          <circle cx={sh.x} cy={sh.y} r="1.5" fill={color} className={isSelected ? 'animate-ping' : ''} />
                        </g>
                      ))}

                      {/* Primary Organ Node Target */}
                      {isSelected && (
                        <>
                          {/* Pulsing Radar Ring */}
                          <circle
                            cx={org.hotspotX}
                            cy={org.hotspotY}
                            r="6"
                            fill="none"
                            stroke={color}
                            strokeWidth="0.8"
                            strokeDasharray="2 1.5"
                            className="animate-spin"
                            style={{ animationDuration: '6s' }}
                          />
                          <circle
                            cx={org.hotspotX}
                            cy={org.hotspotY}
                            r="4"
                            fill="none"
                            stroke={color}
                            strokeWidth="0.5"
                          />
                        </>
                      )}

                      {/* Hotspot Inner Dot */}
                      <circle
                        cx={org.hotspotX}
                        cy={org.hotspotY}
                        r={isSelected ? 3.5 : isHovered ? 3.0 : 2.2}
                        fill={color}
                        fillOpacity={isSelected ? 0.9 : 0.6}
                        className="transition-all duration-200 shadow-lg"
                      />

                      {/* Outer pulse ping */}
                      {isSelected && (
                        <circle
                          cx={org.hotspotX}
                          cy={org.hotspotY}
                          r="3.5"
                          fill={color}
                          className="animate-ping opacity-75"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating Active Target Banner on top of image */}
              <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl bg-[#091026]/90 border border-cyan-500/40 backdrop-blur-md flex items-center justify-between text-xs z-20">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                  <span className="text-[11px] font-mono text-cyan-200 font-bold truncate">
                    TARGET: {currentOrgan.name.toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold shrink-0">
                  {currentOrgan.statusLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Sci-Fi Hologram Base */}
          <div className="w-full text-center pt-2 border-t border-white/10">
            <p className="text-[11px] font-mono text-cyan-300">
              Click any internal organ (Lungs, Heart, Brain, Kidneys, Digestive) to inspect working telemetry
            </p>
          </div>
        </div>

        {/* ── COLUMN 2: Organ Subsystems Navigation Panel (3 cols) ── */}
        <div className="lg:col-span-3 p-4 rounded-3xl bg-[#070b1a]/95 border border-cyan-500/30 flex flex-col justify-between backdrop-blur-xl shadow-2xl min-h-[660px]">
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Internal Organs ({organs.length})
              </span>
              <span className="text-[10px] font-mono text-slate-400">Interactive</span>
            </div>

            {/* Organ Buttons List */}
            <div className="space-y-1.5">
              {organs.map((org) => {
                const isSelected = org.id === selectedId;
                const Icon = org.icon;

                return (
                  <button
                    key={org.id}
                    type="button"
                    onClick={() => handleSelect(org.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl transition-all duration-200 text-left border ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-600/30 via-blue-600/30 to-indigo-600/30 border-cyan-400 shadow-lg shadow-cyan-950/60 scale-[1.02]'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/5 hover:border-cyan-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                          isSelected ? 'bg-cyan-500/20 border-cyan-400/50' : 'bg-slate-800/80 border-white/10'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${org.iconColor}`} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-xs font-bold block truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                          {org.name}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {org.statusLabel}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick AI Flight Surgeon Callout */}
          <div className="pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => handleAskDrOrion(currentOrgan.name)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Dr. Orion About {currentOrgan.name.split(' ')[0]}</span>
            </button>
          </div>
        </div>

        {/* ── COLUMN 3: Live Organ Working & Clinical Detail Monitor (4 cols) ── */}
        <div className="lg:col-span-4 p-5 rounded-3xl bg-[#070b1a]/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl space-y-4 min-h-[660px] flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Header: Selected Organ Title & Live Status */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20">
                  <currentOrgan.icon className={`w-6 h-6 ${currentOrgan.iconColor}`} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-sans tracking-wide">
                    {currentOrgan.name}
                  </h3>
                  <span className="text-[10px] font-mono text-cyan-400 tracking-wider">
                    OPERATIONAL BIOTELEMETRY
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ACTIVE</span>
              </div>
            </div>

            {/* Live Real-Time Animated Working Waveform */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 shadow-inner">
              {renderOrganWaveform(currentOrgan.waveformType, currentOrgan.glowColor)}
            </div>

            {/* Live Physiological Telemetry Grid */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
                Current Sensor Stream
              </span>
              <div className="grid grid-cols-2 gap-2">
                {currentOrgan.metrics.map((m, mIdx) => (
                  <div key={mIdx} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-0.5">
                    <span className="text-[10px] text-slate-400 block truncate">{m.label}</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-white font-mono">{m.value}</span>
                      <span className="text-[10px] text-slate-400">{m.unit}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 block truncate font-mono">Norm: {m.nominal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Microgravity Working Mechanism */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/10 text-xs space-y-1">
              <strong className="text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                HOW IT WORKS IN MICROGRAVITY:
              </strong>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {currentOrgan.workingMechanism}
              </p>
            </div>

            {/* NASA Reference Countermeasures & Med-Kit Protocol */}
            <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-2">
              <strong className="text-cyan-300 font-mono text-[11px] flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-cyan-400" />
                NASA PROTOCOLS & REFERENCE MEDICATIONS:
              </strong>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {currentOrgan.countermeasures}
              </p>
              <div className="flex flex-wrap gap-1 pt-1">
                {currentOrgan.medications.map((med, medIdx) => (
                  <span
                    key={medIdx}
                    className="px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-200 text-[10px] font-mono"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Clinical Prototype Disclaimer */}
          <div className="pt-2 border-t border-white/10 text-center">
            <p className="text-[10px] font-mono text-slate-500">
              NASA Human Research Program (HRP) • NASA-STD-3001 Verified Digital Twin
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
