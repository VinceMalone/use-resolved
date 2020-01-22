import { act, renderHook } from '@testing-library/react-hooks';

import { useResolved } from './useResolved';

describe('initially pending', () => {
  test.each`
    summary                               | factory
    ${'before input is resolved'}         | ${() => Promise.resolve(null)}
    ${'before input is rejected'}         | ${() => Promise.reject(new Error())}
    ${'even when input is not a promise'} | ${() => null}
  `('$summary', async ({ factory }) => {
    const hook = renderHook(() => useResolved(factory));
    expect(hook.result.current).toEqual({
      error: undefined,
      pending: true,
      value: undefined,
    });
    await hook.waitForNextUpdate();
  });
});

describe('initial value is used', () => {
  test.each`
    summary                               | factory
    ${'before input is resolved'}         | ${() => Promise.resolve(null)}
    ${'before input is rejected'}         | ${() => Promise.reject(new Error())}
    ${'even when input is not a promise'} | ${() => null}
  `('$summary', async ({ factory }) => {
    const initialValue = Symbol();
    const hook = renderHook(() => useResolved(factory, [], initialValue));
    expect(hook.result.current.value).toBe(initialValue);
    await hook.waitForNextUpdate();
  });
});

describe('resolves to value, when input (T) is:', () => {
  const value = Symbol();

  test.each`
    summary               | factory
    ${'T'}                | ${() => value}
    ${'Promise<T>'}       | ${() => Promise.resolve(value)}
    ${'() => T'}          | ${() => () => value}
    ${'() => Promise<T>'} | ${() => () => Promise.resolve(value)}
  `('$summary', async ({ factory }) => {
    const hook = renderHook(() => useResolved(factory));
    await hook.waitForNextUpdate();
    expect(hook.result.current).toEqual({
      error: undefined,
      pending: false,
      value,
    });
  });
});

describe('rejects to error, when input (T) is:', () => {
  const error = new Error();

  test.each`
    summary               | factory
    ${'Promise<T>'}       | ${() => Promise.reject(error)}
    ${'() => Promise<T>'} | ${() => () => Promise.reject(error)}
  `('$summary', async ({ factory }) => {
    const hook = renderHook(() => useResolved(factory));
    await hook.waitForNextUpdate();
    expect(hook.result.current).toEqual({
      error,
      pending: false,
      value: undefined,
    });
  });
});

describe('rerenders', () => {
  test('re-evaluates when dependencies change', async () => {
    let count = 0;

    const hook = renderHook(
      value =>
        useResolved(() => {
          count++;
          return value;
        }, [value]),
      { initialProps: 0 },
    );

    expect.assertions(6);
    expect(count).toBe(1);

    await hook.waitForNextUpdate();
    expect(hook.result.current.value).toBe(0);

    hook.rerender(0);
    expect(count).toBe(1);

    await act(async () => undefined);
    expect(hook.result.current.value).toBe(0);

    hook.rerender(1);
    expect(count).toBe(2);
    await hook.waitForNextUpdate();
    expect(hook.result.current.value).toBe(1);
  });

  test('`pending` is reset when awaiting a new value', async () => {
    const hook = renderHook(
      value => useResolved(() => Promise.resolve(value), [value]),
      { initialProps: 0 },
    );

    expect.assertions(4);
    expect(hook.result.current).toEqual({ pending: true, value: undefined });

    await hook.waitForNextUpdate();
    expect(hook.result.current).toEqual({ pending: false, value: 0 });

    hook.rerender(1);
    expect(hook.result.current).toEqual({ pending: true, value: undefined });

    await hook.waitForNextUpdate();
    expect(hook.result.current).toEqual({ pending: false, value: 1 });
  });

  test('`error` is reset when awaiting a new value', async () => {
    const hook = renderHook(
      error => useResolved(() => Promise.reject(error), [error]),
      { initialProps: 0 },
    );

    expect.assertions(4);
    expect(hook.result.current).toEqual({ error: undefined, pending: true });

    await hook.waitForNextUpdate();
    expect(hook.result.current).toEqual({ error: 0, pending: false });

    hook.rerender(1);
    expect(hook.result.current).toEqual({ error: undefined, pending: true });

    await hook.waitForNextUpdate();
    expect(hook.result.current).toEqual({ error: 1, pending: false });
  });

  test('initial value cannot be changed', async () => {
    const hook = renderHook(
      initialValue =>
        useResolved(
          () => new Promise(() => undefined),
          [initialValue],
          initialValue,
        ),
      {
        initialProps: 0,
      },
    );

    await act(async () => undefined);
    expect(hook.result.current.value).toBe(0);

    hook.rerender(1);
    await act(async () => undefined);
    expect(hook.result.current.value).toBe(0);
  });
});
