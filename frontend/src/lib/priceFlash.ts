/**
 * priceFlash — apply a brief flash class for ~500ms on price updates.
 *
 * Usage in a component:
 *   const { flashClass, flashPrice } = usePriceFlash();
 *   useEffect(() => flashPrice(price), [price]);
 *   <span className={flashClass}>{price}</span>
 *
 * The hook returns a className that includes `flash-up` or `flash-down`,
 * plus a base `price-flash` class so callers can scope the transition.
 * After 500ms the class is removed; the element returns to its base styling.
 *
 * SPEC.md §10 calls for a CSS transition fade over ~500ms. We model the
 * duration as a constant so tests can verify the same value.
 */
import { useCallback, useRef, useState } from 'react';

export const FLASH_DURATION_MS = 500;

export type FlashDirection = 'up' | 'down' | 'flat';

export interface UsePriceFlashResult {
  /** Class string to apply to the element being flashed. */
  flashClass: string;
  /** Call whenever a new price arrives. Pass the new price; direction is inferred. */
  flashPrice: (newPrice: number) => void;
}

/**
 * Hook state machine for the price-flash animation.
 *
 * - flashPrice(newPrice) — compare to previous price, schedule a class for ~500ms
 * - flashClass — empty string when idle; `flash-up flash-down` style when active
 *
 * The timer is tracked in a ref so cleanup happens deterministically across
 * renders; the direction class is held in state so React re-renders the cell.
 */
export function usePriceFlash(): UsePriceFlashResult {
  const [direction, setDirection] = useState<FlashDirection | null>(null);
  const lastPriceRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashPrice = useCallback((newPrice: number) => {
    const prev = lastPriceRef.current;
    lastPriceRef.current = newPrice;

    // First tick — no previous price, no flash.
    if (prev === null || prev === undefined) {
      return;
    }
    if (newPrice === prev) {
      return;
    }

    const next: FlashDirection = newPrice > prev ? 'up' : 'down';
    setDirection(next);

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setDirection(null);
      timerRef.current = null;
    }, FLASH_DURATION_MS);
  }, []);

  const flashClass = direction === 'up'
    ? 'flash-up'
    : direction === 'down'
      ? 'flash-down'
      : '';

  return { flashClass, flashPrice };
}

/**
 * Pure utility variant — useful for tests and non-React callers.
 * Returns the class that should be applied for a given direction, or '' if idle.
 */
export function flashClassFor(direction: FlashDirection | null): string {
  if (direction === 'up') return 'flash-up';
  if (direction === 'down') return 'flash-down';
  return '';
}