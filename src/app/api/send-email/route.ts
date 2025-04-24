import { NextResponse } from "next/server";

import { HTML_TEMPLATE } from "@/constant/GMAIL_HTML_TEMPLATE";
import { transporter } from "@/config/nodeMailer.config";
import { sanitizeEmailList } from "@/helpers/emailListSanitizer";
import { pdfExtractor } from "@/helpers/pdfExtractor";
import {
  EmailResult,
  EmailResponse,
} from "@/common/interface/emailResponse.interface";

export async function POST(req: Request) {
  try {
    const { posts } = await req.json();

    const pdfContent = pdfExtractor();

    const uniqueContacts = sanitizeEmailList(posts);

    const results: EmailResult[] = [];

    for (const contact of uniqueContacts) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: contact.email,
          subject: `Full Stack MERN Engineer | REF ${contact.author.name}`,
          html: HTML_TEMPLATE(contact),
          attachments: [
            {
              filename: "Arnab_Full_Stack_Resume.pdf",
              content: pdfContent,
              contentType: "application/pdf",
            },
          ],
        });
        console.log(`Email sent successfully to ${contact.email}`);
        results.push({ email: contact.email, status: "success" });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to send email to ${contact.email}`);
        results.push({ email: contact.email, status: "failed", error });
      }
    }

    return NextResponse.json<EmailResponse>({
      success: true,
      results,
      totalSent: results.filter((r) => r.status === "success").length,
      totalFailed: results.filter((r) => r.status === "failed").length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}
