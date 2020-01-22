# use-resolved

React hook for handling the state of a _promisable_ value.

## Usage

```tsx
import * as React from 'react';
import { useResolved } from 'use-resolved';

export const SomeComponent = ({ promisable }) => {
  const { error, pending, value } = useResolved(() => promisable, [promisable]);

  return (
    <>
      {pending ? (
        <Spinner />
      ) : error ? (
        <Error>{error.message}</Error>
      ) : (
        <pre>{value}</pre>
      )}
    </>
  );
};
```
