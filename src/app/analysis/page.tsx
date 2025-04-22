"use client";

import { useState, useRef } from "react";
import { LinkedInAnalyzerService } from "../services/linkedin-analyzer.service";
import { storageHelper as storageHelperUtils } from "../helpers/storage";

// Import the types
import type {
  LinkedInPost,
  JobListing,
} from "../services/linkedin-analyzer.service";

export default function AnalysisPage() {
  const [analysisResults, setAnalysisResults] = useState<
    (LinkedInPost | JobListing)[]
  >([]);
  const [error, setError] = useState<string>("");
  const domContentRef = useRef<HTMLTextAreaElement>(null);

  const analyzeDOMContent = () => {
    try {
      setError("");
      const domContent = domContentRef.current?.value;

      if (!domContent) {
        setError("Please enter DOM content to analyze");
        return;
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(domContent, "text/html");
      const analyzer = LinkedInAnalyzerService.getInstance();
      const results: (LinkedInPost | JobListing)[] = [];

      // Analyze content as before
      const jobElements = doc.querySelectorAll(
        '.job-details-jobs-unified-top-card, [data-test="job-card-container"]'
      );
      jobElements.forEach((element) => {
        results.push(...analyzer.analyzeContent(element.outerHTML));
      });

      const postElements = doc.querySelectorAll(
        ".feed-shared-update-v2, .update-components-text"
      );
      postElements.forEach((element) => {
        results.push(...analyzer.analyzeContent(element.outerHTML));
      });

      if (results.length === 0) {
        setError("No LinkedIn content found in the provided HTML");
        return;
      }

      // Store emails and phone numbers from results
      results.forEach((result) => {
        if ("emails" in result) {
          // Job listing
          storageHelperUtils.saveEmails(
            result.emails || [],
            `Job: ${result.title || "Unknown"}`,
            result.phones?.[0]
          );
        } else if (isLinkedInPost(result)) {
          // LinkedIn post
          const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;
          const emails = result.content.match(emailRegex) || [];
          if (emails.length > 0) {
            storageHelperUtils.saveEmails(
              emails,
              `Post by: ${result.author.name}`
            );
          }
        }
      });

      setAnalysisResults(results);
    } catch (err) {
      setError(
        `Analysis failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      console.error("Analysis error:", err);
    }
  };

  // Add these type guard functions
  function isLinkedInPost(
    result: LinkedInPost | JobListing
  ): result is LinkedInPost {
    return "author" in result && "content" in result;
  }

  return (
    <div className="container mx-auto p-4">
      {/* Input Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          LinkedIn Content Analyzer
        </h2>
        <textarea
          ref={domContentRef}
          className="w-full h-48 p-2 border rounded"
          placeholder="Paste LinkedIn DOM content here..."
        />
        <button
          onClick={analyzeDOMContent}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          Analyze Content
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {/* Results Display */}
      {analysisResults.length > 0 && (
        <div className="results-container">
          <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
          <div className="space-y-6">
            {analysisResults.map((result) => (
              <div
                key={isLinkedInPost(result) ? result.id : result.title}
                className="border rounded-lg p-4 shadow"
              >
                {isLinkedInPost(result) ? (
                  // Post content
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700">Author</h4>
                      <div className="ml-4">
                        <p>Name: {result.author.name}</p>
                        <p>Title: {result.author.title}</p>
                        {result.author.connectionDegree && (
                          <p>
                            Connection: {result.author.connectionDegree}nd
                            degree
                          </p>
                        )}
                      </div>
                    </div>
                    {result.content && (
                      <div>
                        <h4 className="font-medium text-gray-700">Content</h4>
                        <p className="ml-4 whitespace-pre-wrap">
                          {result.content}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  // Job listing content
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700">Job Details</h4>
                      <div className="ml-4">
                        <p>Title: {result.title}</p>
                        <p>Company: {result.company}</p>
                        <p>Location: {result.location}</p>
                        <p>Posted: {result.postedDate}</p>
                      </div>
                    </div>
                    {result.description && (
                      <div>
                        <h4 className="font-medium text-gray-700">
                          Description
                        </h4>
                        <p className="ml-4 whitespace-pre-wrap">
                          {result.description}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
