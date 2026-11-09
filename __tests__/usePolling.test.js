import { act, renderHook } from '@testing-library/react';
import { usePolling } from '@/hooks/usePolling';

describe('usePolling', () => {
  let hidden;

  beforeEach(() => {
    jest.useFakeTimers();
    hidden = false;
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
  });

  afterEach(() => {
    jest.useRealTimers();
    delete document.hidden;
  });

  const tick = (ms) => act(() => jest.advanceTimersByTime(ms));

  it('calls the callback right away and then on every interval', () => {
    const cb = jest.fn();
    renderHook(() => usePolling(cb, 1000));
    expect(cb).toHaveBeenCalledTimes(1);

    tick(3000);
    expect(cb).toHaveBeenCalledTimes(4);
  });

  it('skips the ticks while the tab is hidden', () => {
    const cb = jest.fn();
    renderHook(() => usePolling(cb, 1000));

    hidden = true;
    tick(2000);
    expect(cb).toHaveBeenCalledTimes(1);

    hidden = false;
    tick(1000);
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('starts again right away when the reset key changes', () => {
    const cb = jest.fn();
    const { rerender } = renderHook(({ key }) => usePolling(cb, 1000, key), { initialProps: { key: 'bitcoin' } });
    expect(cb).toHaveBeenCalledTimes(1);

    rerender({ key: 'ethereum' });
    expect(cb).toHaveBeenCalledTimes(2);
  });

  it('always calls the latest callback without restarting the timer', () => {
    const first = jest.fn();
    const second = jest.fn();
    const { rerender } = renderHook(({ fn }) => usePolling(fn, 1000), { initialProps: { fn: first } });

    rerender({ fn: second });
    expect(second).not.toHaveBeenCalled();

    tick(1000);
    expect(second).toHaveBeenCalledTimes(1);
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('stops polling when the component unmounts', () => {
    const cb = jest.fn();
    const { unmount } = renderHook(() => usePolling(cb, 1000));

    unmount();
    tick(5000);
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
