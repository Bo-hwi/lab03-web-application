/** Lazily creates Web Audio nodes for short, self-cleaning drum hits. */
export function createDrumSynth({
  createContext = () => {
    const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AudioContextClass) throw new Error("Web Audio is unavailable in this browser.");
    return new AudioContextClass();
  },
  random = Math.random,
} = {}) {
  let context = null;
  let disposed = false;
  const voices = new Set();

  const disconnectVoice = (voice) => {
    for (const source of voice.sources) source.onended = null;
    for (const node of voice.nodes) node.disconnect();
    voices.delete(voice);
  };

  async function play(pad) {
    if (disposed) throw new Error("Drum synth has been disposed.");
    if (!pad?.synth) throw new TypeError("A drum pad with synth settings is required.");
    if (!context) context = createContext();
    const ctx = context;
    if (ctx.state === "suspended") await ctx.resume();
    if (disposed) return;

    const { synth } = pad;
    const now = ctx.currentTime;
    const duration = synth.durationMs / 1_000;
    const output = ctx.createGain();
    output.gain.setValueAtTime(Math.max(0.0001, synth.gain), now);
    output.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    output.connect(ctx.destination);
    const nodes = [output];
    const sources = [];

    if (synth.kind === "tone") {
      const oscillator = ctx.createOscillator();
      oscillator.type = pad.id === "kick" ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(synth.frequencyHz, now);
      oscillator.frequency.exponentialRampToValueAtTime(synth.endFrequencyHz, now + duration);
      oscillator.connect(output);
      nodes.push(oscillator);
      sources.push(oscillator);
    } else if (synth.kind === "noise") {
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
      const samples = buffer.getChannelData(0);
      for (let i = 0; i < samples.length; i += 1) samples[i] = random() * 2 - 1;
      const noise = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      noise.buffer = buffer;
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(synth.cutoffHz, now);
      noise.connect(filter);
      filter.connect(output);
      nodes.push(noise, filter);
      sources.push(noise);

      if (synth.frequencyHz > 0) {
        const body = ctx.createOscillator();
        const bodyGain = ctx.createGain();
        body.type = "triangle";
        body.frequency.setValueAtTime(synth.frequencyHz, now);
        bodyGain.gain.setValueAtTime(0.18, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        body.connect(bodyGain);
        bodyGain.connect(output);
        nodes.push(body, bodyGain);
        sources.push(body);
      }
    } else {
      output.disconnect();
      throw new RangeError(`Unsupported drum synth kind: ${synth.kind}`);
    }

    const voice = { nodes, sources, remaining: sources.length };
    voices.add(voice);
    for (const source of sources) {
      source.onended = () => {
        voice.remaining -= 1;
        if (voice.remaining === 0) disconnectVoice(voice);
      };
      source.start(now);
      source.stop(now + duration + 0.01);
    }
  }

  async function dispose() {
    if (disposed) return;
    disposed = true;
    for (const voice of [...voices]) {
      for (const source of voice.sources) {
        source.onended = null;
        try { source.stop(); } catch { /* A source may have already ended. */ }
      }
      disconnectVoice(voice);
    }
    if (context && context.state !== "closed") await context.close();
  }

  const getSnapshot = () => Object.freeze({ hasContext: Boolean(context), activeVoices: voices.size, disposed });
  return Object.freeze({ play, dispose, getSnapshot });
}
