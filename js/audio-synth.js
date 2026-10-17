/**
 * TrigoLab - AudioSynth (Sintesis Suara Gelombang Sinus murni)
 * Menggunakan Web Audio API untuk mengubah gelombang matematika
 * menjadi gelombang bunyi akustik real-time (pure sine wave).
 */

class AudioSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isEnabled = false;
    this.baseFreq = 220; // Nada dasar A3 (220 Hz)
  }

  init() {
    if (this.audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.audioCtx = new AudioContext();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.connect(this.audioCtx.destination);

    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(this.baseFreq, this.audioCtx.currentTime);
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
  }

  toggle(enabled) {
    this.isEnabled = enabled;
    if (this.isEnabled) {
      this.init();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (this.gainNode) {
        this.gainNode.gain.setTargetAtTime(0.08, this.audioCtx.currentTime, 0.05);
      }
    } else {
      if (this.gainNode && this.audioCtx) {
        this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
      }
    }
  }

  // Update nada sesuai parameter transformasi B (frekuensi) dan A (amplitudo/volume)
  update(frequencyMultiplier = 1, amplitude = 1) {
    if (!this.isEnabled || !this.audioCtx || !this.oscillator) return;

    // Frekuensi target: 110Hz s.d 880Hz
    const targetFreq = Math.max(80, Math.min(880, this.baseFreq * frequencyMultiplier));
    const targetGain = Math.max(0.01, Math.min(0.18, 0.06 * Math.abs(amplitude)));

    this.oscillator.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.05);
    this.gainNode.gain.setTargetAtTime(targetGain, this.audioCtx.currentTime, 0.05);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AudioSynthesizer;
}
