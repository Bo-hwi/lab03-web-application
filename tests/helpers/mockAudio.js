// Deterministic control-thread model. Does not claim browser DSP/audio fidelity.
export class MockAudioParam {
  events = [];

  setValueAtTime(value, time) { return this.#add("set", value, time); }
  linearRampToValueAtTime(value, time) { return this.#add("linear", value, time); }
  exponentialRampToValueAtTime(value, time) {
    if (value <= 0) throw new RangeError("Exponential gain must be positive.");
    return this.#add("exponential", value, time);
  }
  cancelScheduledValues(time) {
    this.events = this.events.filter((event) => event.time < time);
    return this;
  }
  #add(type, value, time) {
    if (!Number.isFinite(value) || !Number.isFinite(time) || time < 0) {
      throw new RangeError("Invalid audio automation.");
    }
    this.events.push({ type, value, time });
    return this;
  }
  valueAt(time) {
    let previous = { value: 1, time: 0 };
    for (const event of this.events) {
      if (time < event.time) {
        if (event.type === "set") return previous.value;
        const ratio = (time - previous.time) / (event.time - previous.time);
        return event.type === "exponential"
          ? previous.value * (event.value / previous.value) ** ratio
          : previous.value + (event.value - previous.value) * ratio;
      }
      previous = event;
    }
    return previous.value;
  }
}

class MockAudioNode {
  connections = new Set();
  connect(node) { this.connections.add(node); return node; }
  disconnect() { this.connections.clear(); }
}

export class MockGainNode extends MockAudioNode {
  gain = new MockAudioParam();
}

export class MockOscillatorNode extends MockAudioNode {
  frequency = new MockAudioParam();
  type = "sine";
  onended = null;
  started = false;
  ended = false;
  startTime = null;
  stopTime = Infinity;
  stopCalls = [];

  start(time = 0) {
    if (this.started) throw new Error("Oscillator cannot be started twice.");
    this.started = true;
    this.startTime = time;
  }
  stop(time = 0) {
    if (!this.started) throw new Error("Stop before start.");
    this.stopCalls.push(time);
    // Repeated stop before end replaces the previous schedule per Web Audio.
    if (!this.ended) this.stopTime = time;
  }
  dispatchEnded() {
    if (this.ended) return;
    this.ended = true;
    this.onended?.();
  }
}

export class MockAudioContext {
  currentTime = 0;
  state = "running";
  destination = {};
  gains = [];
  oscillators = [];
  resumeCalls = 0;
  closeCalls = 0;
  resumeImpl = null;
  closeImpl = null;
  failVoiceGain = false;

  createOscillator() {
    const oscillator = new MockOscillatorNode();
    this.oscillators.push(oscillator);
    return oscillator;
  }
  createGain() {
    if (this.failVoiceGain && this.gains.length > 0) throw new Error("Gain allocation failed.");
    const gain = new MockGainNode();
    this.gains.push(gain);
    return gain;
  }
  async resume() {
    this.resumeCalls += 1;
    if (this.resumeImpl) await this.resumeImpl();
    if (this.state === "closed") throw new Error("Context closed during resume.");
    this.state = "running";
  }
  async close() {
    this.closeCalls += 1;
    if (this.closeImpl) await this.closeImpl();
    this.state = "closed";
    for (const oscillator of this.oscillators) {
      if (oscillator.started) oscillator.dispatchEnded();
    }
  }
  advanceTo(time) {
    if (time < this.currentTime) throw new RangeError("Mock clock must advance.");
    this.currentTime = time;
    for (const oscillator of this.oscillators) {
      if (oscillator.started && oscillator.stopTime <= time) oscillator.dispatchEnded();
    }
  }
  get soundingOscillators() {
    return this.oscillators.filter((oscillator) => oscillator.started && !oscillator.ended &&
      oscillator.startTime <= this.currentTime && oscillator.stopTime > this.currentTime &&
      oscillator.connections.size > 0);
  }
}

export function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
