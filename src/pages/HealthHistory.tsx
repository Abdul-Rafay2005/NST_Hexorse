/**
 * Aegis Health — Biometric Telemetry Archive & History
 * Conforms to Section 10.7 of PLAN.md
 * 
 * Provides timeline and tabular inspection with provenance tags and versioned JSON export envelopes.
 */

import React, { useState, useMemo } from 'react';
import { DailyAssessmentRecord } from '../types/health';
import { Card } from '../components/common/Card';
import { StatusBadge } from '../components/common/StatusBadge';
import { AssessmentDetailModal } from '../components/health/AssessmentDetailModal';
import { exportHistoryEnvelope, downloadJsonFile } from '../services/persistence/historyRepository';
import { FacialScanRecord } from '../types/facialScan';
import { getStoredFacialScans } from '../services/storage';
import {
  History,
  Search,
  Filter,
  Eye,
  Download,
  Table,
  List,
  Calendar,
  Layers,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Smile,
  Shield,
  Camera,
  Activity,
  X,
  Sparkles,
} from 'lucide-react';

interface HealthHistoryProps {
  records: DailyAssessmentRecord[];
  onSelectRecord?: (record: DailyAssessmentRecord) => void;
  onNavigateToAssessment: () => void;
}

export const HealthHistory: React.FC<HealthHistoryProps> = ({
  records,
  onNavigateToAssessment,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<DailyAssessmentRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterProvenance, setFilterProvenance] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline');
  const [isExporting, setIsExporting] = useState(false);
  const [activeDataset, setActiveDataset] = useState<'biometrics' | 'facialScans'>('biometrics');
  const [facialScans] = useState<FacialScanRecord[]>(() => getStoredFacialScans());
  const [selectedFacialScan, setSelectedFacialScan] = useState<FacialScanRecord | null>(null);

  // Filtering
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesStatus = filterStatus === 'ALL' || rec.overall.status === filterStatus;

      const provenance = rec.isDemonstrationData ? 'simulation' : 'legacy-unknown';
      const matchesProvenance = filterProvenance === 'ALL' || provenance === filterProvenance;

      const matchesSearch =
        searchTerm === '' ||
        rec.missionDay.toString().includes(searchTerm) ||
        (rec.values.notes && rec.values.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        rec.overall.summary.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesProvenance && matchesSearch;
    });
  }, [records, filterStatus, filterProvenance, searchTerm]);

  const filteredFacialScans = useMemo(() => {
    return facialScans.filter((s) => {
      const matchesSearch =
        searchTerm === '' ||
        s.missionSol.toString().includes(searchTerm) ||
        s.primaryEmotion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.stressCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.flightSurgeonAdvisory && s.flightSurgeonAdvisory.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesSearch;
    });
  }, [facialScans, searchTerm]);

  const handleExportJSON = async () => {
    try {
      setIsExporting(true);
      const astronautId = records[0]?.astronautId || 'ASTRO-2026-ALPHA';
      const envelope = await exportHistoryEnvelope(astronautId);
      downloadJsonFile(`aegis_health_telemetry_${astronautId}_${Date.now()}.json`, envelope);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 font-sans tracking-wide">
              Biometric Telemetry Archive
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-sans">
            Chronological audit log of astronaut physiological telemetry with provenance verification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex bg-space-950/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'timeline' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Timeline View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dense Table View"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 hover:text-cyan-300 hover:bg-space-850 transition-colors"
            title="Export telemetry envelope as JSON"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export Envelope'}</span>
          </button>

          <button
            onClick={onNavigateToAssessment}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold uppercase tracking-wider transition-all shadow-neon-cyan/20"
          >
            <span>+ Check-in</span>
          </button>
        </div>
      </div>

      {/* Dataset Mode Tabs: Biometric Telemetry vs Camera Facial Stress */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-1.5 rounded-2xl bg-space-950/80 border border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveDataset('biometrics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeDataset === 'biometrics'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>Biometric Vitals ({records.length})</span>
          </button>

          <button
            onClick={() => setActiveDataset('facialScans')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
              activeDataset === 'facialScans'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Facial Scans & Stress ({facialScans.length})</span>
          </button>
        </div>

        {activeDataset === 'facialScans' && (
          <span className="text-[11px] font-mono text-purple-300/80 bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-500/20">
            Experimental Optical Biometrics (NASA EIMO / Flight Medicine)
          </span>
        )}
      </div>

      {/* Filter and Search Bar */}
      {activeDataset === 'biometrics' ? (
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by mission Sol, symptoms, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-space-950/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 font-mono"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {(['ALL', 'GREEN', 'YELLOW', 'RED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterStatus === s
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Provenance Filter */}
          <div className="flex items-center gap-1 bg-space-950/80 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-slate-400 ml-2" />
            {[
              { id: 'ALL', label: 'All Sources' },
              { id: 'simulation', label: 'Simulated' },
              { id: 'legacy-unknown', label: 'Manual/Legacy' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setFilterProvenance(p.id)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  filterProvenance === p.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search facial scans by Sol, emotion, stress category, or advisory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-space-950/80 border border-purple-500/30 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 font-mono"
            />
          </div>
          <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs font-mono text-purple-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{filteredFacialScans.length} Optical Scan Records Available</span>
          </div>
        </div>
      )}

      {/* Main Content: Timeline or Dense Table */}
      {activeDataset === 'biometrics' ? (
        viewMode === 'timeline' ? (
        <div className="space-y-3">
          {filteredRecords.length === 0 ? (
            <Card glow="none" className="text-center py-12">
              <History className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-mono">No telemetry records match the current filter.</p>
            </Card>
          ) : (
            filteredRecords.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className="p-4 rounded-xl bg-space-950/80 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-space-900/50 transition-all cursor-pointer space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-cyan-300 font-bold text-sm">Sol {rec.missionDay}</span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(rec.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 bg-space-900 text-slate-400">
                      {rec.isDemonstrationData ? '⚡ Simulation' : 'Legacy manual / origin unverified'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={rec.overall.status} size="sm" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(rec);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors"
                      title="Inspect record"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Vitals Summary Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Heart className="w-3 h-3 text-rose-400" /> HR
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.heartRate} BPM</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Shield className="w-3 h-3 text-cyan-400" /> BP
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.systolic}/{rec.values.diastolic}</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-amber-400" /> Glucose
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.bloodSugar} mg/dL</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-orange-400" /> Temp
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.bodyTemperature.toFixed(1)}°C</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-400" /> Sleep
                    </span>
                    <span className="text-slate-100 font-bold">{rec.values.sleepDuration.toFixed(1)} h</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Smile className="w-3 h-3 text-emerald-400" /> Mood
                    </span>
                    <span className="text-slate-100 font-bold capitalize">{rec.values.mood}</span>
                  </div>
                </div>

                {rec.values.notes && (
                  <p className="text-xs text-slate-400 italic font-sans border-l-2 border-cyan-500/40 pl-2">
                    "{rec.values.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Dense Table View */
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-space-950/90 p-4">
          <table className="w-full text-xs font-mono text-left">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Mission Sol</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Heart Rate</th>
                <th className="py-2.5 px-3">Blood Pressure</th>
                <th className="py-2.5 px-3">Blood Sugar</th>
                <th className="py-2.5 px-3">Temperature</th>
                <th className="py-2.5 px-3">Sleep</th>
                <th className="py-2.5 px-3">Overall Status</th>
                <th className="py-2.5 px-3">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredRecords.map((rec) => (
                <tr
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className="hover:bg-space-900/50 cursor-pointer"
                >
                  <td className="py-2 px-3 text-cyan-300 font-bold">Sol {rec.missionDay}</td>
                  <td className="py-2 px-3 text-slate-300">{new Date(rec.timestamp).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-slate-100 font-semibold">{rec.values.heartRate} BPM</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.systolic}/{rec.values.diastolic} mmHg</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.bloodSugar} mg/dL</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.bodyTemperature.toFixed(1)} °C</td>
                  <td className="py-2 px-3 text-slate-100">{rec.values.sleepDuration.toFixed(1)} h</td>
                  <td className="py-2 px-3"><StatusBadge status={rec.overall.status} size="sm" /></td>
                  <td className="py-2 px-3 text-slate-400 text-[10px]">
                    {rec.isDemonstrationData ? '⚡ Simulation' : 'Legacy / unverified'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    ) : (
      /* AI Facial Scans Dataset View */
      viewMode === 'timeline' ? (
        <div className="space-y-3">
          {filteredFacialScans.length === 0 ? (
            <Card glow="none" className="text-center py-12">
              <Camera className="w-8 h-8 text-purple-500/50 mx-auto mb-2" />
              <p className="text-sm text-slate-400 font-mono">No optical facial scans match the current query.</p>
            </Card>
          ) : (
            filteredFacialScans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => setSelectedFacialScan(scan)}
                className="p-4 rounded-xl bg-space-950/80 border border-purple-500/25 hover:border-purple-400/50 hover:bg-space-900/50 transition-all cursor-pointer space-y-3 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-850">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-purple-300 font-bold text-sm">Sol {scan.missionSol}</span>
                    <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(scan.timestamp).toLocaleString()}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-purple-500/30 bg-purple-950/40 text-purple-300">
                      {scan.analysisMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-slate-400">Stress:</span>
                      <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                        scan.stressCategory === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : scan.stressCategory === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}>
                        {scan.stressScore}/100 • {scan.stressCategory}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFacialScan(scan);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-purple-300 transition-colors"
                      title="Inspect scan metrics"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block uppercase">Dominant Emotion</span>
                    <span className="text-cyan-300 font-bold text-xs">{scan.primaryEmotion} ({scan.primaryEmotionConfidence}%)</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block uppercase">Eye Aperture & Blinks</span>
                    <span className="text-slate-100 font-bold text-xs">{scan.eyeAnalysis.opennessPercent}% ({scan.eyeAnalysis.blinkRatePerMin}/min)</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block uppercase">Eye Fatigue</span>
                    <span className="text-amber-300 font-bold text-xs">{scan.eyeAnalysis.fatigueLevel}</span>
                  </div>
                  <div className="p-2 rounded bg-space-900/40 border border-slate-850">
                    <span className="text-[10px] text-slate-400 block uppercase">Fluid Shift</span>
                    <span className="text-indigo-300 font-bold text-xs truncate block" title={scan.skinAnalysis.microgravityFluidShift}>
                      {scan.skinAnalysis.microgravityFluidShift}
                    </span>
                  </div>
                </div>

                {scan.flightSurgeonAdvisory && (
                  <p className="text-xs text-slate-300 font-sans italic bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                    💬 <strong className="text-purple-300 not-italic">Flight Surgeon:</strong> {scan.flightSurgeonAdvisory}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* Dense Table View for Facial Scans */
        <div className="overflow-x-auto rounded-xl border border-purple-500/20 bg-space-950/90 p-4">
          <table className="w-full text-xs font-mono text-left">
            <thead className="border-b border-slate-800 text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Mission Sol</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Stress Score</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Expression</th>
                <th className="py-2.5 px-3">Eye Open %</th>
                <th className="py-2.5 px-3">Blink Rate</th>
                <th className="py-2.5 px-3">Fluid Shift</th>
                <th className="py-2.5 px-3">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredFacialScans.map((scan) => (
                <tr
                  key={scan.id}
                  onClick={() => setSelectedFacialScan(scan)}
                  className="hover:bg-space-900/50 cursor-pointer"
                >
                  <td className="py-2 px-3 text-purple-300 font-bold">Sol {scan.missionSol}</td>
                  <td className="py-2 px-3 text-slate-300">{new Date(scan.timestamp).toLocaleDateString()}</td>
                  <td className="py-2 px-3 text-slate-100 font-black">{scan.stressScore}/100</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      scan.stressCategory === 'High'
                        ? 'bg-rose-500/20 text-rose-300'
                        : scan.stressCategory === 'Moderate'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {scan.stressCategory}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-cyan-300 font-bold">{scan.primaryEmotion}</td>
                  <td className="py-2 px-3 text-slate-200">{scan.eyeAnalysis.opennessPercent}%</td>
                  <td className="py-2 px-3 text-slate-200">{scan.eyeAnalysis.blinkRatePerMin}/min</td>
                  <td className="py-2 px-3 text-indigo-300 text-[11px]">{scan.skinAnalysis.microgravityFluidShift}</td>
                  <td className="py-2 px-3 text-slate-400 text-[10px]">{scan.analysisMethod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    )}

      {/* Biometric Detail Modal */}
      {selectedRecord && (
        <AssessmentDetailModal
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}

      {/* Facial Scan Detail Inspection Modal */}
      {selectedFacialScan && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-2xl rounded-3xl bg-[#0b1228] border border-purple-500/40 p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Optical Facial Health Scan — Sol {selectedFacialScan.missionSol}
                </h3>
              </div>
              <button
                onClick={() => setSelectedFacialScan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Snapshot Preview if exists */}
            {selectedFacialScan.thumbnailDataUrl && (
              <div className="flex justify-center bg-black/50 p-2 rounded-2xl border border-purple-500/20">
                <img
                  src={selectedFacialScan.thumbnailDataUrl}
                  alt="Captured Scan Frame"
                  className="max-h-48 rounded-xl object-contain shadow-lg"
                />
              </div>
            )}

            {/* Stress Gauge and Expression */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl bg-space-900/80 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 block uppercase text-[10px]">Estimated Stress Score</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{selectedFacialScan.stressScore}/100</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    selectedFacialScan.stressCategory === 'High'
                      ? 'bg-rose-500/20 text-rose-300'
                      : selectedFacialScan.stressCategory === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {selectedFacialScan.stressCategory} Tier
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full ${
                      selectedFacialScan.stressCategory === 'High'
                        ? 'bg-rose-500'
                        : selectedFacialScan.stressCategory === 'Moderate'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${selectedFacialScan.stressScore}%` }}
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-space-900/80 border border-slate-800 space-y-1.5">
                <span className="text-slate-400 block uppercase text-[10px]">Dominant Expression</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-cyan-300">{selectedFacialScan.primaryEmotion}</span>
                  <span className="text-xs text-slate-400">({selectedFacialScan.primaryEmotionConfidence}% confidence)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Observable facial expression classification (non-psychological proxy).
                </p>
              </div>
            </div>

            {/* Emotion Breakdown */}
            <div className="p-3.5 rounded-xl bg-space-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-300 font-bold block uppercase">
                Emotion Spectrum Breakdown
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                {selectedFacialScan.emotionBreakdown.map((item) => (
                  <div key={item.emotion} className="p-2 rounded bg-black/40 border border-slate-800/80">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-300">{item.emotion}</span>
                      <span className="font-bold text-cyan-400">{item.score}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Eye & Appearance Metrics */}
            <div className="p-3.5 rounded-xl bg-space-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-300 font-bold block uppercase">
                Ocular & Cephalic Fluid Appearance
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Eye Aperture</span>
                  <span className="font-bold text-slate-200">{selectedFacialScan.eyeAnalysis.opennessPercent}%</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Fatigue: {selectedFacialScan.eyeAnalysis.fatigueLevel}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Blink Rate</span>
                  <span className="font-bold text-slate-200">{selectedFacialScan.eyeAnalysis.blinkRatePerMin} / min</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Scleral: {selectedFacialScan.eyeAnalysis.scleralRednessIndex}</span>
                </div>
                <div className="p-2 rounded bg-black/40 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Fluid Shift</span>
                  <span className="font-bold text-indigo-300 truncate block">{selectedFacialScan.skinAnalysis.microgravityFluidShift}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Tone: {selectedFacialScan.skinAnalysis.perfusionTone}</span>
                </div>
              </div>
            </div>

            {/* Flight Surgeon Advisory & Recommendations */}
            {selectedFacialScan.flightSurgeonAdvisory && (
              <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5 text-xs">
                <span className="font-mono text-purple-300 font-bold block uppercase">
                  Flight Surgeon Telemetry Evaluation:
                </span>
                <p className="text-slate-300 leading-relaxed font-sans">
                  {selectedFacialScan.flightSurgeonAdvisory}
                </p>
                {selectedFacialScan.recommendedCountermeasures && selectedFacialScan.recommendedCountermeasures.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-purple-500/20">
                    <span className="font-mono text-purple-300 text-[11px] block mb-1">Recommended Countermeasures:</span>
                    <ul className="list-disc list-inside text-slate-400 space-y-0.5 font-sans">
                      {selectedFacialScan.recommendedCountermeasures.map((cm, idx) => (
                        <li key={idx}>{cm}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedFacialScan(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-mono transition-colors"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRecord && (
        <AssessmentDetailModal
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
};
