"use client";

import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Hard-coded API base for local dev to ensure requests hit the .NET API
const API = "http://localhost:5275";
console.log("API base =", API);

// ↑ NEW: type for list rendering
type FrameworkDto = { id: number; name: string; version?: string | null; controlCount: number };

export default function FrameworksPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // ↑ NEW: list state
  const [items, setItems] = useState<FrameworkDto[]>([]);

  const pickFile = () => fileInputRef.current?.click();

  // ↑ NEW: initial fetch of frameworks list (robust parse + logging)
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`${API}/api/frameworks`, {
          // no credentials for a public GET – avoids CORS-with-credentials requirements
          method: "GET",
          mode: "cors",
          headers: { Accept: "application/json" },
        });

        const text = await r.text();
        console.log("GET /api/frameworks raw:", text);

        if (!r.ok) {
          console.warn("GET /api/frameworks failed:", r.status, r.statusText);
          setItems([]);
          return;
        }

        let data: unknown = [];
        try { data = JSON.parse(text); } catch (e) {
          console.error("JSON parse failed:", e);
          setItems([]);
          return;
        }

        if (Array.isArray(data)) setItems(data as FrameworkDto[]);
        else {
          console.warn("Unexpected payload:", data);
          setItems([]);
        }
      } catch (e) {
        console.error("GET /api/frameworks error:", e);
        setItems([]);
      }
    })();
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      alert("Only .xlsx Excel files are allowed.");
      event.target.value = "";
      return;
    }

    try {
      setLoading(true);
      setMsg("");
      const fd = new FormData();
      fd.append("file", file);

      // --- changed: include replace/dryRun and surface real error text ---
      const replace = true;
      const dryRun = false;

      const res = await fetch(
        `${API}/api/frameworks/import?replace=${replace}&dryRun=${dryRun}`,
        {
          method: "POST",
          body: fd,
          credentials: "include",
        }
      );

      const text = await res.text();
      let data: any = null;
      try { data = JSON.parse(text); } catch { /* non-JSON error */ }

      if (!res.ok) {
        setMsg(`Error ${res.status}: ${text || res.statusText}`);
        return;
      }

      // ↓ NEW: append created item to the top of the list if API returned it
      if (data?.created) {
        setItems(prev => [data.created as FrameworkDto, ...prev]);
      } else {
        // fallback: refetch list
        try {
          const r = await fetch(`${API}/api/frameworks`, { credentials: "include" });
          if (r.ok) {
            const list = (await r.json()) as FrameworkDto[];
            setItems(list);
          }
        } catch {}
      }

      // Keep your message, but read properties from either camelCase or PascalCase
      const s = data?.summary ?? {};
      const fwName = s.frameworkName ?? s.FrameworkName ?? "Framework";
      const ver = s.version ?? s.Version ?? "—";
      const count = s.controlsFound ?? s.ControlsFound ?? "?";
      setMsg(`Imported: ${fwName} v${ver} (${count} controls)`);
    } finally {
      setLoading(false);
      event.target.value = ""; // allow re-picking the same file
    }
  };

  const handleDownloadSample = async () => {
    const r = await fetch(`${API}/api/frameworks/download-sample`, { credentials: "include" });
    if (!r.ok) {
      setMsg("Sample not found or unauthorized.");
      return;
    }
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Framework_Sample.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-3 sm:px-4 md:px-6 py-4 space-y-6 min-w-0">
      {/* Page Header */}
      <div className="flex items-center justify-between min-w-0">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Frameworks</h2>
          <p className="text-sm md:text-base text-gray-600">
            Manage compliance frameworks. Upload new frameworks as needed in the future.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={handleDownloadSample}>
          Download Sample
        </Button>
      </div>

      {/* Upload Section */}
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

          {msg && <p className="text-sm">{msg}</p>}
        </CardContent>
      </Card>

      {/* Available Frameworks */}
      <Card className="shadow-md border rounded-lg hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base md:text-lg">Available Frameworks</CardTitle>
        </CardHeader>
        <CardContent className="min-w-0">
          {items.length === 0 ? (
            <p className="text-gray-500 italic text-sm md:text-base">
              No frameworks yet.
            </p>
          ) : (
            <ul className="divide-y">
              {items.map(f => (
                <li key={f.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{f.name}</div>
                    <div className="text-xs text-gray-500">Controls: {f.controlCount}</div>
                  </div>
                  <span className="text-xs rounded-full border px-2 py-1">
                    v{f.version ?? "—"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
