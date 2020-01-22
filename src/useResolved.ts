import { DependencyList, useEffect, useRef, useState } from 'react';

export type Functionable<T, A extends unknown[] = []> = T | ((...args: A) => T);
export type Promisable<T> = T | Promise<T>;

export type Result<T> =
  | { error?: undefined; pending: true; value?: T }
  | { error: Error; pending: false; value?: undefined }
  | { error?: undefined; pending: false; value: T };

const call = <T, A extends unknown[]>(input: Functionable<T, A>, ...args: A) =>
  typeof input === 'function' ? (input as (...args: A) => T)(...args) : input;

const resolve = async <T>(input: Promisable<T>): Promise<Result<T>> => {
  try {
    const value = await input;
    return { pending: false, value };
  } catch (error) {
    return { error, pending: false };
  }
};

export const useResolved = <T>(
  factory: () => Functionable<Promisable<T>>,
  deps: DependencyList = [],
  initialValue?: T,
): Result<T> => {
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState<Result<T>>(() => ({
    error: undefined,
    pending: true,
    value: initialValue,
  }));

  useEffect(() => {
    setState({ pending: true, value: initialValueRef.current });
    let mounted = true;

    (async () => {
      const result = await resolve(call(factory()));
      if (mounted) {
        setState(result);
      }
    })();

    return () => {
      mounted = false;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
};
