// Because i hate try..catch syntax.
export async function orThrow<F extends () => T, T = ReturnType<F>>(
  fn: F,
  errorFn: (error: unknown) => Error
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    throw errorFn(error);
  }
}

export function bytesToMegabytes(bytes: number) {
  return bytes / 1024 / 1024;
}
