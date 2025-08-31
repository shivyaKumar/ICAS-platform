"use client";

import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function FrameworksPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
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
    <div className="px-3 sm:px-4 md:px-6 py-4 space-y-6 min-w-0">
      {/* Page Header */}
      <div className="min-w-0">
        <h2 className="text-2xl md:text-3xl font-bold">Frameworks</h2>
        <p className="text-sm md:text-base text-gray-600">
          Manage compliance frameworks. Upload new frameworks as needed in the future.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="shadow-md border rounded-lg hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Upload Framework</CardTitle>
        </CardHeader>
        <CardContent
          className="
            flex flex-col items-center justify-center gap-4
            py-6 sm:py-8
          "
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button variant="primary" size="sm" onClick={handleUploadClick}>
            Upload CSV
          </Button>

          <p className="text-xs md:text-sm text-gray-600 text-center max-w-md">
            Only CSV files are supported for uploading frameworks.
          </p>
        </CardContent>
      </Card>

      {/* Available Frameworks */}
      <Card className="shadow-md border rounded-lg hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Available Frameworks</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {/* Placeholder / empty state */}
          <p className="text-gray-500 italic text-sm md:text-base">
            No frameworks uploaded yet.
          </p>

          {/* 
            When you have data, render it like this:
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {frameworks.map(fw => (
                <div key={fw.id} className="border rounded-md px-3 py-2 bg-white">
                  <div className="font-medium truncate">{fw.name}</div>
                  <div className="text-xs text-gray-500 truncate">{fw.version}</div>
                </div>
              ))}
            </div>
          */}
        </CardContent>
      </Card>
    </div>
  );
}
