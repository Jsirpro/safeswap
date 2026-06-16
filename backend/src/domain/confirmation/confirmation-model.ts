import type { ConfirmationGateDto } from '../schemas/preview.js';

export type ConfirmationGate = ConfirmationGateDto;

export interface ExecutionPermission {
  intentId: string;
  previewId: string;
  permissionGranted: boolean;
  ptbId: string;
}
