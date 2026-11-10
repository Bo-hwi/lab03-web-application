import { midiToFrequency } from "../notes.js";

export const SYNTH_SETTINGS = Object.freeze({
  maxVoices: 8,
  maxReleaseTails: 8,
  attackSeconds: 0.005,
  decaySeconds: 0.08,
  sustainGain: 0.65,
  releaseSeconds: 0.04,
  gainFloor: 0.0001,
  // Sine peaks <= 1; at most 8 active + 8 releasing nodes => peak sum <= 0.8.
  masterGain: 0.8 / 16,
});

const success = (extra = {}) => Object.freeze({ ok: true, ...extra });

/**
 * Standalone, exclusively owned audio context. Call noteOn from a user gesture.
 * noteOn resolves {ok:true, voice:{id,midi}} or {ok:false,error}; never rejects.
 * noteOff requires the exact returned token, NOT a MIDI number. Retriggering a
 * MIDI releases its old token and appends a fresh token to FIFO. Getters expose
 * frozen logical snapshots; a stolen/released token immediately leaves activeVoices.
 * No React, recording, UI listeners, JS timers or replay scheduling in this engine.
 */
export class PolyphonicSynth {
  #createContext;
  #context = null;
  #master = null;
  #active = new Map();
  #byMidi = new Map();
  #tails = new Map();
  #nextId = 1;
  #generation = 0;
  #disposed = false;
  #resumePromise = null;
  #closing = null;
  #lastError = null;

  constructor({ createContext = () => new globalThis.AudioContext() } = {}) {
    this.#createContext = createContext;
  }

