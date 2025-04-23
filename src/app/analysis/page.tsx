"use client";

import { useState, useRef } from "react";
import { LinkedInContentFetcherService } from "../services/linkedin-content-fetch.service";
import { storageHelper } from "../helpers/storage";

// Import the types
import type { LinkedInPost } from "../services/linkedin-content-fetch.service";

export default function AnalysisPage() {
  const [analysisResults, setAnalysisResults] = useState<LinkedInPost[]>([]);
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

      // Just parse and send the entire DOM to analyzer
      const parser = new DOMParser();
      const doc = parser.parseFromString(domContent, "text/html");
      const analyzer = LinkedInContentFetcherService.getInstance();

      // Let analyzer handle all DOM traversal and extraction
      const results = analyzer.analyzeContent(doc.documentElement.outerHTML);

      if (results.length === 0) {
        setError("No LinkedIn content found in the provided HTML");
        return;
      }

      // Store the complete post data
      storageHelper.savePosts(results);

      setAnalysisResults(results);
    } catch (err) {
      setError(
        `Analysis failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

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
            {analysisResults.map((post, index) => (
              <div
                key={`${post.id}-${index}`}
                className="border rounded-lg p-4 shadow"
              >
                <div>
                  <h4 className="font-medium text-gray-700">Author</h4>
                  <div className="ml-4">
                    <p>Name: {post.author.name}</p>
                    <p>Title: {post.author.title}</p>
                    {post.author.connectionDegree && (
                      <p>Connection: {post.author.connectionDegree}nd degree</p>
                    )}
                  </div>
                </div>

                {post.content && (
                  <div>
                    <h4 className="font-medium text-gray-700">Content</h4>
                    <p className="ml-4 whitespace-pre-wrap">{post.content}</p>
                  </div>
                )}

                {post.emails && post.emails.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700">Contact</h4>
                    <div className="ml-4">
                      {post.emails.map((email, idx) => (
                        <p key={idx}>Email: {email}</p>
                      ))}
                      {post.phones?.map((phone, idx) => (
                        <p key={idx}>Phone: {phone}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
