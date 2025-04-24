import { emailAutomateCall } from "@/action/emailAutomate";
import { StoredPost } from "../helpers/storage";
import { EmailResponse } from "@/common/interface/emailResponse.interface";

export class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendBulkEmails(storedPosts: StoredPost[]) {
    const result: EmailResponse = await emailAutomateCall(storedPosts);

    return result;
  }
}
