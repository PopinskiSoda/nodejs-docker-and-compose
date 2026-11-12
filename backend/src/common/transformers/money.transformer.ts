import type { ValueTransformer } from 'typeorm';

export const moneyTransformer: ValueTransformer = {
  to: (value: number) => value,
  from: (value: string | number) => Number(value),
};
