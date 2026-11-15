/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: Viewport-Centered Notification Center Modal with High-Alert Audio Chime
 * 
 * Rendered directly via React Portal to document.body:
 *  - 100% viewport centered, NEVER requires scrolling to find
 *  - Clear, organized, structured messages with severity tiers
 *  - Spacecraft avionics Web Audio alert sound on high priority warnings
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DriftAlert } from '../../services/driftDetection';
import { DailyAssessmentRecord } from '../../types/health';
import { audioAlertService } from '../../services/audioAlertService';
import {
  Bell,
  X,
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  FileText,
  Bot,
  Flame,
  Activity,
  ArrowRight,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  severity: 'HIGH_ALERT' | 'WARNING' | 'NOMINAL';
  title: string;
  source: string;
  timestamp: string;
  detectedChange?: string;
  message: string;
  actionType?: 'sbar' | 'ai_chat' | 'guidance';
  rawAlert?: DriftAlert;
}

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  driftAlerts: DriftAlert[];
  latestAssessment?: DailyAssessmentRecord;
  onOpenSbar?: (alert: DriftAlert) => void;
  onNavigateToAiDoctor?: () => void;
  onNavigateToGuidance?: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  driftAlerts,
  latestAssessment,
  onOpenSbar,
  onNavigateToAiDoctor,
  onNavigateToGuidance,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(audioAlertService.isEnabled());
  const [filter, setFilter] = useState<'all' | 'high' | 'advisory'>('all');

  // Build unified notification items
  const notifications: NotificationItem[] = [];

  // 1. Drift alerts
  driftAlerts.forEach((da) => {
    notifications.push({
      id: da.id,
      severity: da.severity === 'CRITICAL' ? 'HIGH_ALERT' : 'WARNING',
      title: da.title,
      source: 'Physiological Drift Engine',
      timestamp: `Sol ${da.solSpan ? `Span: ${da.solSpan} Sols` : 'Current'}`,
      detectedChange: da.detectedChange,
      message: da.description,
      actionType: 'sbar',
      rawAlert: da,
    });
  });

  // 2. Active assessment vitals
  if (latestAssessment) {
    if (latestAssessment.results.heartRate.status === 'RED') {
      notifications.push({
        id: 'notif-hr-crit',
        severity: 'HIGH_ALERT',
        title: 'Tachycardia / Critical Heart Rate Elevation',
        source: 'Continuous Bio-Telemetry',
        timestamp: `Sol ${latestAssessment.missionDay}`,
        detectedChange: `${latestAssessment.values.heartRate} BPM (Normal: 60-100)`,
        message: 'Heart rate exceeded maximum operational flight tolerance threshold. Fluid shift compensation protocol required.',
        actionType: 'ai_chat',
      });
    } else if (latestAssessment.results.heartRate.status === 'YELLOW') {
      notifications.push({
        id: 'notif-hr-warn',
        severity: 'WARNING',
        title: 'Elevated Resting Heart Rate',
        source: 'Continuous Bio-Telemetry',
        timestamp: `Sol ${latestAssessment.missionDay}`,
        detectedChange: `${latestAssessment.values.heartRate} BPM`,
        message: 'Mild elevation observed. Hydration monitoring recommended.',
        actionType: 'guidance',
      });
    }

    if (latestAssessment.results.bloodPressure?.status === 'RED') {
      notifications.push({
        id: 'notif-bp-crit',
        severity: 'HIGH_ALERT',
        title: 'Systemic Blood Pressure Anomaly',
        source: 'Hemodynamic Monitor',
        timestamp: `Sol ${latestAssessment.missionDay}`,
        detectedChange: `${latestAssessment.values.systolic}/${latestAssessment.values.diastolic} mmHg`,
        message: 'Acute hypertension threshold reached. Possible cephalic venous engorgement in 0-G.',
        actionType: 'ai_chat',
      });
    }
  }

  // 3. Environmental life support baseline notification
  notifications.push({
    id: 'notif-eclss-co2',
    severity: 'NOMINAL',
    title: 'Habitat Cabin CO₂ Nominal (2.8 mmHg)',
    source: 'ECLSS Scrubber Array',
    timestamp: 'Continuous Sync',
    message: 'Partial pressure CO₂ is stable within NASA-STD-3001 operational safety envelope (≤3.0 mmHg).',
  });

  const highAlertCount = notifications.filter((n) => n.severity === 'HIGH_ALERT').length;

  // Play high alert chime when modal opens IF high alert exists
  useEffect(() => {
    if (isOpen) {
      if (highAlertCount > 0) {
        audioAlertService.playHighAlertChime();
      } else {
        audioAlertService.playAdvisoryChime();
      }
      // Prevent body scrolling while modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, highAlertCount]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const next = audioAlertService.toggleSound();
    setSoundEnabled(next);
    if (next) {
      audioAlertService.playHighAlertChime();
    }
  };

  const handleTestSound = () => {
    audioAlertService.playHighAlertChime();
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'high') return n.severity === 'HIGH_ALERT';
    if (filter === 'advisory') return n.severity !== 'HIGH_ALERT';
    return true;
  });

  // Mounted directly on document.body to completely avoid parent CSS transforms / scroll issues
  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] rounded-3xl bg-gradient-to-b from-[#0c1530] via-[#091128] to-[#060a1a] border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1b2752] bg-[#070d22]/90">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              highAlertCount > 0
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white font-sans tracking-wide">
                  Mission Notification Center
                </h3>
                {highAlertCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-300 font-mono text-[10px] font-bold animate-pulse">
                    {highAlertCount} HIGH ALERT{highAlertCount > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Active Telemetry & Deep-Space Health Advisories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Alert Toggle & Test Button */}
            <button
              onClick={handleToggleSound}
              className={`p-2 rounded-xl border text-xs font-mono transition-all flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title={soundEnabled ? 'Alert Sound Active (Click to Mute)' : 'Alert Sound Muted (Click to Enable)'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {soundEnabled && (
              <button
                onClick={handleTestSound}
                className="px-2.5 py-1.5 rounded-xl bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono hover:bg-cyan-900/50 transition-all hidden sm:inline-block"
                title="Play High Alert Acoustic Chime"
              >
                Test Sound
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close notifications"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Navigation Bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-[#060a1a] border-b border-[#1b2752] text-xs font-mono">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filter === 'all'
                ? 'bg-cyan-600/30 text-cyan-200 border border-cyan-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('high')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filter === 'high'
                ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            High Alerts ({highAlertCount})
          </button>
          <button
            onClick={() => setFilter('advisory')}
            className={`px-3 py-1 rounded-xl transition-all ${
              filter === 'advisory'
                ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System Advisories ({notifications.length - highAlertCount})
          </button>
        </div>

        {/* Scrollable Notification List Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin scrollbar-thumb-cyan-500/20">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto opacity-80" />
              <p className="text-base font-bold text-white font-sans">No Active Alerts</p>
              <p className="text-xs text-slate-400 font-mono">All flight systems and vitals operating nominally.</p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isHigh = notif.severity === 'HIGH_ALERT';
              const isWarn = notif.severity === 'WARNING';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all space-y-2 ${
                    isHigh
                      ? 'bg-gradient-to-r from-rose-950/40 via-[#0d142c] to-rose-950/20 border-rose-500/40 shadow-lg shadow-rose-950/40'
                      : isWarn
                      ? 'bg-gradient-to-r from-amber-950/30 via-[#0d142c] to-transparent border-amber-500/30'
                      : 'bg-[#080f24] border-[#18264e]'
                  }`}
                >
                  {/* Top Status Strip */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isHigh ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1.5 animate-pulse">
                          <Flame className="w-3 h-3 text-rose-400" />
                          HIGH ALERT
                        </span>
                      ) : isWarn ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          WARNING
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                          <Activity className="w-3 h-3 text-cyan-400" />
                          SYSTEM INFO
                        </span>
                      )}

                      <span className="text-[11px] font-mono text-slate-400 truncate">
                        {notif.source}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {notif.timestamp}
                    </span>
                  </div>

                  {/* Title & Variance Badge */}
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                      {notif.title}
                    </h4>
                    {notif.detectedChange && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-cyan-300 font-mono text-[11px]">
                        Variance: {notif.detectedChange}
                      </span>
                    )}
                  </div>

                  {/* Clear Message */}
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {notif.message}
                  </p>

                  {/* Action Shortcuts */}
                  <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
                    {notif.rawAlert && onOpenSbar && (
                      <button
                        onClick={() => {
                          onOpenSbar(notif.rawAlert!);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Review SBAR Telemetry</span>
                      </button>
                    )}

                    {onNavigateToGuidance && (
                      <button
                        onClick={() => {
                          onNavigateToGuidance();
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 hover:bg-blue-500/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Guidance</span>
                      </button>
                    )}

                    {onNavigateToAiDoctor && (
                      <button
                        onClick={() => {
                          onNavigateToAiDoctor();
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-mono font-bold flex items-center gap-1.5 transition-all ml-auto"
                      >
                        <Bot className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Consult Dr. Orion AI</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-[#1b2752] bg-[#070d22]/90 flex items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400 hidden sm:block">
            {highAlertCount > 0 ? (
              <span className="text-rose-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                Avionics sound active for high priority telemetry
              </span>
            ) : (
              <span>All flight tolerances nominal</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all text-center ml-auto"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
