export const FATAL_CODES = new Set([
  'INVALID_LICENSE',
  'LICENSE_EXPIRED',
  'LICENSE_SUSPENDED',
  'LICENSE_REVOKED',
  'DEVICE_BLOCKED',
  'SESSION_EXPIRED',
  'SESSION_REVOKED',
  'UPDATE_REQUIRED',
  'VERSION_NOT_SUPPORTED',
  'MAINTENANCE'
]);

export class LicenseApiError extends Error {
  code: string;
  status: number;
  retryAfterSeconds?: number;

  constructor(code: string, status = 400, message?: string, retryAfterSeconds?: number) {
    super(message || code);
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
