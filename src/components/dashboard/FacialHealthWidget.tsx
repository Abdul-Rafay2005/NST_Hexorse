/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Dashboard AI Facial Stress & Well-Being Monitor Card
 * 
 * Provides:
 *  - Quick "Scan Face" / "Start Facial Scan" trigger
 *  - Latest scan stress score, category, and dominant emotion
 *  - Real-time status badge
 */

import React from 'react';
import { FacialScanRecord } from '../../types/facialScan';
import {
  Camera,
  Scan,
  Eye,
  ShieldCheck,
} from 'lucide-react';

interface FacialHealthWidgetProps {
  latestScan?: FacialScanRecord;
  onOpenScanner: () => void;
  onViewHistory?: () => void;
}

export const FacialHealthWidget: React.FC<FacialHealthWidgetProps> = ({
  latestScan,
  onOpenScanner,
  onViewHistory,
}) => {
  const stressCategory = latestScan?.stressCategory || 'Low';
  const stressScore = latestScan?.stressScore ?? 32;
  const primaryEmotion = latestScan?.primaryEmotion || 'Neutral';
  const eyeFatigue = latestScan?.eyeAnalysis.fatigueLevel || 'Minimal';
  const missionSol = latestScan?.missionSol || 142;

  const getEmotionEmoji = (em: string) => {
    switch (em) {
      case 'Happy': return '😊';
      case 'Sad': return '😔';
      case 'Angry': return '😠';
      case 'Surprised': return '😲';
      case 'Fearful': return '😨';
      case 'Disgusted': return '🤢';
      default: return '😐';
    }
  };

  return (
    <div className="w-full p-5 rounded-3xl bg-[#0c142c]/90 border border-cyan-500/30 shadow-2xl backdrop-blur-xl space-y-4 select-none relative overflow-hidden">
      {/* Background Orbital Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Scan className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-white font-sans tracking-wide">
                AI Facial Health Scanner
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300">
                CAMERA AI MONITOR
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Live optical scanning of facial stress tension, ocular fatigue, and emotional composure
            </p>
          </div>
        </div>

        {/* Scan Face Action Button */}
        <div className="flex items-center gap-2">
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 text-xs font-mono font-bold transition-all"
            >
              Trend History
            </button>
          )}

          <button
            onClick={onOpenScanner}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-extrabold tracking-wider shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all group"
          >
            <Camera className="w-4 h-4 text-cyan-200 group-hover:scale-110 transition-transform" />
            <span>START FACIAL SCAN</span>
          </button>
        </div>
      </div>

      {/* Recent Telemetry Snapshot Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
        
        {/* 1. Stress Score */}
        <div className="p-3.5 rounded-2xl bg-[#070b1a] border border-[#172242] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Estimated Stress
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono leading-none">
              {stressScore}
            </span>
            <span className="text-xs text-slate-400 font-mono">/100</span>
          </div>
          <span
            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              stressCategory === 'High'
                ? 'bg-rose-500/20 text-rose-300'
                : stressCategory === 'Moderate'
                ? 'bg-amber-500/20 text-amber-300'
                : 'bg-emerald-500/20 text-emerald-300'
            }`}
          >
            {stressCategory} Stress Tier
          </span>
        </div>

        {/* 2. Detected Emotion */}
        <div className="p-3.5 rounded-2xl bg-[#070b1a] border border-[#172242] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Facial Expression
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl">{getEmotionEmoji(primaryEmotion)}</span>
            <span className="text-lg font-bold text-white font-sans truncate">
              {primaryEmotion}
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 block">
            {latestScan?.primaryEmotionConfidence || 78}% Confidence
          </span>
        </div>

        {/* 3. Eye Openness & Fatigue */}
        <div className="p-3.5 rounded-2xl bg-[#070b1a] border border-[#172242] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Eye Fatigue Index
          </span>
          <div className="flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span className="text-lg font-bold text-white font-sans">
              {eyeFatigue}
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-300 block">
            Aperture: {latestScan?.eyeAnalysis.opennessPercent || 86}%
          </span>
        </div>

        {/* 4. Sol & Sync Status */}
        <div className="p-3.5 rounded-2xl bg-[#070b1a] border border-[#172242] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Latest Observation
          </span>
          <div className="text-base font-bold text-white font-mono">
            Sol {missionSol}
          </div>
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Onboard History Synced</span>
          </span>
        </div>

      </div>
    </div>
  );
};
