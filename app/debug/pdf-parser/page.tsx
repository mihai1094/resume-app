"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PDFDebugPage() {
  const [extractedText, setExtractedText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError("");
    setExtractedText("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-linkedin-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to parse PDF");
        return;
      }

      // Display the raw extracted data
      setExtractedText(JSON.stringify(data.data, null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">LinkedIn PDF Parser Debug</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload LinkedIn PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="block w-full mb-4"
            />
            {loading && <p className="text-sm text-gray-600">Processing...</p>}
            {error && <p className="text-sm text-red-600">Error: {error}</p>}
          </CardContent>
        </Card>

        {extractedText && (
          <Card>
            <CardHeader>
              <CardTitle>Parsed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 text-xs">
                {extractedText}
              </pre>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(extractedText);
                }}
                className="mt-4"
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
