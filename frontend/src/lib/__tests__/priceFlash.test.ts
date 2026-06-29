import {
  FLASH_DURATION_MS,
  flashClassFor,
  usePriceFlash,
} from '@/lib/priceFlash';
import { act, renderHook } from '@testing-library/react';

describe('priceFlash', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  describe('flashClassFor (pure utility)', () => {
    it('returns flash-up for upward ticks', () => {
      expect(flashClassFor('up')).toBe('flash-up');
    });
    it('returns flash-down for downward ticks', () => {
      expect(flashClassFor('down')).toBe('flash-down');
    });
    it('returns empty string for flat / null', () => {
      expect(flashClassFor('flat')).toBe('');
      expect(flashClassFor(null)).toBe('');
    });
  });

  describe('usePriceFlash', () => {
    it('starts with no flash class', () => {
      const { result } = renderHook(() => usePriceFlash());
      expect(result.current.flashClass).toBe('');
    });

    it('ignores the very first price (no previous reference)', () => {
      const { result } = renderHook(() => usePriceFlash());
      act(() => result.current.flashPrice(100));
      expect(result.current.flashClass).toBe('');
    });

    it('applies flash-up when price rises', () => {
      const { result } = renderHook(() => usePriceFlash());
      act(() => result.current.flashPrice(100));
      act(() => result.current.flashPrice(101));
      expect(result.current.flashClass).toBe('flash-up');
    });

    it('applies flash-down when price falls', () => {
      const { result } = renderHook(() => usePriceFlash());
      act(() => result.current.flashPrice(100));
      act(() => result.current.flashPrice(99));
      expect(result.current.flashClass).toBe('flash-down');
    });

    it('does not flash when price is unchanged', () => {
      const { result } = renderHook(() => usePriceFlash());
      act(() => result.current.flashPrice(100));
      act(() => result.current.flashPrice(100));
      expect(result.current.flashClass).toBe('');
    });

    it('removes the flash class after FLASH_DURATION_MS', () => {
      const { result } = renderHook(() => usePriceFlash());
      act(() => result.current.flashPrice(100));
      act(() => result.current.flashPrice(105));
      expect(result.current.flashClass).toBe('flash-up');

      act(() => {
        jest.advanceTimersByTime(FLASH_DURATION_MS);
      });
      expect(result.current.flashClass).toBe('');
    });

    it('replaces the previous flash if a new tick arrives within the window', () => {
      const { result } = renderHook(() => usePriceFlash());
      act(() => result.current.flashPrice(100));
      act(() => result.current.flashPrice(110)); // up
      expect(result.current.flashClass).toBe('flash-up');

      act(() => {
        jest.advanceTimersByTime(200);
      });
      act(() => result.current.flashPrice(90)); // down before timer expires
      expect(result.current.flashClass).toBe('flash-down');

      act(() => {
        jest.advanceTimersByTime(FLASH_DURATION_MS);
      });
      expect(result.current.flashClass).toBe('');
    });
  });
});