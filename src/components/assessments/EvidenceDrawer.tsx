"use client";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import EvidenceUploader from "./EvidenceUploader";
import { X, FolderOpen } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { formatAppDate } from "@/lib/date";

interface EvidenceDrawerProps {
  findingId: number;
  onUploadSuccess?: () => void;
  isCompleted?: boolean;
}

interface Evidence {
  id: number;
  fileUrl: string;
  description?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export default function EvidenceDrawer({
  findingId,
  onUploadSuccess,
  isCompleted = false,
}: EvidenceDrawerProps) {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvidences = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/evidence/${findingId}`);
      if (res.ok) {
        const data: Evidence[] = await res.json();
        setEvidences(data);
      }
    } catch (err) {
      console.warn("Error fetching evidences:", err);
    } finally {
      setLoading(false);
    }
  }, [findingId]);

  useEffect(() => {
    fetchEvidences();
  }, [fetchEvidences]);

  const cleanFileName = (fileUrl: string): string => {
    const rawName = decodeURIComponent(fileUrl.split("/").pop() || "Evidence File");
    return rawName.replace(/^[0-9a-fA-F-]{8}(-[0-9a-fA-F-]{4}){3}-[0-9a-fA-F-]{12}_/, "");
  };

  return (
    <Drawer>
      {/* Drawer always opens — even when closed */}
      <DrawerTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-3 py-1.5 rounded-none border border-gray-300 transition-all flex items-center gap-1"
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Evidence
        </Button>
      </DrawerTrigger>

      <DrawerContent
        className="sm:w-[500px] right-0 ml-auto h-screen flex flex-col 
                   bg-white border-l border-gray-200 shadow-xl"
      >
        {/* Header */}
        <DrawerHeader className="border-b bg-gray-50 px-6 py-3 flex justify-between items-center sticky top-0 z-10">
          <DrawerTitle className="text-base font-semibold text-gray-900">
            Evidence
          </DrawerTitle>
          <DrawerClose asChild>
            <button
              className="text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-scroll px-6 py-6 space-y-6 text-sm text-gray-800">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              Uploaded Evidence
            </h4>

            {loading ? (
              <p className="text-xs text-gray-500 italic">Loading evidence...</p>
            ) : evidences.length === 0 ? (
              <p className="text-xs text-gray-500 italic">
                No evidence uploaded yet.
              </p>
            ) : (
              <div className="space-y-3">
                {evidences.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="p-3 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 transition"
                  >
                    <a
                      href={`/api/evidence/download/${evidence.id}`}
                      className="text-blue-600 text-sm font-medium hover:underline break-words"
                      download
                    >
                      {cleanFileName(evidence.fileUrl)}
                    </a>

                    {evidence.description && (
                      <p className="text-xs text-gray-700 mt-1">
                        {evidence.description}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-1">
                      {evidence.uploadedBy
                        ? `Uploaded by ${evidence.uploadedBy}`
                        : "Uploader unknown"}{" "}
                      • {formatAppDate(evidence.uploadedAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/*Upload section only visible if assessment not closed */}
          {!isCompleted ? (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Upload new evidence
              </h4>
              <EvidenceUploader
                findingId={findingId}
                onUploadSuccess={async () => {
                  await fetchEvidences();
                  onUploadSuccess?.();
                }}
              />
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">
              This assessment is closed. Evidence uploads are disabled, but you
              can still view existing files.
            </p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
