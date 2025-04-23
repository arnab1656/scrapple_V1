import {
  EmailValidationService,
  ValidatedEmail,
} from "./email-validation.service";

// Types/Interfaces for LinkedIn data structures
export interface LinkedInProfile {
  id: string;
  name: string;
  title?: string;
  connectionDegree?: number;
}

export interface LinkedInPost {
  id: string;
  author: LinkedInProfile;
  content: string;
  timestamp?: string;
  reactions?: PostReactions;
  comments?: PostComment[];
  emails: string[];
  phones: string[];
}

export interface JobListing {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  emails?: string[];
  phones?: string[];
  postedDate?: string;
}

export interface PostReactions {
  count: number;
  types: {
    like: number;
    celebrate: number;
    support: number;
    love: number;
    insightful: number;
    curious: number;
  };
}

export interface PostComment {
  id: string;
  author: LinkedInProfile;
  content: string;
  timestamp: Date;
  reactions?: PostReactions;
}

/**
 * Service to analyze LinkedIn DOM content locally without making any API calls.
 * This service only processes static HTML content that is already loaded.
 * WARNING: Do not add any API calls to this service to avoid account restrictions.
 */
export class LinkedInContentFetcherService {
  private static instance: LinkedInContentFetcherService;
  private emailValidator: EmailValidationService;

  private constructor() {
    this.emailValidator = EmailValidationService.getInstance();
  }

  public static getInstance(): LinkedInContentFetcherService {
    if (!LinkedInContentFetcherService.instance) {
      LinkedInContentFetcherService.instance =
        new LinkedInContentFetcherService();
    }
    return LinkedInContentFetcherService.instance;
  }

  public analyzeContent(domContent: string): LinkedInPost[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(domContent, "text/html");

    // Remove network request elements
    doc
      .querySelectorAll('img, iframe, script, link[rel="prefetch"]')
      .forEach((el) => el.remove());

    // Remove event handlers
    doc
      .querySelectorAll("[onclick], [onload], [src], [srcset]")
      .forEach((el) => {
        Array.from(el.attributes)
          .filter(
            (attr) =>
              attr.name.startsWith("on") ||
              attr.name === "src" ||
              attr.name === "srcset"
          )
          .forEach((attr) => el.removeAttribute(attr.name));
      });

    const posts = Array.from(doc.querySelectorAll(".feed-shared-update-v2"));
    return posts.map((postElement): LinkedInPost => {
      return {
        id: crypto.randomUUID(),
        author: this.extractAuthorInfo(postElement),
        content: this.extractPostContent(postElement),
        timestamp: this.extractTimestamp(postElement),
        reactions: this.getBasicReactions(postElement),
        comments: this.getBasicComments(postElement),
        emails: this.extractEmails(postElement as HTMLElement),
        phones: this.extractPhoneNumbers(postElement),
      };
    });
  }

  private isJobListing(element: Element): boolean {
    return !!(
      element.querySelector(".job-details-jobs-unified-top-card__job-title") ||
      element.querySelector('[data-test="job-card-container"]') ||
      element.querySelector(".jobs-search__job-details")
    );
  }

  private extractJobInfo(element: Element): JobListing {
    return {
      title: this.extractJobTitle(element),
      company: this.extractCompanyName(element),
      location: this.extractLocation(element),
      description: this.extractDescription(element),
      emails: this.extractEmails(element as HTMLElement),
      phones: this.extractPhoneNumbers(element),
      postedDate: this.extractPostedDate(element),
    };
  }

  private extractJobTitle(element: Element): string {
    return (
      element
        .querySelector(
          '.job-details-jobs-unified-top-card__job-title, [data-test="job-card-title"]'
        )
        ?.textContent?.trim() || ""
    );
  }

  private extractCompanyName(element: Element): string {
    return (
      element
        .querySelector(
          '[data-test="company-name"], .jobs-unified-top-card__company-name'
        )
        ?.textContent?.trim() || ""
    );
  }

  private extractLocation(element: Element): string {
    return (
      element
        .querySelector(
          '.job-details-jobs-unified-top-card__bullet, [data-test="job-card-location"]'
        )
        ?.textContent?.trim() || ""
    );
  }

  private extractDescription(element: Element): string {
    return (
      element
        .querySelector('.description__text, [data-test="job-description"]')
        ?.textContent?.trim() || ""
    );
  }

