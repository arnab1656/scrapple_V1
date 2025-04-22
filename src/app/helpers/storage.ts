import { EmailValidationService } from "../services/email-validation.service";

interface StoredEmail {
  email: string;
  timestamp: number;
  source: string;
  phone?: string;
}

const STORAGE_KEY = "linkedin_parsed_emails";

export const storageHelper = {
  // Add new emails to storage
  saveEmails: (emails: string[], source: string, phone?: string) => {
    const validator = EmailValidationService.getInstance();
    const validatedEmails = validator.processEmails(emails);

    // Save only valid emails
    const cleanEmails = validatedEmails
      .map((result) => result.cleaned)
      .filter((email): email is string => email !== null);

    try {
      // Get existing emails
      const existingData = localStorage.getItem(STORAGE_KEY);
      const storedEmails: StoredEmail[] = existingData
        ? JSON.parse(existingData)
        : [];

      // Process new emails
      const newEmails = cleanEmails
        .filter(
          (email) => !storedEmails.some((stored) => stored.email === email)
        ) // Remove duplicates
        .map((email) => ({
          email,
          timestamp: Date.now(),
          source,
          phone,
        }));

      // Combine and save
      const updatedEmails = [...storedEmails, ...newEmails];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));

      return newEmails.length; // Return number of new emails added
    } catch (error) {
      console.error("Error saving emails:", error);
      return 0;
    }
  },

  // Get all stored emails
  getStoredEmails: (): StoredEmail[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting stored emails:", error);
      return [];
    }
  },

  // Clear all stored emails
  clearStoredEmails: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error("Error clearing stored emails:", error);
      return false;
    }
  },

  // Delete specific email
  deleteEmail: (email: string) => {
    try {
      const storedEmails = storageHelper.getStoredEmails();
      const updatedEmails = storedEmails.filter((item) => item.email !== email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEmails));
      return true;
    } catch (error) {
      console.error("Error deleting email:", error);
      return false;
    }
  },
};
