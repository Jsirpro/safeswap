import { config } from './config.js';

export function isMockMode(): boolean {
  return config.mockMode;
}
