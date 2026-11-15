/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: AI Facial Health Scanner & Camera-Based Stress Monitoring Modal
 * 
 * Features:
 *  - Native HTML5 Camera capture with permission management
 *  - Live video stream with animated NASA biometric targeting reticle
 *  - Real-time client-side computer vision analysis
 *  - 7-class facial emotion classification
 *  - Camera-based stress estimation (0-100) with observable indicators
 *  - Ocular fatigue, blink frequency, and microgravity fluid shift observation
 *  - Direct handoff to Gemini AI Flight Surgeon
 *  - Seamless persistence to Health History
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  FacialScanRecord,
  LiveFaceTrackingHUD,
} from '../../types/facialScan';
import { AstronautProfile, DailyAssessmentRecord } from '../../types/health';
import {
  processLiveVideoFrame,
  analyzeFacialSnapshot,
} from '../../services/facialAnalysisService';
import { audioAlertService } from '../../services/audioAlertService';
import {
  Camera,
  X,
  Scan,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Eye,
  Sparkles,
  Bot,
  RefreshCw,
  Check,
} from 'lucide-react';

interface FacialHealthScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AstronautProfile;
  latestAssessment?: DailyAssessmentRecord;
  onScanComplete?: (record: FacialScanRecord) => void;
  onNavigateToAiDoctor?: (initialPrompt?: string) => void;
}

