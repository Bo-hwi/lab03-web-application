import { useEffect, useState } from "react";

/** Uses physical key codes and releases held state on keyup or window blur. */
export function useDrumKeyboard(padMap, onTriggerPad, isEnabled = true) {
  const [heldPadIds, setHeldPadIds] = useState([]);

  useEffect(() => {
    if (!isEnabled) return undefined;
    const heldCodes = new Set();

    const onKeyDown = (event) => {
      if (event.repeat || heldCodes.has(event.code)) return;
      const target = event.target;
      if (target instanceof Element && (target.matches("input, textarea, select") || target.closest("[contenteditable='true']"))) return;
      const pad = padMap.get(event.code);
      if (!pad) return;
      event.preventDefault();
      heldCodes.add(event.code);
      setHeldPadIds((current) => current.includes(pad.id) ? current : [...current, pad.id]);
      onTriggerPad(pad);
    };
    const onKeyUp = (event) => {
      if (!heldCodes.delete(event.code)) return;
      const pad = padMap.get(event.code);
      if (pad) setHeldPadIds((current) => current.filter((id) => id !== pad.id));
    };
    const onBlur = () => {
      heldCodes.clear();
      setHeldPadIds([]);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
      heldCodes.clear();
    };
  }, [padMap, onTriggerPad, isEnabled]);

  return isEnabled ? heldPadIds : [];
}
