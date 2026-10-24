/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API Synthesizer for Last Frontier: Survival

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public masterVolume = 0.8;
  public sfxVolume = 0.9;
  public musicVolume = 0.5;
  public muted = false;
  private musicOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, sfx: number, music: number) {
    this.masterVolume = master;
    this.sfxVolume = sfx;
    this.musicVolume = music;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.masterVolume * 0.15, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.masterVolume * 0.15, this.ctx.currentTime);
    }
    return this.muted;
  }

  // --- Gunshot Sounds ---
  public playGunshot(type: 'assault_rifle' | 'submachine_gun' | 'shotgun' | 'sniper_rifle' | 'marksman_rifle' | 'pistol') {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    const finalVol = this.masterVolume * this.sfxVolume;

    // Noise buffer for mechanical crack
    const dur = type === 'sniper_rifle' ? 0.35 : type === 'shotgun' ? 0.28 : type === 'submachine_gun' ? 0.12 : 0.18;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * (dur * 0.4)));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    // Filter for gun caliber tone
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    if (type === 'sniper_rifle') {
      filter.frequency.setValueAtTime(1400, t);
      filter.frequency.exponentialRampToValueAtTime(180, t + dur);
    } else if (type === 'submachine_gun') {
      filter.frequency.setValueAtTime(3200, t);
      filter.frequency.exponentialRampToValueAtTime(400, t + dur);
    } else if (type === 'shotgun') {
      filter.frequency.setValueAtTime(2200, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + dur);
    } else {
      filter.frequency.setValueAtTime(2600, t);
      filter.frequency.exponentialRampToValueAtTime(250, t + dur);
    }

    // Low punch thump
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sine';
    const startFreq = type === 'sniper_rifle' ? 180 : type === 'shotgun' ? 140 : 210;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + dur * 0.7);

    oscGain.gain.setValueAtTime(0.8 * finalVol, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.7);

    gain.gain.setValueAtTime(1.0 * finalVol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.connect(oscGain);
    oscGain.connect(this.ctx.destination);

    noise.start(t);
    osc.start(t);
    osc.stop(t + dur);
  }

  // --- Reload Sound ---
  public playReload() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const finalVol = this.masterVolume * this.sfxVolume * 0.6;

    // Part 1: Click out
    this.playClick(t, 600, 0.05, finalVol);
    // Part 2: Mag slide in at 0.4s
    this.playClick(t + 0.35, 950, 0.06, finalVol * 1.2);
    // Part 3: Chamber cock at 0.75s
    this.playClick(t + 0.75, 1400, 0.08, finalVol * 1.4);
  }

  private playClick(time: number, freq: number, dur: number, vol: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + dur);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(time);
    osc.stop(time + dur);
  }

  // --- Hit Confirmation Marker (Tactical Ping) ---
  public playHitmarker(isHeadshot: boolean) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const finalVol = this.masterVolume * this.sfxVolume * 0.7;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const baseFreq = isHeadshot ? 1650 : 1100;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, t + 0.06);

    gain.gain.setValueAtTime(finalVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  // --- Kill Stinger / Elimination ---
  public playKillElimination() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const finalVol = this.masterVolume * this.sfxVolume;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(640, t + 0.12);
    osc.frequency.exponentialRampToValueAtTime(960, t + 0.25);

    gain.gain.setValueAtTime(0.5 * finalVol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  }

  // --- Footsteps ---
  public playFootstep(speed = 1.0) {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume * 0.25;

    const dur = 0.06;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + dur);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  // --- Safe Zone Siren Alert ---
  public playZoneAlert() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume * 0.4;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(660, t + 0.2);
    osc.frequency.linearRampToValueAtTime(440, t + 0.4);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.6);
  }

  // --- Item Loot Pickup ---
  public playLootPickup() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume * 0.5;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.1);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
  }

  // --- Tactical Explosion ---
  public playExplosion() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume * 1.2;

    const dur = 0.8;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.3));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + dur);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(t);
  }

  // --- Victory Fanfare ---
  public playVictory() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume * 0.6;

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.15);
      gain.gain.setValueAtTime(vol, t + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.15 + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.15);
      osc.stop(t + idx * 0.15 + 0.45);
    });
  }

  public playVictoryFanfare() {
    this.playVictory();
  }

  // --- Defeat Sound ---
  public playDefeat() {
    if (this.muted) return;
    this.initContext();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const vol = this.masterVolume * this.sfxVolume * 0.6;

    const notes = [440, 415, 392, 349];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.22);
      gain.gain.setValueAtTime(vol, t + idx * 0.22);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.22 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + idx * 0.22);
      osc.stop(t + idx * 0.22 + 0.35);
    });
  }

  // --- Tactical Ambient Music Drone ---
  public startAmbientMusic() {
    if (this.isMusicPlaying) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A1 note
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220, this.ctx.currentTime);

      gain.gain.setValueAtTime(this.muted ? 0 : this.musicVolume * this.masterVolume * 0.08, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      this.musicOsc = osc;
      this.musicGain = gain;
      this.isMusicPlaying = true;
    } catch {
      // Audio autoplay policy may defer until user gesture
    }
  }

  public stopAmbientMusic() {
    if (this.musicOsc) {
      try {
        this.musicOsc.stop();
        this.musicOsc.disconnect();
      } catch {
        // no-op
      }
      this.musicOsc = null;
    }
    this.isMusicPlaying = false;
  }
}

export const soundManager = new SoundSynthesizer();