export const FacialHealthScannerModal: React.FC<FacialHealthScannerModalProps> = ({
  isOpen,
  onClose,
  profile,
  latestAssessment,
  onScanComplete,
  onNavigateToAiDoctor,
}) => {
  // Camera & Stream state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);

  // Live Tracking state
  const [hudState, setHudState] = useState<LiveFaceTrackingHUD>({
    faceDetected: false,
    faceBox: null,
    eyeAspectLeft: 0.8,
    eyeAspectRight: 0.8,
    browTension: 20,
    mouthTension: 15,
    lightingLux: 100,
    fps: 30,
  });

  // Completed Scan Record
  const [completedScan, setCompletedScan] = useState<FacialScanRecord | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const blinkCountRef = useRef<number>(0);
  const lastEyeStateOpen = useRef<boolean>(true);

  // ── Camera Initialization ──────────────────────────────────────────
  const startCamera = useCallback(async () => {
    setCameraError(null);
    setCompletedScan(null);
    setIsSaved(false);
    setAutoplayBlocked(false);

    try {
      if (typeof window !== 'undefined' && !window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires an HTTPS secure connection. Please browse this site over https://');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access API is not supported by your browser environment. Ensure HTTPS is enabled.');
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user',
          },
          audio: false,
        });
      } catch (constraintErr) {
        console.warn('[FacialScanner] Primary video constraints failed, trying unconstrained video:', constraintErr);
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setStream(mediaStream);
      setIsCameraActive(true);
    } catch (err: unknown) {
      const error = err as Error;
      console.warn('[FacialScanner] Camera permission error:', error);
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings to perform facial scans.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setCameraError('No video camera device was detected on your terminal.');
      } else {
        setCameraError(`Camera initialization error: ${error.message || 'Unable to access video stream.'}`);
      }
      setIsCameraActive(false);
    }
  }, []);

  // ── Stop Camera Stream ───────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setAutoplayBlocked(false);
  }, [stream]);

  // ── Attach MediaStream to Video Element (handles re-render timing) ──
  useEffect(() => {
    const video = videoRef.current;
    if (isCameraActive && stream && video) {
      video.defaultMuted = true;
      video.muted = true;
      video.playsInline = true;
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setAutoplayBlocked(false))
          .catch((err) => {
            console.warn('[FacialScanner] Autoplay prevented on live web:', err);
            setAutoplayBlocked(true);
          });
      }
    }
  }, [isCameraActive, stream]);

  // Clean up stream whenever modal closes or unmounts
  useEffect(() => {
    if (isOpen) {
      startCamera();
      document.body.style.overflow = 'hidden';
    } else {
      stopCamera();
      setCompletedScan(null);
      setCameraError(null);
      document.body.style.overflow = '';
    }

    return () => {
      stopCamera();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // ── Real-Time Frame Processing Loop ──────────────────────────────────
  useEffect(() => {
    if (!isCameraActive || !videoRef.current || !canvasRef.current || completedScan) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const renderLoop = () => {
      if (video.readyState >= 2) {
        const hud = processLiveVideoFrame(video, canvas);
        setHudState(hud);

        // Track blinks
        const isCurrentOpen = hud.eyeAspectLeft > 0.65;
        if (lastEyeStateOpen.current && !isCurrentOpen) {
          blinkCountRef.current += 1;
        }
        lastEyeStateOpen.current = isCurrentOpen;
      }
      animFrameId.current = requestAnimationFrame(renderLoop);
    };

    animFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isCameraActive, completedScan]);

  // ── Trigger Scan & Full Analysis ─────────────────────────────────────
  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setScanProgress(10);
    audioAlertService.playAdvisoryChime();

    // Visual scanning progress sequence
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 120);

    try {
      const video = videoRef.current;
      if (!video) return;

      // Ensure video stream has frame data available
      if (video.readyState < 2) {
        await new Promise((res) => setTimeout(res, 250));
      }

      const snapCanvas = document.createElement('canvas');
      const w = video.videoWidth || 640;
      const h = video.videoHeight || 480;
      snapCanvas.width = w;
      snapCanvas.height = h;
      const sCtx = snapCanvas.getContext('2d');
      if (sCtx) {
        sCtx.drawImage(video, 0, 0, w, h);
      }

      // Perform full analysis
      const record = await analyzeFacialSnapshot(
        snapCanvas,
        profile,
        latestAssessment,
        blinkCountRef.current || 4
      );

      clearInterval(interval);
      setScanProgress(100);

      // Play chime on completion
      if (record.stressCategory === 'High') {
        audioAlertService.playHighAlertChime();
      } else {
        audioAlertService.playAdvisoryChime();
      }

      setCompletedScan(record);
      setIsSaved(true);
      onScanComplete?.(record);
      stopCamera();
    } catch (err) {
      console.error('[FacialScanner] Analysis error:', err);
      clearInterval(interval);
      setCameraError('Facial analysis processing failed. Please retry in good lighting.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRetake = () => {
    setCompletedScan(null);
    setIsSaved(false);
    blinkCountRef.current = 0;
    startCamera();
  };

  const handleConsultDoctor = () => {
    if (!completedScan) return;
    const prompt = `Dr. Orion, review my latest AI Facial Health Scan for Sol ${completedScan.missionSol}. Estimated Facial Stress is ${completedScan.stressScore}/100 (${completedScan.stressCategory} Stress). Primary expression: ${completedScan.primaryEmotion} (${completedScan.primaryEmotionConfidence}%). Eye fatigue: ${completedScan.eyeAnalysis.fatigueLevel}. Notes: ${completedScan.skinAnalysis.observedNotes}`;
    
    sessionStorage.setItem('dr_orion_auto_prompt', prompt);
    onClose();
    if (onNavigateToAiDoctor) {
      onNavigateToAiDoctor(prompt);
    } else {
      window.location.hash = '#/chat';
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[92vh] rounded-3xl bg-gradient-to-b from-[#0c1530] via-[#091128] to-[#060a1a] border border-cyan-500/40 shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[#1b2752] bg-[#070d22]/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Scan className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white font-sans tracking-wide">
                  AI Facial Health Scanner
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold">
                  Camera-Based Stress Monitor
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Astronaut: {profile.rank} {profile.name} • Mission Sol {profile.currentMissionDay}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCameraActive && (
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-mono font-bold transition-all"
                title="Deactivate camera stream"
              >
                Stop Camera
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Main Body (Camera View or Scan Results) ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin scrollbar-thumb-cyan-500/20">
          
          {/* CAMERA ERROR STATE */}
          {cameraError && !completedScan && (
            <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white font-sans">Camera Access Required</h4>
                <p className="text-xs text-rose-200 font-mono max-w-md mx-auto">{cameraError}</p>
              </div>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={startCamera}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-mono font-bold shadow-md hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retry Camera Connection</span>
                </button>
              </div>
            </div>
          )}

          {/* ACTIVE CAMERA SCANNING VIEW */}
          {isCameraActive && !completedScan && (
            <div className="space-y-4">
              {/* Camera Preview with Holographic HUD Overlay */}
              <div className="relative w-full aspect-video max-h-[420px] rounded-2xl bg-black border border-cyan-500/40 overflow-hidden flex items-center justify-center shadow-2xl">
                {/* Live HTML5 Video Element */}
                <video
                  ref={(el) => {
                    videoRef.current = el;
                    if (el) {
                      el.defaultMuted = true;
                      el.muted = true;
                      el.playsInline = true;
                      if (stream && el.srcObject !== stream) {
                        el.srcObject = stream;
                        el.play()
                          .then(() => setAutoplayBlocked(false))
                          .catch((err) => {
                            console.warn('[FacialScanner] Video autoplay rejected:', err);
                            setAutoplayBlocked(true);
                          });
                      }
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={() => {
                    if (videoRef.current) {
                      videoRef.current.defaultMuted = true;
                      videoRef.current.muted = true;
                      videoRef.current.play()
                        .then(() => setAutoplayBlocked(false))
                        .catch(() => setAutoplayBlocked(true));
                    }
                  }}
                  className="w-full h-full object-cover transform -scale-x-100"
                />

                {/* Autoplay / Gesture Activation Overlay for Live Sites */}
                {autoplayBlocked && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-center space-y-3 pointer-events-auto">
                    <Camera className="w-10 h-10 text-cyan-400 animate-pulse" />
                    <p className="text-xs text-slate-200 font-mono max-w-xs">
                      Live browser security requires a touch or click to start video playback.
                    </p>
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.defaultMuted = true;
                          videoRef.current.muted = true;
                          videoRef.current
                            .play()
                            .then(() => setAutoplayBlocked(false))
                            .catch(console.warn);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-mono font-bold shadow-lg hover:from-blue-500 hover:to-cyan-500 transition-all flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera Video</span>
                    </button>
                  </div>
                )}

                {/* Live Processing Canvas (hidden offscreen for pixel reading) */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className="hidden"
                />

                {/* Futuristic NASA Biometric Reticle & Face Frame Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  
                  {/* Subtle Scanning Grid Pattern */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'linear-gradient(rgba(0, 240, 255, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.2) 1px, transparent 1px)',
                      backgroundSize: '32px 32px',
                    }}
                  />

                  {/* Laser Scan Line Animation */}
                  {isAnalyzing && (
                    <div
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff] animate-pulse"
                      style={{
                        top: `${scanProgress}%`,
                        transition: 'top 0.12s linear',
                      }}
                    />
                  )}

                  {/* Central Targeting Reticle Frame */}
                  <div className={`relative w-64 sm:w-80 h-72 sm:h-88 rounded-3xl border-2 transition-all ${
                    hudState.faceDetected
                      ? 'border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.3)]'
                      : 'border-dashed border-amber-400/60'
                  }`}>
                    {/* Corner Target Bracket Accents */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                    <div className="absolute -top-2 -right-2 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                    <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

                    {/* Eye Alignment Guide Crosshairs */}
                    <div className="absolute top-24 left-8 right-8 flex justify-between items-center opacity-60">
                      <div className="w-12 h-6 border border-cyan-400/80 rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                      <div className="w-12 h-6 border border-cyan-400/80 rounded-full flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      </div>
                    </div>

                    {/* Reticle Status Label */}
                    <div className="absolute -bottom-7 inset-x-0 text-center font-mono text-[11px] font-bold">
                      {hudState.faceDetected ? (
                        <span className="text-cyan-300 bg-[#060a1a]/85 px-3 py-1 rounded-full border border-cyan-500/40">
                          TARGET LOCKED • ALIGNED
                        </span>
                      ) : (
                        <span className="text-amber-300 bg-[#060a1a]/85 px-3 py-1 rounded-full border border-amber-500/40 animate-pulse">
                          POSITION FACE INSIDE FRAME
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Top HUD Telemetry Strip */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-cyan-300">
                    <span className="px-2.5 py-1 rounded-lg bg-[#060a1a]/80 border border-cyan-500/30 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE OPTICAL SENSOR 30 FPS
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-[#060a1a]/80 border border-cyan-500/30">
                      LUX: {hudState.lightingLux} • {hudState.lightingLux > 80 ? 'NOMINAL LIGHT' : 'LOW LIGHT'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Indicator Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[#091128] border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 block uppercase">Face Alignment</span>
                  <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${hudState.faceDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {hudState.faceDetected ? 'Detected' : 'Searching...'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#091128] border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 block uppercase">Glabellar Tension</span>
                  <span className="font-bold text-cyan-300 block mt-0.5">
                    {hudState.browTension} / 100 Index
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#091128] border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 block uppercase">Eye Aperture</span>
                  <span className="font-bold text-cyan-300 block mt-0.5">
                    {Math.round(hudState.eyeAspectLeft * 100)}% Open
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#091128] border border-cyan-500/20">
                  <span className="text-[10px] text-slate-400 block uppercase">Blink Monitor</span>
                  <span className="font-bold text-cyan-300 block mt-0.5">
                    {blinkCountRef.current} Blinks Sampled
                  </span>
                </div>
              </div>

              {/* Action Trigger Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1b2752]">
                <p className="text-xs text-slate-400 font-sans">
                  Hold your head steady within the reticle and look directly into the camera.
                </p>

                <button
                  onClick={handleCaptureAndAnalyze}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 hover:from-blue-500 hover:to-cyan-500 text-white font-mono text-xs font-extrabold tracking-wider shadow-lg shadow-cyan-900/50 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isAnalyzing ? `ANALYZING... ${scanProgress}%` : 'CAPTURE & ANALYZE FACE'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ── RESULTS DASHBOARD (Displaying Scan Analysis) ── */}
          {completedScan && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Success Banner & Save Notice */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-sm font-bold text-white font-sans block">
                      Facial Health Scan Complete & Saved to Mission History
                    </span>
                    <span className="text-xs text-emerald-300/80 font-mono">
                      Timestamp: {new Date(completedScan.timestamp).toUTCString()} • Sol {completedScan.missionSol}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRetake}
                    className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-mono font-bold text-slate-300 transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Scan Again</span>
                  </button>
                </div>
              </div>

              {/* Main Results Grid: Image & Stress Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
                
                {/* Captured Facial Snapshot Card (md:col-span-4) */}
                <div className="md:col-span-4 p-4 rounded-3xl bg-[#091128] border border-cyan-500/30 flex flex-col justify-between space-y-3 shadow-xl">
                  <div className="text-xs font-mono font-bold text-cyan-400 flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <span>CAPTURED SNAPSHOT</span>
                    <span className="text-[10px] text-slate-400">{completedScan.analysisMethod.split(' ')[0]}</span>
                  </div>

                  <div className="relative aspect-video sm:aspect-square w-full rounded-2xl overflow-hidden bg-black border border-cyan-500/30">
                    {completedScan.thumbnailDataUrl ? (
                      <img
                        src={completedScan.thumbnailDataUrl}
                        alt="Captured Facial Scan"
                        className="w-full h-full object-cover transform -scale-x-100"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Camera className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-300 flex items-center justify-between">
                      <span>SOL {completedScan.missionSol}</span>
                      <span>CONFIDENCE: {completedScan.stressConfidence}%</span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 text-center">
                    Method: {completedScan.analysisMethod}
                  </div>
                </div>

                {/* Stress Score Gauge & Category Card (md:col-span-4) */}
                <div className="md:col-span-4 p-5 rounded-3xl bg-[#091128] border border-cyan-500/30 flex flex-col justify-between items-center text-center space-y-3 shadow-xl">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    ESTIMATED FACIAL STRESS
                  </span>

                  {/* Circular Score Display */}
                  <div className="relative w-36 h-36 flex items-center justify-center my-1">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="none" stroke="#131c38" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={
                          completedScan.stressCategory === 'High'
                            ? '#f43f5e'
                            : completedScan.stressCategory === 'Moderate'
                            ? '#f59e0b'
                            : '#10b981'
                        }
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - completedScan.stressScore / 100)}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white font-mono leading-none">
                        {completedScan.stressScore}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold mt-1">/100</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span
                      className={`inline-block px-3.5 py-1 rounded-full text-xs font-mono font-extrabold uppercase ${
                        completedScan.stressCategory === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : completedScan.stressCategory === 'Moderate'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      }`}
                    >
                      {completedScan.stressCategory} Stress Tier
                    </span>
                    <p className="text-[11px] text-slate-400 font-sans">
                      Experimental facial tension assessment
                    </p>
                  </div>
                </div>

                {/* Primary Detected Emotion Card (md:col-span-4) */}
                <div className="md:col-span-4 p-5 rounded-3xl bg-[#091128] border border-cyan-500/30 flex flex-col justify-between space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      FACIAL EMOTION CLASSIFICATION
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {completedScan.primaryEmotionConfidence}% CONF.
                    </span>
                  </div>

                  <div className="text-center py-2 space-y-1">
                    <div className="text-3xl">
                      {completedScan.primaryEmotion === 'Happy' && '😊'}
                      {completedScan.primaryEmotion === 'Neutral' && '😐'}
                      {completedScan.primaryEmotion === 'Sad' && '😔'}
                      {completedScan.primaryEmotion === 'Angry' && '😠'}
                      {completedScan.primaryEmotion === 'Surprised' && '😲'}
                      {completedScan.primaryEmotion === 'Fearful' && '😨'}
                      {completedScan.primaryEmotion === 'Disgusted' && '🤢'}
                    </div>
                    <div className="text-xl font-extrabold text-white font-sans">
                      {completedScan.primaryEmotion}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      Estimated Facial Expression
                    </div>
                  </div>

                  {/* Top 3 Breakdown Bars */}
                  <div className="space-y-1.5 pt-1">
                    {completedScan.emotionBreakdown.slice(0, 3).map((em) => (
                      <div key={em.emotion} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] font-mono text-slate-300">
                          <span>{em.emotion}</span>
                          <span>{em.score}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-cyan-400 rounded-full"
                            style={{ width: `${em.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* ── Contributing Stress Factors & Observable Indicators ── */}
              <div className="p-5 rounded-3xl bg-[#091128] border border-cyan-500/20 shadow-xl space-y-3">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider block border-b border-cyan-500/20 pb-2">
                  OBSERVABLE CONTRIBUTING INDICATORS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {completedScan.contributingStressFactors.map((factor, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#060a1a] border border-[#1b2752] text-xs font-sans text-slate-200 flex items-start gap-2"
                    >
                      <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Eye & Facial Appearance Analysis Details ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Ocular Analysis */}
                <div className="p-4 rounded-2xl bg-[#091128] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                    <Eye className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Eye Fatigue & Ocular Inspection
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 rounded-lg bg-[#060a1a]">
                      <span className="text-[10px] text-slate-400 block">Eye Openness:</span>
                      <span className="text-white font-bold">{completedScan.eyeAnalysis.opennessPercent}% Nominal</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#060a1a]">
                      <span className="text-[10px] text-slate-400 block">Blink Rate:</span>
                      <span className="text-white font-bold">{completedScan.eyeAnalysis.blinkRatePerMin} blinks/min</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#060a1a]">
                      <span className="text-[10px] text-slate-400 block">Fatigue Index:</span>
                      <span className="text-cyan-300 font-bold">{completedScan.eyeAnalysis.fatigueLevel}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#060a1a]">
                      <span className="text-[10px] text-slate-400 block">Scleral Redness:</span>
                      <span className="text-slate-200 font-bold">{completedScan.eyeAnalysis.scleralRednessIndex}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    {completedScan.eyeAnalysis.observedNotes}
                  </p>
                </div>

                {/* Skin & Fluid Shift Observations */}
                <div className="p-4 rounded-2xl bg-[#091128] border border-cyan-500/20 space-y-2">
                  <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2">
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      Microgravity Fluid Shift Observation
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                    <div className="p-2 rounded-lg bg-[#060a1a]">
                      <span className="text-[10px] text-slate-400 block">Cephalic Shift:</span>
                      <span className="text-purple-300 font-bold">{completedScan.skinAnalysis.microgravityFluidShift}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-[#060a1a]">
                      <span className="text-[10px] text-slate-400 block">Lighting Check:</span>
                      <span className="text-white font-bold">{completedScan.skinAnalysis.lightingQuality}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    {completedScan.skinAnalysis.observedNotes}
                  </p>
                </div>

              </div>

              {/* ── Informational Recommendations & Flight Surgeon Countermeasures ── */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-blue-950/40 via-[#0a1128] to-cyan-950/40 border border-cyan-500/30 space-y-3">
                <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  RECOMMENDED FLIGHT COUNTERMEASURES
                </span>

                <div className="space-y-2">
                  {completedScan.recommendedCountermeasures.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#060a1a]/80 border border-cyan-500/20 text-xs font-sans text-slate-200 flex items-center gap-2.5"
                    >
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] font-sans text-slate-400 italic pt-1">
                  💡 {completedScan.flightSurgeonAdvisory}
                </div>
              </div>

              {/* ── Action Bar: Consult Doctor AI & Close ── */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#1b2752]">
                <button
                  onClick={handleConsultDoctor}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 transition-all"
                >
                  <Bot className="w-4 h-4 text-cyan-300" />
                  <span>Consult Dr. Orion AI with Facial Telemetry</span>
                </button>

                <div className="flex items-center gap-3">
                  {isSaved && (
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved to History
                    </span>
                  )}
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold shadow-lg shadow-cyan-950/50 transition-all text-center"
                  >
                    Done & Return to Dashboard
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Medical Disclaimer Banner */}
        <div className="p-3 bg-[#050917] border-t border-[#152042] flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Experimental Decision Support:</strong> Facial expressions and camera metrics are non-diagnostic estimates. Always cross-reference with clinical telemetry and certified flight surgeons.
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
};
