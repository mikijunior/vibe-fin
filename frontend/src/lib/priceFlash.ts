// Price-flash utility (SPEC §10): when a new price arrives, apply a CSS
// class for ~500ms then remove it. Up-tick flashes green, down-tick red.
//
// Export both a low-level helper used by components and a small helper
// to compute the flash class from a previous price.

export const FLASH_DURATION_MS = 500;

export type FlashDirection = "up" | "down" | "flat" | null;

/** Compute the flash class from a previous vs current price. */
export function flashClassFromPrices(
  previous: number | null | undefined,
  current: number,
): FlashDirection {
  if (previous == null) return null;
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "flat";
}

/** Compute the tailwind/animation class name to apply. */
export function flashClassName(direction: FlashDirection): string {
  if (direction === "up") return "flash-up";
  if (direction === "down") return "flash-down";
  return "";
}

/**
 * Schedule removal of the flash class after FLASH_DURATION_MS.
 * Returns a cleanup function the caller can invoke if the element
 * unmounts mid-flash.
 */
export function scheduleFlashClear(el: HTMLElement): () => void {
  const tid = setTimeout(() => {
    el.classList.remove("flash-up", "flash-down");
  }, FLASH_DURATION_MS);
  return () => clearTimeout(tid);
}

/**
 * Apply a flash class to a DOM element, removing any previous flash
 * class first. Returns the cleanup function.
 */
export function applyFlash(
  el: HTMLElement,
  direction: FlashDirection,
): () => void {
  el.classList.remove("flash-up", "flash-down");
  const cls = flashClassName(direction);
  if (!cls) return () => {};
  el.classList.add(cls);
  return scheduleFlashClear(el);
}