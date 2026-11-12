import { useEffect, useId, useReducer, useState } from "react";
import { waitForReplyTimeout } from "./ghosting.js";
import { createInitialSituationship, deriveEffort, situationshipReducer } from "./situationship.js";
import styles from "./SituationshipAnalyzer.module.css";

const phaseLabels = Object.freeze({
  STRANGERS: "Người lạ",
  DATING_NO_LOVE: "Hẹn hò nhưng không yêu",
  COMMITTED: "Cùng cam kết",
  SELF_RESPECT_EXIT: "Dừng lại và tôn trọng bản thân",
});

export function SituationshipAnalyzer() {
  const [state, dispatch] = useReducer(situationshipReducer, undefined, createInitialSituationship);
  const [actor, setActor] = useState("EM");
  const [steps, setSteps] = useState(1);
  const actorId = useId();
  const stepsId = useId();
  const { emScore, rivalScore, redFlag } = deriveEffort(state.signals, state.phase);

  useEffect(() => {
    if (state.phase !== "DATING_NO_LOVE" || !state.pendingMessageId) return undefined;
    const controller = new AbortController();
    const messageId = state.pendingMessageId;
    void waitForReplyTimeout(controller.signal).then(() => {
      dispatch({ type: "GHOST_TIMEOUT", id: messageId });
    }).catch((error) => {
      if (error.name !== "AbortError") dispatch({ type: "STOP" });
    });
    return () => controller.abort();
  }, [state.phase, state.pendingMessageId]);

  const addSignal = () => {
    if (!Number.isSafeInteger(steps) || steps <= 0) return;
    dispatch({ type: "ADD_SIGNAL", signal: { id: crypto.randomUUID(), actor, steps } });
  };
  const sendMessage = () => dispatch({ type: "SEND_MESSAGE", id: crypto.randomUUID() });

  return (
    <main className={styles.page}>
      <article className={styles.card} aria-labelledby="bonus-title">
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Lab 3 · Optional creative exercise</p>
          <h1 id="bonus-title">Hẹn Hò Nhưng Không Yêu</h1>
          <p>Một state machine nhỏ cho những tín hiệu không cân xứng.</p>
        </header>

        <section className={styles.panel} aria-labelledby="phase-title">
          <h2 id="phase-title">Trạng thái mối quan hệ</h2>
          <output className={styles.phase} role="status" aria-live="polite">{phaseLabels[state.phase]}</output>
          <p className={styles.hint}>Mỗi trạng thái là một phase duy nhất, không ghép nhiều boolean mâu thuẫn.</p>
          <ul className={styles.actions}>
            {state.phase === "STRANGERS" && <li><button type="button" onClick={() => dispatch({ type: "BEGIN_DATING" })}>Bắt đầu hẹn hò</button></li>}
            {state.phase === "DATING_NO_LOVE" && (
              <>
                <li><button type="button" disabled={Boolean(state.pendingMessageId)} onClick={sendMessage}>Gửi tin nhắn</button></li>
                <li><button type="button" disabled={!state.pendingMessageId} onClick={() => dispatch({ type: "REPLY_RECEIVED", id: state.pendingMessageId })}>Đã nhận hồi âm</button></li>
                <li><button type="button" disabled={state.replyStatus !== "replied"} onClick={() => dispatch({ type: "MUTUAL_COMMITMENT" })}>Cùng cam kết</button></li>
                <li><button type="button" onClick={() => dispatch({ type: "SWITCH_TO_AI_DO" })}>Chọn Ai Đó · rời đi</button></li>
              </>
            )}
            {state.phase !== "SELF_RESPECT_EXIT" && <li><button type="button" className={styles.secondary} onClick={() => dispatch({ type: "STOP" })}>Dừng lại</button></li>}
            {state.phase === "SELF_RESPECT_EXIT" && <li><button type="button" onClick={() => dispatch({ type: "RESTART" })}>Bắt đầu lại</button></li>}
          </ul>
          <p className={styles.reply} aria-live="polite">
            {state.replyStatus === "waiting" ? "Đang chờ hồi âm trong 5 giây…" :
              state.replyStatus === "replied" ? "Đã nhận hồi âm." :
                state.replyStatus === "ignored" ? "Seen không rep. Đã thoát và hủy chờ." :
                  state.replyStatus === "cancelled" ? "Đã hủy chờ và rời đi." : "Chưa có tin nhắn đang chờ."}
          </p>
        </section>

        <section className={styles.panel} aria-labelledby="effort-title">
          <h2 id="effort-title">Cố trăm lần vs một phần</h2>
          <p className={styles.hint}>Em: mỗi bước × 0,1 · Ai Đó: mỗi bước × 50. Điểm được tính trực tiếp từ nhật ký.</p>
          <section className={styles.controls} aria-label="Thêm tín hiệu nỗ lực">
            <p><label htmlFor={actorId}>Ai hành động?</label><select id={actorId} value={actor} onChange={(event) => setActor(event.target.value)}>
              <option value="EM">Em</option><option value="AI_DO">Ai Đó</option>
            </select></p>
            <p><label htmlFor={stepsId}>Số bước</label><input id={stepsId} type="number" min="1" step="1" value={steps} onChange={(event) => setSteps(Number.isNaN(event.target.valueAsNumber) ? "" : event.target.valueAsNumber)} /></p>
            <button type="button" disabled={!Number.isSafeInteger(steps) || steps <= 0} onClick={addSignal}>Ghi tín hiệu</button>
          </section>
          <dl className={styles.scores}><dt>Điểm của Em</dt><dd>{emScore}</dd><dt>Điểm Ai Đó</dt><dd>{rivalScore}</dd></dl>
          <output className={styles.warning} role="status" aria-live="polite">
            {redFlag ? "Cờ đỏ: nỗ lực của Em đang bị xem nhẹ." : "Không có cảnh báo mất cân xứng ở phase hiện tại."}
          </output>
          <h3>Nhật ký tín hiệu</h3>
          <ol className={styles.log}>
            {state.signals.map((signal) => <li key={signal.id}>{signal.actor === "EM" ? "Em" : "Ai Đó"}: {signal.steps} bước × {signal.multiplier}</li>)}
          </ol>
        </section>
      </article>
    </main>
  );
}
