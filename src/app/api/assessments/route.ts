import { NextResponse } from "next/server";

// -------------------------
// In-memory mock for dev
// -------------------------
type Control = {
  id: string;
  name: string;
  description?: string;
  status: "Compliant" | "Non-Compliant" | "Pending";
  notes?: string;
  evidenceFiles?: string[];
};

type Assessment = {
  id: string;
  framework: string;
  division: string;
  owner?: string;
  assessmentDate?: string;
  status: "Assigned" | "Submitted" | "Changes Requested" | "Completed" | string;
  controls: Control[];
};

const mockData: Assessment[] = [
  {
    id: "101",
    framework: "ISO 27001",
    division: "IT",
    status: "Assigned",
    controls: [
      { id: "A.5.1", name: "Information security policies", status: "Pending", description: "Policies approved and communicated." },
      { id: "A.6.1", name: "Organization of information security", status: "Pending" },
    ],
  },
  {
    id: "102",
    framework: "NIST CSF",
    division: "Finance",
    status: "Changes Requested",
    controls: [
      { id: "ID.AM-1", name: "Asset management", status: "Pending" },
    ],
  },
  {
    id: "103",
    framework: "GDPR",
    division: "HR",
    status: "Completed",
    controls: [
      { id: "Art.30", name: "Records of processing activities", status: "Compliant" },
    ],
  },
];

function json(data: unknown, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

// List or detail
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const status = url.searchParams.get("status");

    if (id) {
      const item = mockData.find((a) => a.id === id);
      if (!item) return json({ success: false, message: "Not found" }, 404);
      return json(item);
    }

    let list = [...mockData];
    if (status) list = list.filter((a) => String(a.status) === status);
    return json(list);
  } catch (err) {
    console.error("Mock GET error:", err);
    return json({ success: false, message: "Failed to fetch assessments" }, 500);
  }
}

// Create or submit
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body && body.action === "submit" && body.id) {
      const idx = mockData.findIndex((a) => a.id === String(body.id));
      if (idx === -1) return json({ success: false, message: "Not found" }, 404);
      mockData[idx].status = "Submitted";
      return json({ success: true, message: "Submitted" });
    }

    const { framework, division, owner, assessmentDate } = body || {};
    if (!framework || !division) {
      return json({ success: false, message: "framework and division are required" }, 400);
    }
    const id = Date.now().toString();
    mockData.unshift({ id, framework, division, owner, assessmentDate, status: "Pending", controls: [] });
    return json({ success: true, id });
  } catch (err) {
    console.error("Mock POST error:", err);
    return json({ success: false, message: "Failed to process request" }, 500);
  }
}

// Save progress
export async function PUT(req: Request) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) return json({ success: false, message: "id is required" }, 400);

    const body = await req.json().catch(() => ({}));
    const { controls } = body || {};
    const item = mockData.find((a) => a.id === id);
    if (!item) return json({ success: false, message: "Not found" }, 404);
    if (Array.isArray(controls)) item.controls = controls;
    return json({ success: true });
  } catch (err) {
    console.error("Mock PUT error:", err);
    return json({ success: false, message: "Failed to save" }, 500);
  }
}
