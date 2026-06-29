import { renderHook, act, waitFor } from '@testing-library/react';
import { useWatchlist } from '@/hooks/useWatchlist';
import type { WatchlistEntry } from '@/lib/types';

describe('useWatchlist', () => {
  const mockEntry: WatchlistEntry = {
    id: 'wl-1',
    user_id: 'default',
    ticker: 'AAPL',
    added_at: '2026-06-29T00:00:00Z',
  };

  beforeEach(() => {
    (global as unknown as { fetch: jest.Mock }).fetch = jest.fn();
  });

  it('loads tickers on mount', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ tickers: [mockEntry] }),
    });

    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.tickers).toEqual(['AAPL']);
    expect(result.current.error).toBeNull();
  });

  it('exposes an error when the initial fetch fails', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('network down');
  });

  it('POSTs to add a ticker and refreshes', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ tickers: [] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ ticker: 'NVDA' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          tickers: [{ ...mockEntry, ticker: 'NVDA', id: 'wl-2' }],
        }),
      });

    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTicker('NVDA');
    });

    const postCall = (fetch as jest.Mock).mock.calls[1];
    expect(postCall[0]).toBe('/api/watchlist');
    expect(postCall[1].method).toBe('POST');
    expect(JSON.parse(postCall[1].body)).toEqual({ ticker: 'NVDA' });
    await waitFor(() => expect(result.current.tickers).toEqual(['NVDA']));
  });

  it('uppercases and trims the ticker before adding', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tickers: [] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ticker: 'TSLA' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tickers: [] }) });

    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addTicker('  tsla ');
    });

    const postCall = (fetch as jest.Mock).mock.calls[1];
    expect(JSON.parse(postCall[1].body)).toEqual({ ticker: 'TSLA' });
  });

  it('DELETEs to remove a ticker and refreshes', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tickers: [mockEntry] }),
      })
      .mockResolvedValueOnce({ ok: true, status: 204 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tickers: [] }) });

    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.tickers).toEqual(['AAPL']));

    await act(async () => {
      await result.current.removeTicker('AAPL');
    });

    const deleteCall = (fetch as jest.Mock).mock.calls[1];
    expect(deleteCall[0]).toBe('/api/watchlist/AAPL');
    expect(deleteCall[1].method).toBe('DELETE');
    await waitFor(() => expect(result.current.tickers).toEqual([]));
  });

  it('treats 404 on remove as success', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tickers: [mockEntry] }),
      })
      .mockResolvedValueOnce({ ok: false, status: 404 })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ tickers: [] }) });

    const { result } = renderHook(() => useWatchlist());
    await waitFor(() => expect(result.current.tickers).toEqual(['AAPL']));

    await act(async () => {
      await result.current.removeTicker('AAPL');
    });

    await waitFor(() => expect(result.current.error).toBeNull());
  });
});