  get activeVoices() { return Object.freeze([...this.#active.values()].map((v) => v.token)); }
  get releasingVoices() { return Object.freeze([...this.#tails.values()].map((v) => v.token)); }
  get disposed() { return this.#disposed; }
  get lastError() { return this.#lastError; }

  async noteOn(midi) {
    const generation = this.#generation;
    try {
      const freqHz = midiToFrequency(midi);
      if (this.#disposed) return this.#failure("Audio engine is disposed.");
      await this.#ready();
      if (this.#disposed || generation !== this.#generation) {
        return this.#failure("Note cancelled before audio startup completed.");
      }
      const previous = this.#byMidi.get(midi);
      if (previous) this.#release(this.#active.get(previous));
      if (this.#active.size >= SYNTH_SETTINGS.maxVoices) {
        this.#release(this.#active.values().next().value);
      }
      const voice = this.#createVoice(midi, freqHz);
      this.#active.set(voice.token.id, voice);
      this.#byMidi.set(midi, voice.token.id);
      this.#lastError = null;
      return success({ voice: voice.token });
    } catch (error) {
      return this.#failure(error);
    }
  }

  noteOff(token) {
    const voice = this.#active.get(token?.id);
    if (!voice || voice.token !== token) return false;
    this.#release(voice);
    return true;
  }

  /** Immediate silence, including tails; invalidates all in-flight noteOn calls. */
  stopAll() {
    this.#generation += 1;
    for (const voice of [...this.#active.values(), ...this.#tails.values()]) {
      this.#terminate(voice);
    }
  }

  /** Synchronous mute/disconnect; await the result to confirm context closure.
   * A rejected close is reported, retained for a subsequent dispose retry.
   */
  dispose() {
    this.#disposed = true;
    this.stopAll();
    if (this.#closing) return this.#closing;
    if (!this.#context) return Promise.resolve(success());
    const context = this.#context;
    if (this.#master) {
      this.#master.gain.cancelScheduledValues(context.currentTime);
      this.#master.gain.setValueAtTime(0, context.currentTime);
      this.#master.disconnect();
      this.#master = null;
    }
    // Defer closure one microtask so concurrent dispose calls share this promise.
    this.#closing = Promise.resolve().then(async () => {
      try {
        if (context.state !== "closed") await context.close();
        this.#context = null;
        this.#resumePromise = null;
        return success();
      } catch (error) {
        return this.#failure(error);
      } finally {
        this.#closing = null;
      }
    });
    return this.#closing;
  }

  async #ready() {
    if (!this.#context) this.#context = this.#createContext();
    const context = this.#context;
    if (context.state === "closed") throw new Error("Audio context is closed.");
    if (!this.#master) {
      const master = context.createGain();
      try {
        master.gain.setValueAtTime(SYNTH_SETTINGS.masterGain, context.currentTime);
        master.connect(context.destination);
        this.#master = master;
      } catch (error) {
        master.disconnect();
        throw error;
      }
    }
    if (context.state !== "running") {
      if (!this.#resumePromise) {
        const pending = Promise.resolve(context.resume());
        this.#resumePromise = pending;
        const clear = () => {
          if (this.#resumePromise === pending) this.#resumePromise = null;
        };
        // Both branches handle the original promise; no orphan rejection chain.
        pending.then(clear, clear);
      }
      await this.#resumePromise;
    }
    if (context.state !== "running") throw new Error("Audio context did not resume.");
  }

  #createVoice(midi, freqHz) {
    const context = this.#context;
    const voice = {
      token: Object.freeze({ id: `voice-${this.#nextId++}`, midi }),
      oscillator: null, gain: null, started: false, ended: false,
      startTime: context.currentTime,
    };
    try {
      voice.oscillator = context.createOscillator();
      voice.gain = context.createGain();
      const { attackSeconds, decaySeconds, sustainGain, gainFloor } = SYNTH_SETTINGS;
      voice.oscillator.type = "sine";
      voice.oscillator.frequency.setValueAtTime(freqHz, voice.startTime);
      voice.gain.gain.setValueAtTime(gainFloor, voice.startTime);
      voice.gain.gain.linearRampToValueAtTime(1, voice.startTime + attackSeconds);
      voice.gain.gain.linearRampToValueAtTime(sustainGain, voice.startTime + attackSeconds + decaySeconds);
      voice.oscillator.connect(voice.gain);
      voice.gain.connect(this.#master);
      voice.oscillator.onended = () => this.#cleanup(voice);
      voice.oscillator.start(voice.startTime);
      voice.started = true;
      return voice;
    } catch (error) {
      this.#terminate(voice);
      throw error;
    }
  }

  #removeActive(voice) {
    this.#active.delete(voice.token.id);
    if (this.#byMidi.get(voice.token.midi) === voice.token.id) {
      this.#byMidi.delete(voice.token.midi);
    }
  }

  #release(voice) {
    this.#removeActive(voice);
    this.#tails.set(voice.token.id, voice);
    try {
      const now = this.#context.currentTime;
      const end = now + SYNTH_SETTINGS.releaseSeconds;
      const param = voice.gain.gain;
      // Anchor the analytically evaluated linear ADS envelope before replacing it.
      const level = this.#levelAt(voice, now);
      param.cancelScheduledValues(now);
      param.setValueAtTime(level, now);
      param.exponentialRampToValueAtTime(SYNTH_SETTINGS.gainFloor, end);
      voice.oscillator.stop(end);
      // Bound physical tails under rapid retriggers; overload truncates oldest tail.
      while (this.#tails.size > SYNTH_SETTINGS.maxReleaseTails) {
        this.#terminate(this.#tails.values().next().value);
      }
    } catch (error) {
      this.#failure(error);
      this.#terminate(voice);
    }
  }

  #levelAt(voice, now) {
    const { attackSeconds, decaySeconds, sustainGain, gainFloor } = SYNTH_SETTINGS;
    const elapsed = Math.max(0, now - voice.startTime);
    if (elapsed < attackSeconds) return gainFloor + (1 - gainFloor) * elapsed / attackSeconds;
    if (elapsed < attackSeconds + decaySeconds) {
      return 1 + (sustainGain - 1) * (elapsed - attackSeconds) / decaySeconds;
    }
    return sustainGain;
  }

  #terminate(voice) {
    if (voice.ended) return;
    try {
      if (voice.gain) {
        voice.gain.gain.cancelScheduledValues(this.#context.currentTime);
        voice.gain.gain.setValueAtTime(0, this.#context.currentTime);
      }
      // Replaces a future release stop with an immediate stop (Web Audio spec).
      if (voice.started) voice.oscillator.stop(this.#context.currentTime);
    } catch (error) {
      this.#failure(error);
    } finally {
      this.#cleanup(voice);
    }
  }

  #cleanup(voice) {
    if (voice.ended) return;
    voice.ended = true;
    this.#removeActive(voice);
    this.#tails.delete(voice.token.id);
    if (voice.oscillator) {
      voice.oscillator.onended = null;
      voice.oscillator.disconnect();
    }
    voice.gain?.disconnect();
  }

  #failure(error) {
    const message = error instanceof Error ? error.message : String(error);
    this.#lastError = message;
    return Object.freeze({ ok: false, error: message });
  }
}
