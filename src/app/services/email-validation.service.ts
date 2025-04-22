export interface ValidatedEmail {
  original: string;
  cleaned: string | null;
  isValid: boolean;
}

export class EmailValidationService {
  private static instance: EmailValidationService;

  private constructor() {}

  public static getInstance(): EmailValidationService {
    if (!EmailValidationService.instance) {
      EmailValidationService.instance = new EmailValidationService();
    }
    return EmailValidationService.instance;
  }

  // Core validation methods
  public validateAndCleanEmail(email: string): string | null {
    const cleanedEmail = this.cleanDomainSuffixes(email);
    return this.isValidEmail(cleanedEmail) ? cleanedEmail : null;
  }

  private cleanDomainSuffixes(email: string): string {
    // Remove unwanted suffixes after valid TLDs
    return email.replace(
      /\.(com|co\.in|net|org|edu)(hashtag|Subject|Job|At|Role|Let|Join|or|For).*/i,
      ".$1"
    );
  }

  private isValidEmail(email: string): boolean {
    // Implement RFC 5322 validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Batch processing
  public processEmails(emails: string[]): ValidatedEmail[] {
    return emails
      .map((email) => ({
        original: email,
        cleaned: this.validateAndCleanEmail(email),
        isValid: this.isValidEmail(email),
      }))
      .filter((result) => result.cleaned !== null);
  }
}
