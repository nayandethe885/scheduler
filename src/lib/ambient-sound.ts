/**
 * Procedural Ambient Audio Generator for LifeOS Focus Mode
 * Uses Web Audio API audio nodes (noise buffer generator, biquad filter, oscillators)
 */

class AmbientSoundGenerator {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentType: string | null = null;
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private initContext() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  play(type: 'rain' | 'whitenoise' | 'drone', volume: number = 0.3) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentType = type;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (type === 'rain' || type === 'whitenoise') {
      // Create pink/brown filtered noise
      const bufferSize = 2 * this.ctx.sampleRate;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Brown noise filter
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate rain
      const filter = this.ctx.createBiquadFilter();
      filter.type = type === 'rain' ? 'lowpass' : 'bandpass';
      filter.frequency.setValueAtTime(type === 'rain' ? 800 : 1200, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start(0);

      this.activeNodes.push(whiteNoise);
    } else if (type === 'drone') {
      // Alpha waves harmonic drone
      const freqs = [110, 164.81, 220, 277.18]; // A2, E3, A3, C#4
      freqs.forEach(freq => {
        if (!this.ctx || !this.gainNode) return;
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        oscGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(this.gainNode);
        osc.start();
        this.activeNodes.push(osc);
      });
    }
  }

  setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
    }
  }

  stop() {
    this.activeNodes.forEach(node => {
      try {
        if (typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
        if (typeof (node as any).disconnect === 'function') {
          (node as any).disconnect();
        }
      } catch {}
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentType = null;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentType() {
    return this.currentType;
  }
}

export const ambientSound = new AmbientSoundGenerator();
