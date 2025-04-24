import { EmailValidationService } from "../services/email-validation.service";
import { LinkedInPost } from "../services/linkedin-content-fetch.service";

interface StoredEmail {
  email: string;
  timestamp: number;
  source: string;
  phone?: string;
}

export interface StoredPost {
  id: string;
  author: {
    name: string;
    title?: string;
  };
  content: string;
  email?: string;
  phone?: string;
  timestamp: number;
}

const STORAGE_KEY = "linkedin_parsed_data";

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

      return newEmails.length;
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

  // Save post data including author, content, and contact info
  savePosts: (posts: LinkedInPost[]) => {
    try {
      const existingData = localStorage.getItem(STORAGE_KEY);
      const storedPosts: StoredPost[] = existingData
        ? JSON.parse(existingData)
        : [];

      const newPosts = posts.map((post) => ({
        id: post.id,
        author: {
          name: post.author.name,
          title: post.author.title,
        },
        content: post.content,
        email: post.emails[0],
        phone: post.phones?.[0],
        timestamp: Date.now(),
      }));

      // Filter out duplicates based on post ID
      const updatedPosts = [
        ...storedPosts,
        ...newPosts.filter(
          (newPost) => !storedPosts.some((stored) => stored.id === newPost.id)
        ),
      ];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPosts));
      return newPosts.length;
    } catch (error) {
      console.error("Error saving posts:", error);
      return 0;
    }
  },

  // Get all stored posts
  getStoredPosts: (): StoredPost[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting stored posts:", error);
      return [];
    }
  },
};
