/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Assessment Record Detail Modal
 * Lead Developer: Abdul Rafay (Phase 1 Architecture)
 */

import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { DailyAssessmentRecord } from '../../types/health';
import {
  HeartPulse,
  Gauge,
  Droplet,
  Thermometer,
  Moon,
  Smile,
  FileText,
  Stethoscope,
} from 'lucide-react';

interface AssessmentDetailModalProps {
  record: DailyAssessmentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  if (!record) return null;

  const indicators = [
    { ...record.results.heartRate, icon: <HeartPulse className="w-4 h-4 text-rose-400" /> },
    { ...record.results.bloodPressure, icon: <Gauge className="w-4 h-4 text-blue-400" /> },
    { ...record.results.bloodSugar, icon: <Droplet className="w-4 h-4 text-amber-400" /> },
    { ...record.results.bodyTemperature, icon: <Thermometer className="w-4 h-4 text-red-400" /> },
    { ...record.results.sleepDuration, icon: <Moon className="w-4 h-4 text-indigo-400" /> },
    { ...record.results.mood, icon: <Smile className="w-4 h-4 text-emerald-400" /> },
  ];

  const formattedDate = new Date(record.timestamp).toLocaleString();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Telemetry Log — Sol ${record.missionDay}`}
      subtitle={`Recorded: ${formattedDate}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        
        {/* Demonstration banner if sample data */}
        {record.isDemonstrationData && (
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2 text-xs text-cyan-300 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>FICTIONAL DEMONSTRATION RECORD — GENERATED FOR PHASE 1 VALIDATION</span>
          </div>
        )}

        {/* Overall Assessment Banner */}
        <div className="p-4 rounded-xl bg-space-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase text-slate-400">Composite Triage:</span>
              <StatusBadge status={record.overall.status} label={record.overall.statusLabel} size="md" />
            </div>
            <p className="text-xs text-slate-300">{record.overall.summary}</p>
          </div>
          <div className="text-right shrink-0">
            <span className="block font-mono text-2xl font-bold text-cyan-400">
              {record.overall.score}<span className="text-xs text-slate-400 font-normal">/100</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase">Health Index</span>
          </div>
        </div>

        {/* 6 Indicators Grid Breakdown */}
        <div>
          <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 mb-3">
            All 6 Physiological Parameters
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {indicators.map((ind) => (
              <div
                key={ind.indicatorId}
                className="p-3 rounded-xl bg-space-950/70 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-space-900 border border-slate-800">
                        {ind.icon}
                      </div>
                      <span className="text-xs font-semibold text-slate-200">
                        {ind.displayName}
                      </span>
                    </div>
                    <StatusBadge status={ind.status} label={ind.statusLabel} size="sm" />
                  </div>

                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-mono text-lg font-bold text-slate-100">
                      {ind.valueDisplay}
                    </span>
                    <span className="font-mono text-xs text-cyan-400">{ind.unit}</span>
                    <span className="text-[11px] text-slate-400 ml-auto font-mono">
                      Target: {ind.nominalRangeLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-1">
                    {ind.reason}
                  </p>
                </div>

                {ind.baselineNominal && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
                    <span>Baseline: {ind.baselineNominal}</span>
                    {ind.deviationPercent !== undefined && (
                      <span className={ind.deviationPercent > 0 ? 'text-amber-400' : 'text-cyan-400'}>
                        {ind.deviationPercent > 0 ? `+${ind.deviationPercent}%` : `${ind.deviationPercent}%`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Doctor's Predicted Clinical Situation Card */}
        {record.doctorPrediction && (
          <div className={`p-4 rounded-xl border space-y-2.5 ${
            record.doctorPrediction.severity === 'RED'
              ? 'bg-rose-950/25 border-rose-500/40'
              : record.doctorPrediction.severity === 'YELLOW'
              ? 'bg-amber-950/25 border-amber-500/40'
              : 'bg-emerald-950/25 border-emerald-500/40'
          }`}>
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
              <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                Flight Surgeon's Situation Assessment
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                record.doctorPrediction.severity === 'RED'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : record.doctorPrediction.severity === 'YELLOW'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                {record.doctorPrediction.statusLabel}
              </span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-sans">{record.doctorPrediction.situationTitle}</h4>
              <p className="text-xs text-slate-300 font-sans mt-0.5 leading-relaxed">
                {record.doctorPrediction.clinicalImpression}
              </p>
            </div>

            <div className="text-xs font-mono text-slate-200 pt-1.5 border-t border-white/10">
              <span className="text-cyan-400 font-bold">Flight Surgeon Guidance: </span>
              <span>{record.doctorPrediction.flightSurgeonGuidance}</span>
            </div>

            {record.doctorPrediction.recommendedCountermeasures && record.doctorPrediction.recommendedCountermeasures.length > 0 && (
              <div className="pt-1.5 border-t border-white/10 text-xs">
                <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase mb-1">
                  Prescribed Countermeasures:
                </span>
                <ul className="text-slate-300 font-sans space-y-1">
                  {record.doctorPrediction.recommendedCountermeasures.map((cm, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-cyan-400">•</span>
                      <span>{cm}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Crew Notes section */}
        {record.values.notes && (
          <div className="p-3.5 rounded-xl bg-space-950 border border-slate-800">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-mono text-slate-400 uppercase">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Astronaut Clinical Notes & Mission Context</span>
            </div>
            <p className="text-xs text-slate-200 font-sans italic leading-relaxed">
              "{record.values.notes}"
            </p>
          </div>
        )}

      </div>
    </Modal>
  );
};
