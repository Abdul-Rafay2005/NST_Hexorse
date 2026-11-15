/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Body Overview & Anatomical Exploration
 * 
 * Contains EXACTLY TWO main sections:
 *  1. 3D Human Body Model (Unified interactive 3D anatomy model + dynamic organ details dashboard)
 *  2. Anatomical Layers (Preserved 100% identically from existing BodyFigure implementation)
 */

import React, { useState } from 'react';
import { UnifiedHumanBody3D } from '../components/body/UnifiedHumanBody3D';
import { OrganDetailsDashboard } from '../components/body/OrganDetailsDashboard';
import { BodyFigure } from '../components/body/BodyFigure';
import { ANATOMICAL_ORGANS_DATA } from '../data/anatomicalOrganData';
import { DailyAssessmentRecord, AstronautProfile } from '../types/health';
import { Card } from '../components/common/Card';
import {
  User,
  ShieldAlert,
  Sparkles,
  Info,
  HeartPulse,
  Rotate3d,
  Layers,
} from 'lucide-react';

interface BodyMapPageProps {
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  onNavigateToAssessment: () => void;
  initialSelectedPartId?: string;
}

export const BodyMapPage: React.FC<BodyMapPageProps> = ({
  profile: _profile,
  latestAssessment,
  onNavigateToAssessment,
  initialSelectedPartId,
}) => {
  // ONLY TWO main sections: '3d_model' and 'anatomical_layers'
  const [activeSection, setActiveSection] = useState<'3d_model' | 'anatomical_layers'>('3d_model');
  const [selectedOrganId, setSelectedOrganId] = useState<string>(initialSelectedPartId || 'heart');
  const [isIsolatedView, setIsIsolatedView] = useState<boolean>(false);

  const currentOrgan = ANATOMICAL_ORGANS_DATA[selectedOrganId] || ANATOMICAL_ORGANS_DATA.heart;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-12 select-none">
      
      {/* Top Banner Header with Two-Section Navigation Switcher */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0c142b] via-[#091026] to-[#0c142b] border border-cyan-500/30 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-xs shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA SPACE APPS 2026 • HUMAN ANATOMY & DIGITAL TWIN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white font-sans tracking-wide flex items-center gap-2.5">
              <User className="w-6 h-6 text-cyan-400" />
              Astronaut Body Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-3xl leading-relaxed">
              Explore your body through the unified interactive 3D human anatomy model with clickable organs, real-time biometrics, and dynamic clinical dashboards, or switch to Anatomical Layers.
            </p>
          </div>

          {/* TWO MAIN SECTIONS TOGGLE ONLY: Section 1 (3D Human Body Model) vs Section 2 (Anatomical Layers) */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center p-1 rounded-2xl bg-[#060a1a] border border-blue-500/30 shadow-lg">
              <button
                onClick={() => setActiveSection('3d_model')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  activeSection === '3d_model'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Rotate3d className="w-4 h-4" />
                <span>3D HUMAN BODY MODEL</span>
              </button>

              <button
                onClick={() => setActiveSection('anatomical_layers')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  activeSection === 'anatomical_layers'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-cyan-900/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>ANATOMICAL LAYERS</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: 3D HUMAN BODY MODEL ─────────────────────────────── */}
      {activeSection === '3d_model' && (
        <div className="space-y-6">
          {/* Interactive 3D Model Explorer */}
          <UnifiedHumanBody3D
            latestAssessment={latestAssessment}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={(id) => {
              setSelectedOrganId(id);
            }}
            isIsolatedView={isIsolatedView}
            onToggleIsolation={() => setIsIsolatedView(!isIsolatedView)}
            height={680}
          />

          {/* Dedicated Dynamic Organ Details Dashboard */}
          <OrganDetailsDashboard
            organ={currentOrgan}
            onSelectOrgan={(id) => setSelectedOrganId(id)}
            isIsolated={isIsolatedView}
            onToggleIsolation={() => setIsIsolatedView(!isIsolatedView)}
          />
        </div>
      )}

      {/* ── SECTION 2: ANATOMICAL LAYERS (100% UNTOUCHED ORIGINAL) ───────── */}
      {activeSection === 'anatomical_layers' && (
        <BodyFigure
          latestAssessment={latestAssessment}
          initialSelectedId={selectedOrganId}
        />
      )}

      {/* Auxiliary Context & Notice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          glow="cyan"
          title="Digital Twin Telemetry Sync"
          subtitle="Real-time multi-sensor fusion"
          icon={<HeartPulse className="w-4 h-4 text-cyan-400" />}
        >
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            The 3D Human Body Model syncs dynamically to active bio-telemetry. Cardiac frequency pulsates in real time to your logged heart rate ({latestAssessment?.values.heartRate || 72} BPM), pulmonary expansion tracks resting respiration, and organ telemetry reflects NASA spaceflight clinical standards.
          </p>
        </Card>

        <Card
          glow="none"
          title="Flight Operations Notice"
          subtitle="Autonomous deep space decision support"
          icon={<ShieldAlert className="w-4 h-4 text-amber-400" />}
        >
          <div className="space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              All anatomical structures and dimensions conform to the Foundational Model of Anatomy (FMA) standard. Click any structure in the 3D model to dynamically inspect dimensions, blood supply, waveforms, and system relationships.
            </p>
            {!latestAssessment && (
              <button
                onClick={onNavigateToAssessment}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold hover:bg-cyan-600/40 transition-all text-center block"
              >
                + Complete Initial Telemetry Assessment
              </button>
            )}
          </div>
        </Card>
      </div>

      {/* Official Prototype Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#0c142b]/80 border border-[#1b2752] flex items-center gap-3 text-xs text-slate-400 backdrop-blur-md">
        <Info className="w-4 h-4 text-cyan-400 shrink-0" />
        <p>
          <strong className="text-slate-200 font-semibold">NASA Space Apps Challenge 2026 Prototype:</strong> This 360° interactive 3D anatomy explorer serves as autonomous engineering decision support for communication-delayed deep space missions and does not replace certified NASA Flight Surgeons.
        </p>
      </div>

    </div>
  );
};
