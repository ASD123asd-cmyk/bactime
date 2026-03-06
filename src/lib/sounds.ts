let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

export const playTick = () => {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = 800;
  osc.type = "sine";
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
};

export const playChime = () => {
  const ctx = getAudioContext();
  const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    osc.type = "sine";
    const start = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

    osc.start(start);
    osc.stop(start + 0.5);
  });
};

// Gentle ambient drone
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let isAmbientPlaying = false;

export const toggleAmbient = (): boolean => {
  const ctx = getAudioContext();

  if (isAmbientPlaying && ambientOsc && ambientGain) {
    ambientGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
    ambientOsc.stop(ctx.currentTime + 1);
    ambientOsc = null;
    ambientGain = null;
    isAmbientPlaying = false;
    return false;
  }

  // Create layered ambient
  const createTone = (freq: number, vol: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = "sine";
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + 2);
    osc.start();
    return { osc, gain };
  };

  const t1 = createTone(174.61, 0.015); // F3
  createTone(261.63, 0.01);  // C4
  createTone(329.63, 0.008); // E4

  ambientOsc = t1.osc;
  ambientGain = t1.gain;
  isAmbientPlaying = true;
  return true;
};

export const getAmbientState = () => isAmbientPlaying;
