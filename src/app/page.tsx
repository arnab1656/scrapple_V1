"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { storageHelper } from "../helpers/storage";

interface ParsedData {
  title?: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  description?: string;
  location?: string;
}

interface EnhancedParsedData extends ParsedData {
  postDate?: string;
  keywords?: string[];
  engagement?: {
    likes?: number;
    comments?: number;
  };
  recruiterInfo?: {
    name?: string;
    role?: string;
    company?: string;
  };
}

export default function Home() {
  const [sourceCode, setSourceCode] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [storedEmails, setStoredEmails] = useState<StoredEmail[]>([]);

  // Load stored emails on component mount
  useEffect(() => {
    setStoredEmails(storageHelper.getStoredEmails());
  }, []);

  const parseContent = () => {
    if (!sourceCode) return;

    setIsLoading(true);
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(sourceCode, "text/html");

      const extractedData: ParsedData = {
        title: doc.title?.replace("| LinkedIn", "").trim(),
        name: doc.querySelector("h1")?.textContent?.trim(),
        company: doc
          .querySelector('[data-test="company-name"]')
          ?.textContent?.trim(),
        email: findEmails(doc),
        phone: findPhoneNumbers(doc),
        description: doc
          .querySelector(".description__text")
          ?.textContent?.trim(),
        location: doc
          .querySelector(".job-details-jobs-unified-top-card__bullet")
          ?.textContent?.trim(),
      };

      // Store the found emails
      if (extractedData.email) {
        const emails = extractedData.email.split(", ");
        storageHelper.saveEmails(
          emails,
          extractedData.title || "Unknown Source",
          extractedData.phone
        );
        // Update stored emails state
        setStoredEmails(storageHelper.getStoredEmails());
      }

      setParsedData(extractedData);
    } catch (error) {
      console.error("Parsing error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const findEmails = (doc: Document): string => {
    const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/gi;
    const text = doc.body.textContent || "";
    const emails = text.match(emailRegex) || [];
    const validEmails = emails.filter((email) => {
      return (
        !email.includes("..") &&
        !email.includes(".-") &&
        !email.includes("-.") &&
        !email.endsWith(".") &&
        email.split("@")[0].length > 1
      );
    });
    return validEmails.join(", ");
  };

  const findPhoneNumbers = (doc: Document): string => {
    const text = doc.body.textContent || "";

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
        const cleaned = match.replace(/\s+/g, " ").trim();
        phones.add(cleaned);
      });
    });

    return Array.from(phones).join(", ");
  };

  // Add a section to display stored emails
  const StoredEmailsSection = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Stored Emails</h2>
        <button
          onClick={() => {
            storageHelper.clearStoredEmails();
            setStoredEmails([]);
          }}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Clear All
        </button>
      </div>
      <div className="space-y-2">
        {storedEmails.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{item.email}</p>
              <p className="text-sm text-gray-500">
                {new Date(item.timestamp).toLocaleDateString()} - {item.source}
                {item.phone && ` - ${item.phone}`}
              </p>
            </div>
            <button
              onClick={() => {
                storageHelper.deleteEmail(item.email);
                setStoredEmails(storageHelper.getStoredEmails());
              }}
              className="text-gray-400 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <main className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            LinkedIn Page Parser
          </h1>
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-6">
            <li>Open the LinkedIn profile/job page you want to parse</li>
            <li>Right-click and select &quot;View Page Source&quot;</li>
            <li>Copy the entire source code</li>
            <li>Paste it below and click &quot;Parse&quot;</li>
          </ol>

          <textarea
            className="w-full h-48 p-3 border border-gray-300 rounded-md font-mono text-sm"
            placeholder="Paste LinkedIn page source here..."
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
          />

          <button
            onClick={parseContent}
            disabled={isLoading || !sourceCode}
            className={`mt-4 px-4 py-2 rounded-md text-white font-medium 
              ${
                isLoading || !sourceCode
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {isLoading ? "Parsing..." : "Parse Content"}
          </button>
        </div>

        {parsedData && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Parsed Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(parsedData).map(
                ([key, value]) =>
                  value && (
                    <div
                      key={key}
                      className="border border-gray-100 rounded-md p-4"
                    >
                      <h3 className="text-sm font-medium text-gray-500 mb-1">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </h3>
                      <p className="text-gray-900">{value}</p>
                    </div>
                  )
              )}
            </div>
          </div>
        )}

        {storedEmails.length > 0 && <StoredEmailsSection />}
      </main>
    </div>
  );
}
