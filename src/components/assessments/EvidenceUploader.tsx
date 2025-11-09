"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface EvidenceUploaderProps {
  findingId: number;
  onUploadSuccess?: () => void;
  isCompleted?: boolean;
}

export default function EvidenceUploader({
  findingId,
  onUploadSuccess,
  isCompleted = false,
}: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast(); 

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file before uploading.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    // sends formdata
    try {
      const res = await fetch(`/api/evidence/upload/${findingId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      toast({
        description: "Your file has been successfully uploaded.",
        variant: "success",
      });

      // Refresh parent component (EvidenceDrawer)
      onUploadSuccess?.();
      setFile(null);
      setDescription("");
    } catch (err) {
      console.error("Error uploading evidence:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Disable all input fields when assessment is completed */}
      <input
        type="file"
        disabled={isCompleted}
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className={`block w-full text-sm text-gray-700 ${
          isCompleted ? "opacity-60 cursor-not-allowed" : ""
        }`}
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={4}
        disabled={isCompleted}
        className={`border border-gray-300 w-full rounded-md text-sm p-2 
          focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none
          ${isCompleted ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
      />

      {!isCompleted ? (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Save"}
        </Button>
      ) : (
        <p className="text-xs text-gray-500 italic">
          This assessment is completed. Evidence upload is disabled.
        </p>
      )}
    </div>
  );
}
