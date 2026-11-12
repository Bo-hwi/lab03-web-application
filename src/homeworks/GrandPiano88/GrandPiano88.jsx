import { useId, useState } from "react";
import { MIN_PIANO_MIDI, PIANO_NOTES } from "./notes.js";
import { PianoKeyboardView } from "./PianoKeyboard.jsx";
import { MAX_RECORDED_NOTES } from "./recording.js";
import { REPLAY_SPEEDS } from "./sequencePlayer.js";
import { usePianoInput } from "./usePianoInput.js";
import { useRecorder } from "./useRecorder.js";
import { useSequencer } from "./useSequencer.js";
import styles from "./GrandPiano88.module.css";

const SPEED_OPTIONS = Object.freeze(REPLAY_SPEEDS.map((value) => Object.freeze({ id: `speed-${value}x`, value })));
const noteName = (midi) => PIANO_NOTES[midi - MIN_PIANO_MIDI].noteName;

function describe(recording, playback, lastAction) {
  if (playback.status === "playing") return `Playing ${recording.entries.length} notes at ${playback.speed}×.`;
  if (recording.status === "recording") return `Recording… ${recording.capturedCount} notes captured.`;
  if (lastAction !== "play") return describeTake(recording);
  if (playback.outcome === "completed") return `Playback finished at ${playback.speed}×.`;
  if (playback.outcome === "aborted") return "Playback stopped.";
  if (playback.outcome) return `Playback failed: ${playback.outcome}`;
  return describeTake(recording);
}

function describeTake(recording) {
  if (recording.limitReached) return `Recording stopped at the ${MAX_RECORDED_NOTES}-note limit.`;
  if (recording.takeId > 0 && recording.entries.length > 0) return `Recorded ${recording.entries.length} notes.`;
  if (recording.takeId > 0) return "No recorded notes. Press Record to start a new take.";
  return "Ready. Press Record, play some notes, then Stop.";
}

/** HW2 page: shared input store feeds the keyboard, recorder and FIFO replay. */
export function GrandPiano88({ createSynth }) {
  const headingId = useId();
  const transportId = useId();
  const speedId = useId();
  const { input, snapshot } = usePianoInput(createSynth);
  const { recorder, recording } = useRecorder(input);
  const { playback, play, stop } = useSequencer(input);
  const [speed, setSpeed] = useState(1);
  const [lastAction, setLastAction] = useState(null);

  const isRecording = recording.status === "recording";
  const isPlaying = playback.status === "playing";
  const events = recording.entries.map((entry) => entry.event);

  return (
    <section className={styles.page} aria-labelledby={headingId}>
      <h2 id={headingId}>HW2 · 88-Key Polyphonic Piano &amp; FIFO Sequencer</h2>
      <PianoKeyboardView input={input} snapshot={snapshot} headingLevel={3} />
      <section className={styles.transport} aria-labelledby={transportId}>
        <h3 id={transportId}>Recorder and replay</h3>
        <form className={styles.controls} onSubmit={(event) => event.preventDefault()}>
          {isRecording ? (
            <button type="button" onClick={() => recorder.stop()}>Stop recording</button>
          ) : (
            <button type="button" disabled={isPlaying} onClick={() => { setLastAction("record"); recorder.start(snapshot.pressedMidis); }}>Record</button>
          )}
          <label htmlFor={speedId}>Replay speed</label>
          <select id={speedId} value={speed} disabled={isPlaying} onChange={(event) => setSpeed(Number(event.target.value))}>
            {SPEED_OPTIONS.map((option) => <option key={option.id} value={option.value}>{option.value}×</option>)}
          </select>
          <button type="button" disabled={isRecording || isPlaying || events.length === 0} onClick={() => { setLastAction("play"); play(events, speed); }}>Play</button>
          <button type="button" disabled={!isPlaying} onClick={stop}>Stop playback</button>
          <button type="button" disabled={isRecording || isPlaying || recording.takeId === 0} onClick={() => { setLastAction("clear"); recorder.clear(); }}>Clear</button>
        </form>
        <output role="status" aria-live="polite" className={styles.status}>{describe(recording, playback, lastAction)}</output>
        <details className={styles.take}>
          <summary>Recorded notes ({recording.entries.length})</summary>
          {recording.entries.length === 0 ? <p>No completed take yet.</p> : (
            <ol>
              {recording.entries.map(({ id, event }) => (
                <li key={id}>
                  {noteName(event.midi)} — after {Math.round(event.deltaMs)} ms, held {Math.round(event.durationMs)} ms
                </li>
              ))}
            </ol>
          )}
        </details>
      </section>
    </section>
  );
}
