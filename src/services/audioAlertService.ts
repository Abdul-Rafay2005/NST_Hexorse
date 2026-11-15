/**
 * NASA Space Apps Challenge 2026 — Astronaut Health Monitoring Software
 * Module: High Alert Acoustic Audio Synthesizer (Web Audio API)
 * 
 * Spacecraft Avionics Standard Audio Alert:
 * Uses pure Web Audio API oscillators so it requires 0 external audio files,
 * zero network fetches, and works 100% offline in deep-space simulation.
 */

class AudioAlertEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Lazy initialize on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  /**
   * Plays the official Spacecraft Master Warning / High Alert Dual-Tone Chime
   * Harmonic frequencies: B5 (987.8 Hz) -> E6 (1318.5 Hz) -> B5 -> E6
   * Staccato pulsed envelope designed for urgent medical attention.
   */
  public playHighAlertChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      const playTone = (freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.28) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);

        // Smooth attack & decay to prevent audio clicks
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + duration);
      };

      // Avionics Master High Alert Signature (Staccato 4-pulse chime)
      playTone(987.77, now + 0.00, 0.12, 'sine', 0.28);
      playTone(1318.51, now + 0.14, 0.15, 'triangle', 0.32);
      playTone(987.77, now + 0.32, 0.12, 'sine', 0.28);
      playTone(1318.51, now + 0.46, 0.20, 'triangle', 0.35);

    } catch (err) {
      console.warn('[AudioAlertEngine] Could not synthesize alert tone:', err);
    }
  }

  /**
   * Mild advisory chime (single pleasant chime for nominal / notice)
   */
  public playAdvisoryChime() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.18); // A5

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }
}

export const audioAlertService = new AudioAlertEngine();

