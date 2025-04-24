export interface EmailResult {
  email: string | undefined;
  status: string;
  error?: unknown;
}

export interface EmailResponse {
  success: boolean;
  results: EmailResult[];
  totalSent: number;
  totalFailed: number;
}
