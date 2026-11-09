import { act, renderHook } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const setup = (delay) =>
    renderHook(({ value, delay: d }) => useDebounce(value, d), { initialProps: { value: 'a', delay } });

  it('returns the first value immediately', () => {
    expect(setup().result.current).toBe('a');
  });

  it('waits 300 ms by default before updating', () => {
    const { result, rerender } = setup();
    rerender({ value: 'b', delay: undefined });

    act(() => jest.advanceTimersByTime(299));
    expect(result.current).toBe('a');

    act(() => jest.advanceTimersByTime(1));
    expect(result.current).toBe('b');
  });

  it('accepts a custom delay and restarts the timer on every change', () => {
    const { result, rerender } = setup(100);

    rerender({ value: 'b', delay: 100 });
    act(() => jest.advanceTimersByTime(60));
    rerender({ value: 'c', delay: 100 });
    act(() => jest.advanceTimersByTime(60));
    expect(result.current).toBe('a');

    act(() => jest.advanceTimersByTime(40));
    expect(result.current).toBe('c');
  });
});
