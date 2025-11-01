"use client";

import { useEffect, useRef, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import BackButton from "@/components/ui/BackButton";

const API = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5275").replace(/\/+$/, "");
console.log("API base =", API);

type FrameworkDto = {
  id: number;
  name: string;
  version?: string | null;
  controlCount: number;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (record: Record<string, unknown>, keys: string[], fallback = "") => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return fallback;
};

const readNumber = (record: Record<string, unknown>, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = record[key];
    const parsed = typeof value === "number" ? value : Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const downloadFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function FrameworksPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<FrameworkDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast(); // added toast hook

  const fetchFrameworks = async () => {
    try {
      const response = await fetch(`${API}/api/frameworks`, {
        method: "GET",
        mode: "cors",
        headers: { Accept: "application/json" },
        credentials: "include",
      });

      const text = await response.text();
      if (!response.ok) {
        console.warn("GET /api/frameworks failed:", response.status, response.statusText);
        setItems([]);
        setMessage(text || "Unable to load frameworks.");
        return;
      }

      let payload: unknown = [];
      try {
        payload = JSON.parse(text);
      } catch (error) {
        console.error("JSON parse failed:", error);
        setItems([]);
        setMessage("Unexpected response when loading frameworks.");
        return;
      }

      if (Array.isArray(payload)) {
        setItems(payload as FrameworkDto[]);
        setMessage(null);
      } else if (isRecord(payload) && Array.isArray(payload.items)) {
        setItems(payload.items as FrameworkDto[]);
        setMessage(null);
      } else {
        console.warn("Unexpected payload:", payload);
        setItems([]);
        setMessage("Framework list is empty.");
      }
    } catch (error) {
      console.error("GET /api/frameworks error:", error);
      setItems([]);
      setMessage("Unable to reach framework service.");
    }
  };

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const pickFile = () => fileInputRef.current?.click();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // toast
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      toast({
        title: "Invalid File Type",
        description: "Only .xlsx Excel files are allowed.",
        variant: "destructive",
      });
      event.target.value = "";
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      const form = new FormData();
      form.append("file", file);

      const replace = true;
      const dryRun = false;

      const response = await fetch(
        `${API}/api/frameworks/import?replace=${replace}&dryRun=${dryRun}`,
        {
          method: "POST",
          body: form,
          credentials: "include",
        }
      );

      const text = await response.text();
      let payload: unknown = null;
      try {
        payload = JSON.parse(text);
      } catch {
        // Non JSON payload
      }

      if (!response.ok) {
        setMessage(text || response.statusText || "Failed to upload framework.");
        toast({
          title: "Upload Failed",
          description: "Ensure your Excel file is correctly formatted and try again.",
          variant: "destructive",
        });
        return;
      }

      const record = isRecord(payload) ? payload : {};
      const created =
        isRecord(record.created)
          ? (record.created as Record<string, unknown>)
          : null;

      if (created) {
        const newItem: FrameworkDto = {
          id: readNumber(created, ["id"], 0),
          name: readString(created, ["name"], "Framework"),
          version: readString(created, ["version"], "") || null,
          controlCount: readNumber(created, ["controlCount"], 0),
        };
        setItems((prev) => [newItem, ...prev.filter((item) => item.id !== newItem.id)]);
      } else {
        await fetchFrameworks();
      }

      const summary =
        isRecord(record.summary)
          ? (record.summary as Record<string, unknown>)
          : isRecord(record.Summary)
          ? (record.Summary as Record<string, unknown>)
          : null;

      const frameworkName = summary
        ? readString(summary, ["frameworkName", "FrameworkName"], "Framework")
        : "Framework";
      const versionValue = summary
        ? readString(summary, ["version", "Version"], "")
        : "";
      const controlsFound = summary
        ? readNumber(summary, ["controlsFound", "ControlsFound"], 0)
        : 0;

      const displayVersion = versionValue || "N/A";
      setMessage(`Imported: ${frameworkName} v${displayVersion} (${controlsFound} controls)`);

      // toast success
      toast({
        title: "Framework Imported",
        description: `${frameworkName} v${displayVersion} (${controlsFound} controls)`,
        variant: "success",
      });
    } catch (error) {
      console.error("Upload framework failed", error);
      setMessage("Failed to upload framework.");
      toast({
        title: "Upload Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await fetch(`${API}/api/frameworks/download-sample`, {
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        setMessage(text || "Sample not found or unauthorized.");
        toast({
          title: "Download Failed",
          description: "Unable to find or download sample file.",
          variant: "destructive",
        });
        return;
      }

      const blob = await response.blob();
      downloadFile(blob, "Framework_Sample.xlsx");

    } catch (error) {
      console.error("Download sample failed", error);
      setMessage("Unable to download sample file.");
      toast({
        title: "Download Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFramework = async (framework: FrameworkDto) => {
    try {
      const response = await fetch(`${API}/api/frameworks/${framework.id}/download`, {
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        setMessage(text || `Failed to download ${framework.name}.`);
        toast({
          title: "Download Failed",
          description: `Failed to download ${framework.name}.`,
          variant: "destructive",
        });
        return;
      }

      const blob = await response.blob();
      const filename = `${framework.name.replace(/\s+/g, "_") || "framework"}.xlsx`;
      downloadFile(blob, filename);

      toast({
        title: "Download Started",
        description: `${framework.name} is being downloaded.`,
        variant: "success",
      });
    } catch (error) {
      console.error("Download framework failed", error);
      setMessage(`Unable to download ${framework.name}.`);
      toast({
        title: "Download Failed",
        description: `Unable to download ${framework.name}.`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteFramework = async (id: number) => {
    try {
      const response = await fetch(`${API}/api/frameworks/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const text = await response.text();
        setMessage(text || "Failed to delete framework.");
        toast({
          title: "Deletion Failed",
          description: "Could not delete this framework.",
          variant: "destructive",
        });
        return;
      }

      setItems((prev) => prev.filter((framework) => framework.id !== id));
      setMessage("Framework deleted successfully.");
      toast({
        title: "Framework Deleted",
        description: "The framework was successfully deleted.",
        variant: "success",
      });
    } catch (error) {
      console.error("Delete framework failed", error);
      setMessage("Unable to delete framework at this time.");
      toast({
        title: "Deletion Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-0 space-y-6 min-w-0">
      <div className="flex items-center justify-between min-w-0">
        <div>
          <BackButton href="/admin/dashboard" />
          <h2 className="text-2xl md:text-3xl font-bold">Frameworks</h2>
          <p className="text-sm md:text-base text-gray-600">
            Manage compliance frameworks. Upload new frameworks as needed in the future.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownloadSample}>
          Download Sample
        </Button>
      </div>

      <Card className="shadow-md border rounded-lg hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Upload Framework</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4 py-6 sm:py-8">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handleFileSelect}
          />

          <Button size="sm" onClick={pickFile} disabled={loading}>
            {loading ? "Uploading..." : "Upload Excel"}
          </Button>

          <p className="text-xs md:text-sm text-gray-600 text-center max-w-md">
            Only <b>.xlsx</b> files are supported for uploading frameworks. Download the sample template before uploading.
          </p>

          {message && <p className="text-sm text-center text-gray-700">{message}</p>}
        </CardContent>
      </Card>

      <Card className="shadow-md border rounded-lg hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Available Frameworks</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {items.length === 0 ? (
            <p className="text-gray-500 italic text-sm md:text-base">No frameworks yet.</p>
          ) : (
            <ul className="divide-y">
              {items.map((framework) => (
                <li
                  key={framework.id}
                  className="py-3 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div>
                    <div className="font-medium">{framework.name}</div>
                    <div className="text-xs text-gray-500">
                      Controls: {framework.controlCount}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs rounded-full border px-2 py-1">
                      v{framework.version ?? "N/A"}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownloadFramework(framework)}
                    >
                      Download
                    </Button>

                    {/* AlertDialog */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Framework Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this framework? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteFramework(framework.id)}
                            className="bg-red-600 text-white font-semibold hover:bg-red-700"
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
