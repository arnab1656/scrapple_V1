import { StoredPost } from "./storage";

export const sanitizeEmailList = (posts: StoredPost[]) => {
  // Deduplicate posts by email - keep only first occurrence
  const emailMap = new Map<string, StoredPost>();
  posts.forEach((post: StoredPost) => {
    if (post.email && !emailMap.has(post.email)) {
      emailMap.set(post.email, post);
    }
  });

  // Convert map back to array and filter out already sent emails
  const uniqueContacts = Array.from(emailMap.values());

  return uniqueContacts;
};
