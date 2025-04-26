import { EmailResponse } from "@/common/interface/emailResponse.interface";
import { StoredPost } from "@/helpers/storage";

export const emailAutomateCall = async (storedPosts: StoredPost[]) => {
  try {
    const response = await fetch("http://localhost:8080/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts: storedPosts }),
    });

    const data: EmailResponse = await response.json();

    return data;
  } catch (error) {
    console.error("Failed to send emails:", error);
    throw error;
  }
};
