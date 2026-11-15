/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Dedicated Organ Details Dashboard
 * 
 * Strict Requirement: Prioritize visual information (charts, diagrams, labeled structures,
 * data cards, relationship maps, dimensions) and strictly avoid long explanatory paragraphs.
 */

import React, { useState } from 'react';
import { AnatomicalOrganData } from '../../data/anatomicalOrganData';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Activity,
  Layers,
  Maximize2,
  Crosshair,
  Bot,
  ShieldCheck,
  CheckCircle2,
  Gauge,
  Network,
  Compass,
} from 'lucide-react';

interface OrganDetailsDashboardProps {
  organ: AnatomicalOrganData;
  onSelectOrgan?: (id: string) => void;
  isIsolated?: boolean;
  onToggleIsolation?: () => void;
}

export const OrganDetailsDashboard: React.FC<OrganDetailsDashboardProps> = ({
  organ,
  onSelectOrgan: _onSelectOrgan,
  isIsolated = false,
  onToggleIsolation,
}) => {
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(
    organ.structures[0]?.id || null
  );
  const [activeTab, setActiveTab] = useState<'visual_anatomy' | 'physiological_charts' | 'substructures' | 'system_connections'>('visual_anatomy');

  const selectedStructure = organ.structures.find((s) => s.id === selectedStructureId) || organ.structures[0];

  const handleAskDoctor = () => {
    sessionStorage.setItem(
      'dr_orion_auto_prompt',
      `Dr. Orion, analyze my current physiological state and spaceflight tolerances for ${organ.name} (${organ.latinName}) in the ${organ.system}. Telemetry: ${organ.telemetryMetrics.map(m => `${m.label}: ${m.value}`).join(', ')}.`
    );
    window.location.hash = '#/chat';
  };

  return (
    <div className="space-y-6 select-none">
      
      {/* ── Section Header with Organ Identification & Telemetry Badges ─ */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0c1530] via-[#091126] to-[#0c1530] border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: `${organ.color}25`,
                  color: organ.color,
                  border: `1px solid ${organ.color}60`,
                }}
              >
                {organ.system}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                NASA Telemetry Synchronized
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-sans tracking-wide">
                {organ.name}
              </h2>
              <span className="text-sm font-serif italic text-slate-400 font-sans">
                {organ.latinName}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Location:</span>
              <span className="text-slate-100 font-sans font-semibold">{organ.location}</span>
            </p>
          </div>

          {/* Action buttons: Focus 3D + Consult AI Doctor */}
          <div className="flex items-center gap-2.5 shrink-0">
            {onToggleIsolation && (
              <button
                onClick={onToggleIsolation}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                  isIsolated
                    ? 'bg-amber-500/25 border border-amber-400 text-amber-200'
                    : 'bg-[#060a1a] border border-slate-700 text-slate-300 hover:text-white hover:bg-cyan-600/20'
                }`}
                title="Isolate in 3D"
              >
                <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                <span>{isIsolated ? 'Reset 3D Isolation' : 'Isolate in 3D'}</span>
              </button>
            )}

            <button
              onClick={handleAskDoctor}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-mono font-bold shadow-lg shadow-cyan-950/50 flex items-center gap-2 transition-all"
            >
              <Bot className="w-4 h-4 text-cyan-200" />
              <span>Consult Dr. Orion AI</span>
            </button>
          </div>
        </div>

        {/* Anatomical Characteristics Chips (Strictly Concise Badges) */}
        <div className="mt-4 pt-3 border-t border-[#1b2752] flex flex-wrap items-center gap-2">
          {organ.characteristics.map((c, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-xl bg-[#060a1a]/90 border border-slate-700/80 text-[11px] font-sans text-slate-300 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3 h-3 text-cyan-400 shrink-0" />
              <span>{c}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Section Tabs: Visual Anatomy / Charts / Substructures / Connections ── */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-[#091126] border border-[#1b2752] shadow-md overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('visual_anatomy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            activeTab === 'visual_anatomy'
              ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>ANATOMICAL VISUALIZATION</span>
        </button>

        <button
          onClick={() => setActiveTab('physiological_charts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            activeTab === 'physiological_charts'
              ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>DATA CHARTS & CURVES</span>
        </button>

        <button
          onClick={() => setActiveTab('substructures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            activeTab === 'substructures'
              ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Gauge className="w-4 h-4 text-amber-400" />
          <span>INTERNAL STRUCTURES ({organ.structures.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('system_connections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
            activeTab === 'system_connections'
              ? 'bg-cyan-600/30 border border-cyan-400 text-cyan-200 shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Network className="w-4 h-4 text-purple-400" />
          <span>SYSTEM RELATIONSHIPS</span>
        </button>
      </div>

      {/* ── Visual Dimensions & Telemetry Numerical Cards (Always Visible) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {organ.dimensions.map((dim, idx) => (
          <div
            key={idx}
            className="p-3 rounded-2xl bg-[#091126]/90 border border-cyan-500/20 shadow-md space-y-1"
          >
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider truncate">
              {dim.label}
            </div>
            <div className="text-xl font-black text-white font-mono flex items-baseline gap-1">
              <span>{dim.value}</span>
              <span className="text-xs font-normal text-cyan-400 font-sans">{dim.unit}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate">
              Ref: {dim.baseline}
            </div>
          </div>
        ))}
      </div>

      {/* ── TAB 1: Anatomical Visualization (Organ Diagram & Labeled Pins) ── */}
      {activeTab === 'visual_anatomy' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Interactive SVG Anatomical Cross-Section Visualization */}
          <div className="lg:col-span-7 p-5 rounded-3xl bg-gradient-to-b from-[#091128] to-[#060a1a] border border-cyan-500/30 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
                <span className="text-xs font-mono font-extrabold text-cyan-300 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5" />
                  ANATOMICAL STRUCTURE SCHEMATIC & CROSS-SECTION
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Interactive Landmark Callouts
                </span>
              </div>

              {/* Dynamic SVG Organ Cross-Section Canvas */}
              <div className="relative w-full h-80 rounded-2xl bg-[#040817] border border-[#18264e] flex items-center justify-center overflow-hidden">
                
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#00f0ff 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Vector Visual Representation based on Organ */}
                <svg className="w-full h-full p-4" viewBox="0 0 400 300">
                  <defs>
                    <radialGradient id={`grad-${organ.id}`} cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor={organ.color} stopOpacity="0.8" />
                      <stop offset="60%" stopColor={organ.color} stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#060a1a" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="vesselGradArt" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#f87171" />
                    </linearGradient>
                    <linearGradient id="vesselGradVen" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>

                  {/* Organ Organic Silhouette */}
                  <ellipse cx="200" cy="150" rx="140" ry="105" fill={`url(#grad-${organ.id})`} />
                  <ellipse
                    cx="200"
                    cy="150"
                    rx="125"
                    ry="92"
                    fill="none"
                    stroke={organ.color}
                    strokeWidth="2.5"
                    strokeDasharray="6 3"
                    className="animate-pulse"
                  />
                  <ellipse cx="200" cy="150" rx="90" ry="65" fill="#081026" stroke="#1b2e61" strokeWidth="1.5" />

                  {/* Vascular Feed Paths */}
                  <path
                    d="M 90,40 Q 140,110 200,150 T 310,250"
                    fill="none"
                    stroke="url(#vesselGradArt)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />
                  <path
                    d="M 310,40 Q 260,110 200,150 T 90,250"
                    fill="none"
                    stroke="url(#vesselGradVen)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.75"
                  />

                  {/* Interactive Landmark Pins */}
                  {organ.crossSectionLabels.map((pin) => {
                    const isSelected = selectedStructureId === pin.id;
                    const px = (pin.x / 100) * 400;
                    const py = (pin.y / 100) * 300;
                    return (
                      <g
                        key={pin.id}
                        className="cursor-pointer group"
                        onClick={() => setSelectedStructureId(pin.id)}
                      >
                        <circle
                          cx={px}
                          cy={py}
                          r={isSelected ? 10 : 7}
                          fill={organ.color}
                          stroke="#ffffff"
                          strokeWidth="2"
                          className="transition-all"
                        />
                        <circle
                          cx={px}
                          cy={py}
                          r={isSelected ? 16 : 12}
                          fill="none"
                          stroke={organ.color}
                          strokeWidth="1.5"
                          opacity="0.6"
                          className="animate-ping"
                        />
                        <text
                          x={px + 12}
                          y={py + 4}
                          fill="#ffffff"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                          className="drop-shadow-md"
                        >
                          {pin.name}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Bottom Vascular Metrics Row */}
            <div className="mt-4 pt-3 border-t border-[#1b2752] grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2 rounded-xl bg-[#060a1a] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Arterial Supply:</span>
                <span className="text-white font-sans font-bold truncate block">{organ.bloodSupply.arterial}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#060a1a] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Venous Drainage:</span>
                <span className="text-white font-sans font-bold truncate block">{organ.bloodSupply.venous}</span>
              </div>
              <div className="p-2 rounded-xl bg-[#060a1a] border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">Perfusion Rate:</span>
                <span className="text-cyan-300 font-bold block">{organ.bloodSupply.perfusionRate}</span>
              </div>
            </div>
          </div>

          {/* Right: Sub-components list & Anatomical Codes */}
          <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
            <div className="p-5 rounded-3xl bg-[#091128] border border-cyan-500/20 shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-cyan-400" />
                  ANATOMICAL SUBSTRUCTURES
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  {organ.structures.length} Labeled Units
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-500/20">
                {organ.structures.map((s) => {
                  const isSelected = selectedStructureId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStructureId(s.id)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-md'
                          : 'bg-[#060a1a] border-[#18264e] hover:border-cyan-500/40 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold font-sans text-white">{s.name}</span>
                        <span className="text-[10px] font-mono text-cyan-300 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
                          {s.anatomicalCode}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-sans leading-tight">
                        {s.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Landmark Highlight Box */}
            {selectedStructure && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/60 to-cyan-950/60 border border-cyan-500/30 font-mono text-xs space-y-1">
                <div className="text-[10px] text-cyan-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-300" />
                  Selected Structural Focus
                </div>
                <div className="text-sm font-bold text-white font-sans">{selectedStructure.name}</div>
                <div className="text-[11px] text-slate-200 font-sans">{selectedStructure.description}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: Dynamic Data Charts & Physiological Curves ──────────── */}
      {activeTab === 'physiological_charts' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#091128] to-[#060a1a] border border-cyan-500/30 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 border-b border-cyan-500/20 pb-3">
              <div>
                <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  {organ.chartConfig.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Real physiological curve dynamics plotted for mission Sol 142
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                  X: {organ.chartConfig.xAxisLabel}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                  Y: {organ.chartConfig.yAxisLabel}
                </span>
              </div>
            </div>

            {/* Dynamic Recharts Area / Line Chart */}
            <div className="w-full h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={organ.chartConfig.data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="primaryAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor={organ.color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={organ.color} stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="secondaryAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1b2a52" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#070d1e',
                      borderColor: '#0284c7',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={organ.chartConfig.primaryLegend}
                    stroke={organ.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#primaryAreaGrad)"
                  />
                  {organ.chartConfig.secondaryLegend && (
                    <Area
                      type="monotone"
                      dataKey="secondary"
                      name={organ.chartConfig.secondaryLegend}
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                      fillOpacity={0.4}
                      fill="url(#secondaryAreaGrad)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active Clinical Telemetry Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {organ.telemetryMetrics.map((met, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#091128] border border-cyan-500/20 shadow-md space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400 truncate">{met.label}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    {met.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xl font-black text-white font-mono">{met.value}</div>
                <div className="text-[10px] font-mono text-slate-400">
                  Normal Range: <span className="text-slate-200">{met.normalRange}</span>
                </div>
                <div className="text-[10px] font-mono text-cyan-400">
                  Flight Tolerance: <span>{met.flightTolerance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: Substructures Grid ──────────────────────────────────── */}
      {activeTab === 'substructures' && (
        <div className="p-6 rounded-3xl bg-[#091128] border border-cyan-500/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Complete Anatomical Substructure Inventory
            </h3>
            <span className="text-xs font-mono text-cyan-300">
              Standardized Foundational Model of Anatomy (FMA) Codes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {organ.structures.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-[#060a1a] border border-[#1b2752] hover:border-cyan-500/50 transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-bold text-white font-sans">{s.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                    {s.anatomicalCode}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                  {s.type}
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: Related Systems & Connections Diagram ───────────────── */}
      {activeTab === 'system_connections' && (
        <div className="p-6 rounded-3xl bg-[#091128] border border-cyan-500/20 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              Anatomical Relationship Map & System Interlinks
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Direct physical, vascular & neuro-humoral pathways
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organ.relatedSystems.map((rel, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#060a1a] border border-[#1b2752] hover:border-purple-500/50 transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                    <span className="text-sm font-bold text-white font-sans">
                      {organ.name} ➔ {rel.targetSystem}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-500/40 text-purple-300">
                    {rel.relationType}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-[#080e22] border border-slate-800 text-xs font-mono space-y-1">
                  <div className="text-[10px] text-cyan-400">Anatomical Pathway:</div>
                  <div className="text-slate-200">{rel.pathway}</div>
                </div>

                <div className="text-xs text-slate-300 font-sans leading-relaxed">
                  <strong className="text-slate-200">Functional Role:</strong> {rel.functionalRole}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
