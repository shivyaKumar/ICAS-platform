"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface EvidenceUploaderProps {
  findingId: number;
  onUploadSuccess?: () => void;
}

export default function EvidenceUploader({ findingId, onUploadSuccess }: EvidenceUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      const res = await fetch(`/api/evidence/upload/${findingId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();
      if (onUploadSuccess) onUploadSuccess();
    } catch {
      console.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-sm text-gray-700"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={4}  //
        className="border border-gray-300 w-full rounded-md text-sm p-2 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
      />
      <Button variant={"secondary"} size={"sm"}
        onClick={handleUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Save"}
      </Button>
    </div>
  );
}
