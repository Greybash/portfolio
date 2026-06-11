// ============================================================
// SPACE MUSIC — Ambient generative interstellar soundtrack
// Uses Web Audio API for procedural cosmic ambient music
// ============================================================

import { useEffect, useRef, useCallback } from 'react';

// Cosmic scale frequencies (based on planetary orbital resonances)
const COSMIC_SCALE = [65.41, 73.42, 82.41, 87.31, 98.00, 110.00, 123.47, 130.81];
const HARMONICS = [1, 1.5, 2, 2.5, 3, 4, 5.5, 6];

interface SpaceMusicProps {
  enabled?: boolean;
  volume?: number;
}

export function SpaceMusic({ enabled = true, volume = 0.15 }: SpaceMusicProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodesRef = useRef<GainNode[]>([]);
  const isPlayingRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const createReverb = useCallback((ctx: AudioContext, duration: number = 8, decay: number = 5) => {
    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        const n = length - i;
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(n / length, decay);
      }
    }

    const convolver = ctx.createConvolver();
    convolver.buffer = impulse;
    return convolver;
  }, []);

  const createDrone = useCallback((ctx: AudioContext, baseFreq: number, harmonics: number[]) => {
    const masterGain = ctx.createGain();
    masterGain.gain.value = volume * 0.3;

    harmonics.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const waveforms: OscillatorType[] = ['sine', 'triangle', 'sine', 'sine'];
      osc.type = waveforms[i % waveforms.length];
      osc.frequency.value = baseFreq * ratio;

      osc.detune.value = (Math.random() - 0.5) * 15;

      filter.type = 'lowpass';
      filter.frequency.value = 400 + Math.random() * 600;
      filter.Q.value = 1;

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(
        (1 / harmonics.length) * (0.5 + Math.random() * 0.5), 
        ctx.currentTime + 3 + Math.random() * 4
      );

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start();
      oscillatorsRef.current.push(osc);
      gainNodesRef.current.push(gain);
    });

    return masterGain;
  }, [volume]);

  const playSpaceAmbience = useCallback(() => {
    if (!audioContextRef.current || isPlayingRef.current) return;

    const ctx = audioContextRef.current;
    isPlayingRef.current = true;

    const masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const reverb = createReverb(ctx, 10, 6);

    const reverbGain = ctx.createGain();
    reverbGain.gain.value = 0.4;
    reverb.connect(reverbGain);
    reverbGain.connect(masterGain);

    const drones = [
      { freq: 65.41, harmonics: [1, 2, 3, 5.5] },
      { freq: 98.00, harmonics: [1, 1.5, 2, 4] },
      { freq: 130.81, harmonics: [1, 2, 3] },
    ];

    drones.forEach((drone, i) => {
      const droneGain = createDrone(ctx, drone.freq, drone.harmonics);

      const dryGain = ctx.createGain();
      dryGain.gain.value = 0.6;
      droneGain.connect(dryGain);
      dryGain.connect(masterGain);

      const wetGain = ctx.createGain();
      wetGain.gain.value = 0.4;
      droneGain.connect(wetGain);
      wetGain.connect(reverb);

      droneGain.gain.setValueAtTime(0, ctx.currentTime);
      droneGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 5 + i * 3);
    });

    const playCosmicEvent = () => {
      if (!ctx || ctx.state !== 'running') return;

      const eventOsc = ctx.createOscillator();
      const eventGain = ctx.createGain();
      const eventFilter = ctx.createBiquadFilter();

      const freq = COSMIC_SCALE[Math.floor(Math.random() * COSMIC_SCALE.length)] * 
                   HARMONICS[Math.floor(Math.random() * HARMONICS.length)];

      eventOsc.type = 'sine';
      eventOsc.frequency.value = freq;

      eventFilter.type = 'bandpass';
      eventFilter.frequency.value = freq;
      eventFilter.Q.value = 20;

      eventGain.gain.setValueAtTime(0, ctx.currentTime);
      eventGain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.04, ctx.currentTime + 2);
      eventGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 8 + Math.random() * 6);

      eventOsc.connect(eventFilter);
      eventFilter.connect(eventGain);
      eventGain.connect(masterGain);

      eventOsc.start();
      eventOsc.stop(ctx.currentTime + 15);
    };

    intervalRef.current = setInterval(() => {
      if (Math.random() > 0.6) playCosmicEvent();
    }, 12000);

    setTimeout(playCosmicEvent, 3000);
  }, [createDrone, createReverb, volume]);

  const stopMusic = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    oscillatorsRef.current.forEach(osc => {
      try { osc.stop(); } catch { /* already stopped */ }
    });
    oscillatorsRef.current = [];
    gainNodesRef.current = [];

    if (masterGainRef.current && audioContextRef.current) {
      try {
        masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, audioContextRef.current.currentTime);
        masterGainRef.current.gain.linearRampToValueAtTime(0, 
          audioContextRef.current.currentTime + 0.1
        );
      } catch { /* already closed or invalid state */ }
    }

    if (audioContextRef.current) {
      const ctx = audioContextRef.current;
      setTimeout(() => {
        try {
          if (ctx.state !== 'closed') {
            ctx.close();
          }
        } catch (e) {
          console.error("Failed to close AudioContext:", e);
        }
      }, 200);
      audioContextRef.current = null;
    }

    isPlayingRef.current = false;
  }, []);

  useEffect(() => {
    if (!enabled) {
      stopMusic();
      return;
    }

    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      if (!isPlayingRef.current) {
        playSpaceAmbience();
      }
    };

    // Wait for user interaction before starting audio to comply with browser autoplay policies
    const events = ['click', 'touchstart', 'keydown'] as const;
    events.forEach(evt => document.addEventListener(evt, initAudio, { once: true }));

    return () => {
      stopMusic();
      events.forEach(evt => document.removeEventListener(evt, initAudio));
    };
  }, [enabled, playSpaceAmbience, stopMusic]);

  useEffect(() => {
    if (masterGainRef.current && audioContextRef.current) {
      masterGainRef.current.gain.linearRampToValueAtTime(
        volume,
        audioContextRef.current.currentTime + 1
      );
    }
  }, [volume]);

  return null;
}

export default SpaceMusic;