  private extractEmails(element: HTMLElement): string[] {
    // Now we can directly use innerText without casting
    const innerText = element.innerText;

    const firstChild = element.firstElementChild?.innerHTML;
    console.log("firstChild", firstChild);

    console.log("innerText", innerText);

    // Target elements with both mailto: and data-test-app-aware-link
    const mailtoLinks = element.querySelectorAll(
      'a[href^="mailto:"][data-test-app-aware-link]'
    );

    const mailtoEmails = Array.from(mailtoLinks)
      .map((link) => {
        const href = link.getAttribute("href");
        return href ? href.replace("mailto:", "").trim() : null;
      })
      .filter((email): email is string => email !== null);

    // If no mailto links found, fallback to regex extraction
    if (mailtoEmails.length === 0) {
      const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;
      const foundEmails = innerText.match(emailRegex) || [];
      return this.emailValidator
        .processEmails(foundEmails)
        .map((result: ValidatedEmail) => result.cleaned)
        .filter((email: string | null): email is string => email !== null);
    }

    return this.emailValidator
      .processEmails(mailtoEmails)
      .map((result: ValidatedEmail) => result.cleaned)
      .filter((email: string | null): email is string => email !== null);
  }

  private extractPhoneNumbers(element: Element): string[] {
    const text = element.textContent || "";
    const phoneRegex = [
      /\+\d{1,3}\s*\(\d{3}\)\s*\d{3}[-\s]?\d{4}/g,
      /\(\d{3}\)\s*\d{3}[-\s]?\d{4}/g,
      /\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/g,
      /\+\d{1,3}\s*\d{3}\s*\d{3}\s*\d{4}/g,
    ];

    const phones = new Set<string>();
    phoneRegex.forEach((regex) => {
      const matches = text.match(regex) || [];
      matches.forEach((match) => {
        phones.add(match.replace(/\s+/g, " ").trim());
      });
    });

    return Array.from(phones);
  }

  private extractPostedDate(element: Element): string {
    return (
      element
        .querySelector(
          '.jobs-unified-top-card__posted-date, [data-test="job-card-posted-date"]'
        )
        ?.textContent?.trim() || ""
    );
  }

  private extractAuthorInfo(element: Element): LinkedInProfile {
    const nameElement = element.querySelector(
      'span[dir="ltr"] span[aria-hidden="true"], .update-components-actor__name'
    );
    const titleElement = element.querySelector(
      ".update-components-actor__description"
    );

    return {
      id: crypto.randomUUID(),
      name: nameElement?.textContent?.trim() || "Unknown",
      title: titleElement?.textContent?.trim(),
      connectionDegree: this.extractConnectionDegree(element),
    };
  }

  private extractPostContent(element: Element): string {
    const contentElement = element.querySelector(".update-components-text");
    return contentElement?.textContent?.trim() || "";
  }

  private extractTimestamp(element: Element): string {
    const timestampElement = element.querySelector(
      ".update-components-actor__sub-description"
    );
    return timestampElement?.textContent?.trim() || "";
  }

  private getBasicReactions(element: Element): PostReactions {
    const count =
      element
        .querySelector(".social-details-social-counts__reactions-count")
        ?.textContent?.replace(/[^0-9]/g, "") || "0";

    return {
      count: parseInt(count),
      types: {
        like: 0,
        celebrate: 0,
        support: 0,
        love: 0,
        insightful: 0,
        curious: 0,
      },
    };
  }

  private getBasicComments(element: Element): PostComment[] {
    const commentTexts = element.querySelectorAll(
      ".comments-comment-item-content"
    );
    return Array.from(commentTexts).map((comment) => ({
      id: crypto.randomUUID(),
      author: {
        id: crypto.randomUUID(),
        name: "Anonymous",
        connectionDegree: undefined,
      },
      content: comment.textContent?.trim() || "",
      timestamp: new Date(),
      reactions: {
        count: 0,
        types: {
          like: 0,
          celebrate: 0,
          support: 0,
          love: 0,
          insightful: 0,
          curious: 0,
        },
      },
    }));
  }

  private extractConnectionDegree(element: Element): number | undefined {
    // Extract connection degree from profile info
    const connectionText = element.querySelector(
      ".update-components-actor__connections"
    )?.textContent;
    if (connectionText?.includes("2nd")) return 2;
    if (connectionText?.includes("3rd")) return 3;
    return undefined;
  }
}
