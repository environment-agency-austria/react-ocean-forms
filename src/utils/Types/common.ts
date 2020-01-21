/**
 * @packageDocumentation
 * @module common
 * @category Type Utils
 */

export type Subtract<T, U> = Omit<T, keyof U>;
