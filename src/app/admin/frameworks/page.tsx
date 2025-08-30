"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // ✅ using your cva-based Button

export default function FrameworksPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      return;
    }

    // Later: send file to backend
    alert(`CSV uploaded: ${file.name}`);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click(); // trigger hidden input
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold">Frameworks</h2>
        <p className="text-gray-600">
          Manage compliance frameworks. Upload new frameworks as needed in the future.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="shadow-md border rounded-lg">
        <CardHeader>
          <CardTitle>Upload Framework</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 py-10">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button
            variant="primary"
            size="default"
            onClick={handleUploadClick}
          >
            Upload CSV
          </Button>
          <p className="text-sm text-gray-600 text-center max-w-md">
            Only CSV files are supported for uploading frameworks.
          </p>
        </CardContent>
      </Card>

      {/* Placeholder for Uploaded Frameworks */}
      <Card className="shadow-md border rounded-lg">
        <CardHeader>
          <CardTitle>Available Frameworks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 italic">No frameworks uploaded yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
