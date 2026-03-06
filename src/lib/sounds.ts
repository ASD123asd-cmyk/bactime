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

// Gentle ambient drone - track ALL oscillators
let ambientNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
let isAmbientPlaying = false;

export const toggleAmbient = (): boolean => {
  const ctx = getAudioContext();

  if (isAmbientPlaying) {
    ambientNodes.forEach(({ osc, gain }) => {
      gain.gain.cancelScheduledValues(ctx.currentTime);
      gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      osc.stop(ctx.currentTime + 0.6);
    });
    ambientNodes = [];
    isAmbientPlaying = false;
    return false;
  }

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

  ambientNodes = [
    createTone(174.61, 0.015),
    createTone(261.63, 0.01),
    createTone(329.63, 0.008),
  ];
  isAmbientPlaying = true;
  return true;
};

export const getAmbientState = () => isAmbientPlaying;
